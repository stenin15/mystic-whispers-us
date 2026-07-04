import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const BASE = "https://madam-aurora.co";

const style = {
  bg: "#0f0a1a",
  card: "linear-gradient(135deg,#1a1225 0%,#2d1f42 100%)",
  border: "#9b87f550",
  gold: "#d4af37",
  purple: "#9b87f5",
  text: "#d4c4e3",
  heading: "#f4e6ff",
  muted: "#8b7aa5",
  btn: "background:#9b87f5;color:#0f0a1a;font-weight:700;border-radius:50px;padding:14px 36px;text-decoration:none;display:inline-block;font-size:16px;letter-spacing:.5px",
  btnGold: "background:#d4af37;color:#0f0a1a;font-weight:700;border-radius:50px;padding:14px 36px;text-decoration:none;display:inline-block;font-size:16px;letter-spacing:.5px",
};

function wrap(body: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:${style.bg};font-family:Georgia,serif">
<div style="max-width:580px;margin:0 auto;padding:40px 20px">
  <div style="text-align:center;margin-bottom:28px">
    <p style="color:${style.gold};font-size:22px;margin:0;letter-spacing:2px">✦ MADAM AURORA ✦</p>
    <p style="color:${style.purple};font-size:13px;margin:4px 0 0">Palm Reading · Intuitive Guidance</p>
  </div>
  <div style="background:${style.card};border-radius:18px;padding:32px;border:1px solid ${style.border}">
    ${body}
  </div>
  <div style="text-align:center;margin-top:28px;border-top:1px solid ${style.border};padding-top:20px">
    <p style="color:${style.muted};font-size:12px;margin:0">With love,<br><strong style="color:${style.gold}">Madam Aurora</strong></p>
    <p style="color:#4a3a62;font-size:11px;margin:10px 0 0">
      <a href="${BASE}/privacy" style="color:#4a3a62">Privacy</a> ·
      <a href="${BASE}/refund" style="color:#4a3a62">Refund Policy</a> ·
      <a href="${BASE}/contact" style="color:#4a3a62">Contact</a>
    </p>
  </div>
</div>
</body></html>`;
}

function email1(name: string, readingUrl: string): { subject: string; html: string } {
  return {
    subject: `✨ Your reading is ready, ${name}`,
    html: wrap(`
      <h2 style="color:${style.heading};font-size:24px;margin-top:0">Your palm has been read. 🌙</h2>
      <p style="color:${style.text};font-size:16px;line-height:1.7">
        ${name}, Aurora has finished analyzing your hand. Your personalized reading is waiting — the lines in your palm revealed something she wants you to know.
      </p>
      <div style="background:#9b87f515;border-radius:12px;padding:20px;margin:20px 0;border-left:3px solid ${style.purple}">
        <p style="color:${style.heading};font-size:14px;margin:0;font-style:italic">
          "Every line tells a story. Yours is more layered than most."
        </p>
        <p style="color:${style.muted};font-size:13px;margin:6px 0 0">— Aurora</p>
      </div>
      <div style="text-align:center;margin-top:28px">
        <a href="${readingUrl}" style="${style.btnGold}">Open My Reading →</a>
      </div>
      <p style="color:${style.muted};font-size:13px;text-align:center;margin-top:16px">
        Find a quiet moment. Your reading works best when you're present.
      </p>
    `),
  };
}

function email2(name: string, readingUrl: string): { subject: string; html: string } {
  return {
    subject: `${name}, did you see what Aurora found?`,
    html: wrap(`
      <h2 style="color:${style.heading};font-size:22px;margin-top:0">Still thinking about what I saw… 🔮</h2>
      <p style="color:${style.text};font-size:16px;line-height:1.7">
        ${name}, I've been thinking about your reading since it was completed. There's one thing I want to make sure you saw — the section on your <strong style="color:${style.gold}">love timing window</strong>.
      </p>
      <p style="color:${style.text};font-size:16px;line-height:1.7">
        Most people skip it. But the women who act on it experience a shift within weeks — not just in love, but in how they carry themselves.
      </p>
      <div style="background:#9b87f515;border-radius:12px;padding:20px;margin:20px 0">
        <p style="color:${style.heading};font-size:14px;margin:0">What your palm shows about love:</p>
        <ul style="color:${style.text};font-size:14px;line-height:1.8;margin:12px 0 0;padding-left:20px">
          <li>Your dominant emotional pattern in relationships</li>
          <li>The timing window Aurora detected</li>
          <li>What's been unconsciously blocking you</li>
        </ul>
      </div>
      <div style="text-align:center;margin-top:24px">
        <a href="${readingUrl}" style="${style.btn}">Continue My Reading →</a>
      </div>
    `),
  };
}

function email3(name: string): { subject: string; html: string } {
  const guideUrl = `${BASE}/oferta/guia-exclusivo`;
  return {
    subject: `The practice that changes everything, ${name}`,
    html: wrap(`
      <h2 style="color:${style.heading};font-size:22px;margin-top:0">What comes after the reading 📖</h2>
      <p style="color:${style.text};font-size:16px;line-height:1.7">
        ${name}, your reading showed you the patterns. But knowing a pattern isn't the same as shifting it.
      </p>
      <p style="color:${style.text};font-size:16px;line-height:1.7">
        That's why I created the <strong style="color:${style.gold}">Sacred Transformation Guide</strong> — a step-by-step ritual practice designed specifically for women whose palms reveal blocked heart lines.
      </p>
      <div style="background:${style.card};border-radius:12px;padding:20px;margin:20px 0;border:1px solid ${style.border}">
        <p style="color:${style.gold};font-size:14px;font-weight:700;margin:0 0 12px">What's inside:</p>
        <ul style="color:${style.text};font-size:14px;line-height:1.9;margin:0;padding-left:20px">
          <li>7-day ritual to clear energetic blocks</li>
          <li>Moon cycle alignment for timing decisions</li>
          <li>Daily affirmations tuned to your palm profile</li>
          <li>The "open hand" practice — 10 minutes that rewires emotional response</li>
        </ul>
      </div>
      <div style="background:#d4af3715;border-radius:10px;padding:16px;text-align:center;margin:20px 0;border:1px solid #d4af3740">
        <p style="color:${style.gold};font-size:18px;font-weight:700;margin:0">Only $27</p>
        <p style="color:${style.muted};font-size:13px;margin:4px 0 0">One-time · Instant download · 7-day guarantee</p>
      </div>
      <div style="text-align:center;margin-top:20px">
        <a href="${guideUrl}" style="${style.btnGold}">Get the Guide — $27 →</a>
      </div>
    `),
  };
}

function email4(name: string, readingUrl: string): { subject: string; html: string } {
  return {
    subject: `What other women are saying, ${name}`,
    html: wrap(`
      <h2 style="color:${style.heading};font-size:22px;margin-top:0">You're not doing this alone 🌺</h2>
      <p style="color:${style.text};font-size:16px;line-height:1.7">
        ${name}, thousands of women have sat with their Aurora reading. Here's what some of them shared:
      </p>
      ${["Rachel M., Seattle — \"I was skeptical. Then I read the timing section and started crying. It described exactly what I'd been feeling for 8 months.\"",
         "Jessica T., Austin — \"The patterns Aurora identified were things I'd never even said out loud. It felt like being truly seen.\"",
         "Maya R., NYC — \"I sent this to my sister. She got her reading done the next day. We both needed this.\""]
        .map(t => {
          const [author, quote] = t.split(" — ");
          return `<div style="background:#9b87f510;border-radius:12px;padding:18px;margin:14px 0;border-left:3px solid ${style.purple}">
            <p style="color:${style.text};font-size:14px;font-style:italic;margin:0">${quote}</p>
            <p style="color:${style.purple};font-size:12px;font-weight:700;margin:8px 0 0">— ${author}</p>
          </div>`;
        }).join("")}
      <p style="color:${style.text};font-size:15px;line-height:1.7;margin-top:20px">
        If you haven't finished your reading yet, now is a good time.
      </p>
      <div style="text-align:center;margin-top:20px">
        <a href="${readingUrl}" style="${style.btn}">Return to My Reading →</a>
      </div>
    `),
  };
}

function email5(name: string): { subject: string; html: string } {
  const sessionUrl = `${BASE}/sessao-aurora`;
  return {
    subject: `One last thing before I go, ${name}`,
    html: wrap(`
      <h2 style="color:${style.heading};font-size:22px;margin-top:0">A private word, ${name} 🌙</h2>
      <p style="color:${style.text};font-size:16px;line-height:1.7">
        Your reading gave you clarity. But clarity alone doesn't create change — action does.
      </p>
      <p style="color:${style.text};font-size:16px;line-height:1.7">
        That's why I offer a limited number of <strong style="color:${style.gold}">private Aurora Sessions</strong> — a live 30-minute conversation where I look at your reading alongside you, answer your questions directly, and help you identify the one action that will move the needle most.
      </p>
      <div style="background:#d4af3710;border-radius:12px;padding:20px;margin:20px 0;border:1px solid #d4af3730">
        <p style="color:${style.gold};font-size:14px;font-weight:700;margin:0 0 10px">What you get:</p>
        <ul style="color:${style.text};font-size:14px;line-height:1.9;margin:0;padding-left:20px">
          <li>30-minute private session with Aurora</li>
          <li>Deep-dive into your specific palm patterns</li>
          <li>Personalized action plan for the next 30 days</li>
          <li>Recording sent to you after the session</li>
        </ul>
        <p style="color:${style.gold};font-size:18px;font-weight:700;margin:16px 0 0;text-align:center">$47 · Limited spots</p>
      </div>
      <div style="text-align:center;margin-top:20px">
        <a href="${sessionUrl}" style="${style.btnGold}">Book My Private Session →</a>
      </div>
      <p style="color:${style.muted};font-size:13px;text-align:center;margin-top:16px">
        This offer is only available to women who have completed a reading.
      </p>
    `),
  };
}

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const authHeader = req.headers.get("Authorization") ?? "";
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (!authHeader.includes(SUPABASE_SERVICE_ROLE_KEY)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  const FROM = Deno.env.get("RESEND_FROM_EMAIL") ?? "Madam Aurora <aurora@madam-aurora.co>";

  if (!RESEND_API_KEY) {
    return new Response(JSON.stringify({ ok: false, reason: "RESEND_API_KEY not set" }), { status: 200 });
  }

  const { email, name: rawName, product_code, session_id } = await req.json() as {
    email: string;
    name?: string;
    product_code?: string;
    session_id?: string;
  };

  if (!email) {
    return new Response(JSON.stringify({ ok: false, reason: "email required" }), { status: 400 });
  }

  const name = (rawName?.trim().split(" ")[0]) || "there";
  // Deep-link to the delivery page with the Stripe session_id so the reading
  // opens even on a different device/browser (entitlement is verified server-side).
  // /resultado is the offer page and bounces users without local funnel state.
  const deliveryPath = product_code === "complete"
    ? "/entrega/completa"
    : product_code === "guide" || product_code === "upsell"
      ? "/entrega/guia"
      : "/entrega/leitura";
  const readingUrl = session_id
    ? `${BASE}${deliveryPath}?session_id=${encodeURIComponent(session_id)}`
    : `${BASE}${deliveryPath}`;

  const resend = new Resend(RESEND_API_KEY);
  const now = Date.now();

  const schedule = [
    { delay: 0,                  build: () => email1(name, readingUrl) },
    { delay: 60 * 60 * 1000,     build: () => email2(name, readingUrl) },
    { delay: 2 * 24 * 3600000,   build: () => email3(name) },
    { delay: 4 * 24 * 3600000,   build: () => email4(name, readingUrl) },
    { delay: 7 * 24 * 3600000,   build: () => email5(name) },
  ];

  const results: Array<{ ok: boolean; email: number; error?: string }> = [];

  for (const [i, entry] of schedule.entries()) {
    const { subject, html } = entry.build();
    const scheduledAt = entry.delay > 0
      ? new Date(now + entry.delay).toISOString()
      : undefined;

    try {
      const payload: Record<string, unknown> = { from: FROM, to: [email], subject, html };
      if (scheduledAt) payload.scheduledAt = scheduledAt;

      const { error } = await resend.emails.send(payload as Parameters<typeof resend.emails.send>[0]);
      if (error) {
        console.warn(`purchase_email_${i + 1}_failed`, { email, error });
        results.push({ ok: false, email: i + 1, error: String((error as { message?: string }).message ?? error) });
      } else {
        console.log(`purchase_email_${i + 1}_ok`, { email, scheduledAt });
        results.push({ ok: true, email: i + 1 });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`purchase_email_${i + 1}_exception`, { email, error: msg });
      results.push({ ok: false, email: i + 1, error: msg });
    }
  }

  return new Response(JSON.stringify({ ok: true, results }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
