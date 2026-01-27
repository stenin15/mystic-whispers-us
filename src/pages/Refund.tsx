import { Footer } from "@/components/layout/Footer";

const Refund = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <main className="container max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-3xl md:text-4xl font-serif font-bold mb-6">Refund Policy</h1>
        <p className="text-muted-foreground mb-6">
          We offer a 7-day refund policy for digital purchases, unless prohibited by law. If you believe you were
          charged in error or had a technical issue accessing your purchase, contact us and we’ll help.
        </p>

        <h2 className="text-xl font-serif font-semibold mt-10 mb-3">How to request a refund</h2>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2">
          <li>Email <strong>support@madam-aurora.co</strong> (replace with your real support email).</li>
          <li>Include the email used at checkout and the approximate purchase time.</li>
          <li>We typically respond within 1–2 business days.</li>
        </ul>

        <h2 className="text-xl font-serif font-semibold mt-10 mb-3">Disclaimer</h2>
        <p className="text-muted-foreground">
          This service is for entertainment and self-reflection purposes.
        </p>
      </main>
      <Footer />
    </div>
  );
};

export default Refund;

