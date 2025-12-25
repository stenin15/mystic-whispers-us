import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  name: string;
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email }: WelcomeEmailRequest = await req.json();
    
    console.log(`Sending welcome email to ${email} for ${name}`);

    if (!email || !name) {
      throw new Error("Email and name are required");
    }

    const { data, error } = await resend.emails.send({
      from: "Madame Aurora <onboarding@resend.dev>",
      to: [email],
      subject: "✨ Sua Consulta Espiritual Foi Iniciada",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #0f0a1a; font-family: 'Georgia', serif;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #d4af37; font-size: 28px; margin: 0;">✨ Madame Aurora ✨</h1>
              <p style="color: #9b87f5; font-size: 14px; margin-top: 5px;">Leitura de Mão & Orientação Espiritual</p>
            </div>
            
            <!-- Main Content -->
            <div style="background: linear-gradient(135deg, #1a1225 0%, #2d1f42 100%); border-radius: 16px; padding: 30px; border: 1px solid #9b87f580;">
              
              <h2 style="color: #f4e6ff; font-size: 22px; margin-top: 0;">
                Olá, ${name}! 🌙
              </h2>
              
              <p style="color: #d4c4e3; font-size: 16px; line-height: 1.6;">
                Que alegria receber você em minha consulta espiritual. Sinto que você chegou até mim por um motivo muito especial.
              </p>
              
              <p style="color: #d4c4e3; font-size: 16px; line-height: 1.6;">
                Sua jornada de autodescoberta já começou. Enquanto você responde às próximas perguntas, estarei me conectando com sua energia e preparando uma leitura única e profunda para você.
              </p>
              
              <div style="background: #9b87f520; border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 3px solid #9b87f5;">
                <p style="color: #f4e6ff; font-size: 14px; margin: 0; font-style: italic;">
                  "As estrelas já se alinharam para revelar os segredos que sua mão guarda. Prepare seu coração para receber mensagens do universo."
                </p>
              </div>
              
              <p style="color: #d4c4e3; font-size: 16px; line-height: 1.6;">
                Complete o questionário com sinceridade e abertura. Quanto mais você se conectar com suas respostas, mais precisa será sua leitura.
              </p>
              
              <!-- CTA Button -->
              <div style="text-align: center; margin-top: 30px;">
                <p style="color: #d4af37; font-size: 18px; margin: 0;">
                  ⭐ Sua consulta está em andamento ⭐
                </p>
              </div>
              
            </div>
            
            <!-- Footer -->
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #9b87f530;">
              <p style="color: #8b7aa5; font-size: 12px; margin: 0;">
                Com amor e luz,<br>
                <strong style="color: #d4af37;">Madame Aurora</strong>
              </p>
              <p style="color: #6b5a85; font-size: 11px; margin-top: 15px;">
                Este email foi enviado porque você iniciou uma consulta espiritual.
              </p>
            </div>
            
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error("Resend API error:", error);
      return new Response(JSON.stringify({ success: true, emailSent: false, reason: error.message }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log("Email sent successfully:", data);

    return new Response(JSON.stringify({ success: true, emailSent: true, data }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Email sending error:", errorMessage);
    return new Response(
      JSON.stringify({ success: true, emailSent: false, reason: errorMessage }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
