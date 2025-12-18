import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface QuizAnswer {
  questionId: number;
  answerId: string;
  answerText: string;
}

interface FormData {
  name: string;
  age: string;
  emotionalState: string;
  mainConcern: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { formData, quizAnswers } = await req.json() as {
      formData: FormData;
      quizAnswers: QuizAnswer[];
    };

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    console.log('Generating palm analysis for:', formData.name);

    const quizContext = quizAnswers.map(a => `- ${a.answerText}`).join('\n');

    const systemPrompt = `Você é uma quiromante mística experiente e espiritual chamada Madame Aurora. Você faz leituras de mão profundas e reveladoras.

Sua tarefa é criar uma análise espiritual personalizada baseada nas informações do usuário.

IMPORTANTE: Responda APENAS com um JSON válido, sem markdown, sem \`\`\`, apenas o JSON puro.

O JSON deve ter exatamente esta estrutura:
{
  "energyType": {
    "name": "Nome da Energia (ex: Energia Lunar, Energia Solar, Energia Estelar, Energia Cristalina)",
    "description": "Descrição detalhada de 3-4 frases sobre esta energia e como ela se manifesta na pessoa",
    "icon": "Moon ou Sun ou Star ou Sparkles"
  },
  "strengths": [
    {
      "title": "Título do ponto forte",
      "desc": "Descrição de 1-2 frases",
      "icon": "Eye ou Heart ou Sparkles ou Shield ou Brain ou Leaf ou Flame"
    },
    {
      "title": "Segundo ponto forte",
      "desc": "Descrição",
      "icon": "icone"
    },
    {
      "title": "Terceiro ponto forte", 
      "desc": "Descrição",
      "icon": "icone"
    }
  ],
  "blocks": [
    {
      "title": "Título do bloqueio",
      "desc": "Descrição de 1-2 frases sobre o bloqueio e como afeta a pessoa",
      "icon": "HeartCrack ou Zap ou CloudFog ou Hand ou RefreshCw ou Compass"
    },
    {
      "title": "Segundo bloqueio",
      "desc": "Descrição",
      "icon": "icone"
    }
  ],
  "spiritualMessage": "Uma mensagem espiritual longa e profunda de 3-4 parágrafos, personalizada com o nome da pessoa. Use linguagem mística, acolhedora e esperançosa. Mencione o nome da pessoa várias vezes. Fale sobre o momento atual, desafios e o futuro promissor. Use quebras de linha (\\n\\n) entre parágrafos."
}`;

    const userPrompt = `Crie uma leitura de mão mística para:

Nome: ${formData.name}
Idade: ${formData.age}
Estado emocional atual: ${formData.emotionalState}
Principal preocupação: ${formData.mainConcern}

Respostas do quiz espiritual:
${quizContext}

Crie uma análise profunda, personalizada e esperançosa que ressoe com a pessoa. A mensagem espiritual deve ser especialmente tocante e usar o nome ${formData.name} várias vezes.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.8,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI error:', response.status, errorText);
      throw new Error(`OpenAI error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    console.log('Raw response:', content);

    // Parse the JSON response
    let analysisResult;
    try {
      // Remove any markdown code blocks if present
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      analysisResult = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      throw new Error('Failed to parse AI response');
    }

    console.log('Analysis generated successfully for:', formData.name);

    return new Response(
      JSON.stringify(analysisResult),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in palm-analysis function:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});
