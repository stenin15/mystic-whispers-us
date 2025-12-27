import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

const isValidString = (value: unknown, maxLength: number): value is string => {
  return typeof value === "string" && value.length > 0 && value.length <= maxLength;
};

const sanitizeString = (str: string): string => {
  return str.replace(/[<>{}]/g, "").trim();
};

const validateFormData = (data: unknown): data is FormData => {
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;
  return (
    isValidString(d.name, 100) &&
    isValidString(d.age, 20) &&
    isValidString(d.emotionalState, 200) &&
    isValidString(d.mainConcern, 500)
  );
};

const validateQuizAnswers = (answers: unknown): answers is QuizAnswer[] => {
  if (!Array.isArray(answers)) return false;
  if (answers.length > 20) return false;
  return answers.every((a) => {
    if (!a || typeof a !== "object") return false;
    const answer = a as Record<string, unknown>;
    return (
      typeof answer.questionId === "number" &&
      answer.questionId >= 0 &&
      answer.questionId < 100 &&
      isValidString(answer.answerId, 50) &&
      isValidString(answer.answerText, 500)
    );
  });
};

serve(async (req) => {
  console.log("palm-analysis function called, method:", req.method);

  if (req.method === "OPTIONS") {
    console.log("Handling OPTIONS preflight request");
    return new Response("ok", { status: 200, headers: corsHeaders });
  }

  try {
    const rawBody = await req.text();
    if (rawBody.length > 8000) {
      return new Response(JSON.stringify({ error: "Payload too large" }), {
        status: 413,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let parsedBody: { formData: unknown; quizAnswers: unknown };
    try {
      parsedBody = JSON.parse(rawBody);
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { formData, quizAnswers } = parsedBody;

    if (!validateFormData(formData)) {
      return new Response(JSON.stringify({ error: "Invalid form data" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!validateQuizAnswers(quizAnswers)) {
      return new Response(JSON.stringify({ error: "Invalid quiz answers" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const sanitizedFormData: FormData = {
      name: sanitizeString(formData.name),
      age: sanitizeString(formData.age),
      emotionalState: sanitizeString(formData.emotionalState),
      mainConcern: sanitizeString(formData.mainConcern),
    };

    const sanitizedQuizAnswers: QuizAnswer[] = quizAnswers.map((a) => ({
      questionId: a.questionId,
      answerId: sanitizeString(a.answerId),
      answerText: sanitizeString(a.answerText),
    }));

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    
    if (!OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "OPENAI_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Generating palm analysis for:", sanitizedFormData.name);

    const quizContext = sanitizedQuizAnswers.map(a => `- ${a.answerText}`).join("\n");

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

Nome: ${sanitizedFormData.name}
Idade: ${sanitizedFormData.age}
Estado emocional atual: ${sanitizedFormData.emotionalState}
Principal preocupação: ${sanitizedFormData.mainConcern}

Respostas do quiz espiritual:
${quizContext}

Crie uma análise profunda, personalizada e esperançosa que ressoe com a pessoa. A mensagem espiritual deve ser especialmente tocante e usar o nome ${sanitizedFormData.name} várias vezes.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.8,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: `OpenAI error: ${response.status}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    console.log("Raw response:", content);

    let analysisResult;
    try {
      const cleanContent = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      analysisResult = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      return new Response(
        JSON.stringify({ error: "Failed to parse AI response" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Analysis generated successfully for:", sanitizedFormData.name);

    return new Response(
      JSON.stringify(analysisResult),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in palm-analysis function:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
