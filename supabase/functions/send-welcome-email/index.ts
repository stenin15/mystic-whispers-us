import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const ALLOWED_ORIGINS = [
  "https://auroramadame.com",
  "https://www.auroramadame.com",
  "https://madameaurora.blog",
  "https://www.madameaurora.blog",
  "https://madame-aurora.com",
  "https://www.madame-aurora.com",
  "https://madam-aurora.co",
  "https://www.madam-aurora.co",
  "http://localhost:5173",
  "http://localhost:8080",
  "http://localhost:8910",
];

const isAllowedOrigin = (origin: string | null): boolean => {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  if (origin.endsWith(".vercel.app")) return true;
  return false;
};

const getCorsHeaders = (origin: string | null): Record<string, string> => {
  const allowedOrigin = isAllowedOrigin(origin) ? origin! : ALLOWED_ORIGINS[0];

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };
};

interface WelcomeEmailRequest {
  name: string;
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  // Validate origin for actual requests
  if (!isAllowedOrigin(origin)) {
    return new Response(
      JSON.stringify({ error: "Origin not allowed" }),
      { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    // Optional: allow changing sender without code changes (helps during verification/testing)
    const RESEND_FROM_EMAIL =
      Deno.env.get("RESEND_FROM_EMAIL") ?? "Madame Aurora <onboarding@resend.dev>";
    
    if (!RESEND_API_KEY) {
      return new Response(
        JSON.stringify({ success: false, emailSent: false, reason: "Service unavailable" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resend = new Resend(RESEND_API_KEY);
    
    const { name, email }: WelcomeEmailRequest = await req.json();
    
    // Validate inputs
    if (!name || typeof name !== "string" || !email || typeof email !== "string") {
      return new Response(
        JSON.stringify({ success: false, emailSent: false, reason: "Invalid input" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email) || email.length > 255) {
      return new Response(
        JSON.stringify({ success: false, emailSent: false, reason: "Invalid email" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Sanitize name for use in HTML
    const sanitizedName = name.replace(/[<>{}]/g, "").trim().substring(0, 100);

    const { data, error } = await resend.emails.send({
      from: RESEND_FROM_EMAIL,
      to: [email],
      subject: "✨ Your reading has started",
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
              <p style="color: #9b87f5; font-size: 14px; margin-top: 5px;">Palm Reading & Intuitive Guidance</p>
            </div>
            
            <!-- Main Content -->
            <div style="background: linear-gradient(135deg, #1a1225 0%, #2d1f42 100%); border-radius: 16px; padding: 30px; border: 1px solid #9b87f580;">
              
              <h2 style="color: #f4e6ff; font-size: 22px; margin-top: 0;">
                Hi, ${sanitizedName}. 🌙
              </h2>
              
              <p style="color: #d4c4e3; font-size: 16px; line-height: 1.6;">
                Thank you for starting your reading. Your answers help us personalize it with care and clarity.
              </p>
              
              <p style="color: #d4c4e3; font-size: 16px; line-height: 1.6;">
                Please continue the next few questions and upload your palm photo — it helps us complete your reading and notify you when it’s ready.
              </p>
              
              <div style="background: #9b87f520; border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 3px solid #9b87f5;">
                <p style="color: #f4e6ff; font-size: 14px; margin: 0; font-style: italic;">
                  "Take a slow breath. This is meant to support reflection — never to pressure you."
                </p>
              </div>
              
              <p style="color: #d4c4e3; font-size: 16px; line-height: 1.6;">
                For entertainment and self-reflection purposes.
              </p>
              
              <!-- CTA Button -->
              <div style="text-align: center; margin-top: 30px;">
                <p style="color: #d4af37; font-size: 18px; margin: 0;">
                  ⭐ Your reading is in progress ⭐
                </p>
              </div>
              
            </div>
            
            <!-- Footer -->
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #9b87f530;">
              <p style="color: #8b7aa5; font-size: 12px; margin: 0;">
                With care,<br>
                <strong style="color: #d4af37;">Madame Aurora</strong>
              </p>
              <p style="color: #6b5a85; font-size: 11px; margin-top: 15px;">
                This email was sent because you started a reading.
              </p>
            </div>
            
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return new Response(
        JSON.stringify({
          success: false,
          emailSent: false,
          reason: "Email delivery failed",
          details: typeof error === "object" && error !== null ? String((error as { message?: string }).message ?? error) : String(error),
        }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, emailSent: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("send-welcome-email error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        emailSent: false,
        reason: "An error occurred",
        details: error instanceof Error ? error.message : String(error),
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
