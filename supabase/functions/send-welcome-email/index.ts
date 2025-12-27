import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const rateState = new Map<string, { count: number; resetAt: number }>();

// Default allowed origins for this application
const DEFAULT_ALLOWED_ORIGINS = [
  "https://auroramadame.com",
  "https://www.auroramadame.com",
  "https://madameaurora.blog",
  "https://www.madameaurora.blog",
  "https://preview--madame-aurora-quiromancia.lovable.app",
  "https://madame-aurora-quiromancia.lovable.app",
  "https://madameaurorablog.lovable.app"
];

const getClientIp = (req: Request) => {
  const xff = req.headers.get("x-forwarded-for");
  if (!xff) return "unknown";
  return xff.split(",")[0].trim() || "unknown";
};

const isRateLimited = (ip: string, limit: number, windowMs: number) => {
  const now = Date.now();
  const entry = rateState.get(ip);
  if (!entry || entry.resetAt <= now) {
    rateState.set(ip, { count: 1, resetAt: now + windowMs });
    return false;
  }
  entry.count += 1;
  rateState.set(ip, entry);
  return entry.count > limit;
};

const getAllowedOrigin = (req: Request) => {
  const origin = req.headers.get("origin") ?? "";
  const envOrigins = (Deno.env.get("ALLOWED_ORIGINS") ?? "").trim();
  
  // Use environment variable if set, otherwise use defaults
  const allowedOrigins = envOrigins 
    ? envOrigins.split(",").map((s) => s.trim()).filter(Boolean)
    : DEFAULT_ALLOWED_ORIGINS;
  
  // If origin matches allowed list, return it
  if (origin && allowedOrigins.includes(origin)) {
    return origin;
  }
  
  // For development/preview environments with lovable.app domain
  if (origin && origin.includes(".lovable.app")) {
    return origin;
  }
  
  // Return first allowed origin as fallback (not wildcard)
  return allowedOrigins[0] ?? "https://madameaurora.blog";
};

const corsHeaders = (req: Request) => ({
  "Access-Control-Allow-Origin": getAllowedOrigin(req),
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
});

// Input validation helpers
const isValidString = (value: unknown, maxLength: number): value is string => {
  return typeof value === "string" && value.length > 0 && value.length <= maxLength;
};

const isValidEmail = (email: unknown): email is string => {
  if (typeof email !== "string") return false;
  // Basic email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

const sanitizeName = (name: string): string => {
  // Remove potential HTML/script injection, keep only safe characters
  return name.replace(/[<>{}]/g, "").trim().substring(0, 100);
};

interface WelcomeEmailRequest {
  name: string;
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders(req) });
  }

  try {
    const ip = getClientIp(req);
    if (isRateLimited(ip, 10, 60_000)) {
      console.log(`Rate limited IP: ${ip}`);
      return new Response(JSON.stringify({ success: false, emailSent: false, reason: "Rate limit exceeded" }), {
        status: 429,
        headers: { "Content-Type": "application/json", ...corsHeaders(req) },
      });
    }

    const rawBody = await req.text();
    if (rawBody.length > 8000) {
      return new Response(JSON.stringify({ success: false, emailSent: false, reason: "Payload too large" }), {
        status: 413,
        headers: { "Content-Type": "application/json", ...corsHeaders(req) },
      });
    }

    let parsedBody: { name: unknown; email: unknown };
    try {
      parsedBody = JSON.parse(rawBody);
    } catch {
      return new Response(JSON.stringify({ success: false, emailSent: false, reason: "Invalid JSON" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders(req) },
      });
    }

    const { name, email } = parsedBody;
    
    // Validate inputs
    if (!isValidString(name, 100)) {
      return new Response(JSON.stringify({ success: false, emailSent: false, reason: "Invalid name" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders(req) },
      });
    }

    if (!isValidEmail(email)) {
      return new Response(JSON.stringify({ success: false, emailSent: false, reason: "Invalid email format" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders(req) },
      });
    }

    // Sanitize name for use in HTML
    const sanitizedName = sanitizeName(name);
    
    console.log(`Sending welcome email to ${email} for ${sanitizedName}`);

    const { data, error } = await resend.emails.send({
      from: "Madame Aurora <contato@madameaurora.blog>",
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
                Olá, ${sanitizedName}! 🌙
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
        headers: { "Content-Type": "application/json", ...corsHeaders(req) },
      });
    }

    console.log("Email sent successfully:", data);

    return new Response(JSON.stringify({ success: true, emailSent: true, data }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders(req) },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Email sending error:", errorMessage);
    return new Response(
      JSON.stringify({ success: true, emailSent: false, reason: errorMessage }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders(req) },
      }
    );
  }
};

serve(handler);
