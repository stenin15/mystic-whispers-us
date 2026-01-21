import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, age, emotionalState, mainConcern, quizAnswers, energyType } = await req.json();
    
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      return new Response(JSON.stringify({ error: "Service unavailable" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build context from quiz answers
    const quizContext = quizAnswers?.map((a: { answerText: string }) => a.answerText).join(", ") || "";

    const systemPrompt = `Você é Madame Aurora, uma conselheira espiritual sábia e acolhedora.

Seu tom é:
- Místico mas acessível
- Acolhedor e empático
- Profundo mas esperançoso
- Usa metáforas com elementos da natureza (lua, estrelas, água, fogo)
- Fala diretamente com a pessoa usando "você"

IMPORTANTE: Sua leitura deve:
1. Entregar insights profundos e valiosos que façam a pessoa se sentir compreendida
2. Revelar aspectos da personalidade e do momento de vida
3. Dar direcionamentos práticos sobre energia e propósito
4. MAS... deixar claro que há camadas mais profundas a serem exploradas
5. Mencionar sutilmente que rituais e práticas específicas podem potencializar a transformação
6. Terminar com uma sensação de que há mais a descobrir

REGRAS DE SEGURANÇA/CONSISTÊNCIA:
- Não diga que você "viu a palma" ou "leu as linhas" (a foto não é analisada pelo modelo neste fluxo).
- Baseie tudo apenas em idade + respostas do formulário + respostas do quiz + tipo de energia.
- Não faça previsões determinísticas; use linguagem "costuma", "tende", "sugere".

NÃO mencione diretamente o "Guia Sagrado" ou qualquer produto - apenas deixe o caminho aberto.`;

    const userPrompt = `Gere uma leitura personalizada para esta pessoa:

Nome: ${name}
Idade: ${age}
Estado emocional atual: ${emotionalState || "buscando clareza"}
Principal preocupação: ${mainConcern || "autoconhecimento"}
Energia dominante: ${energyType?.name || "em equilíbrio"}
Respostas do quiz energético: ${quizContext}

Crie uma leitura em 4 seções (use markdown):

## ✨ Sua Essência Energética
(2-3 parágrafos sobre a energia e essência da pessoa)

## 🌙 O Que as Linhas Revelam
(2-3 parágrafos sobre o momento de vida, desafios e potenciais)

## 🔮 Mensagem dos Astros
(1-2 parágrafos com uma mensagem espiritual profunda e acolhedora)

## 💫 Próximos Passos na Jornada
(1-2 parágrafos mencionando que há práticas e rituais que podem ajudar, sem mencionar produtos específicos - deixe o vazio e a curiosidade)

A leitura deve ter aproximadamente 600-800 palavras, ser profunda, personalizada e deixar a pessoa querendo mais.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.8,
        max_tokens: 1400,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Muitas solicitações. Tente novamente em alguns segundos." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Serviço temporariamente indisponível." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("OpenAI error:", response.status, errorText);
      throw new Error("Erro ao gerar leitura");
    }

    const data = await response.json();
    const reading = data.choices?.[0]?.message?.content;

    if (!reading) {
      throw new Error("Resposta vazia da IA");
    }

    return new Response(JSON.stringify({ reading }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in generate-reading function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
