import { Footer } from "@/components/layout/Footer";

const Terms = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <main className="container max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-3xl md:text-4xl font-serif font-bold mb-6">Terms of Use</h1>
        <p className="text-muted-foreground mb-6">
          By accessing this website and purchasing digital content, you agree to these Terms.
        </p>

        <h2 className="text-xl font-serif font-semibold mt-10 mb-3">Disclaimer</h2>
        <p className="text-muted-foreground">
          Content is symbolic and provided for entertainment and self-reflection purposes only. It is not medical,
          psychological, legal, or financial advice.
        </p>

        <h2 className="text-xl font-serif font-semibold mt-10 mb-3">Digital delivery</h2>
        <p className="text-muted-foreground">
          Purchases are delivered digitally. Access may require verification of payment.
        </p>

        <h2 className="text-xl font-serif font-semibold mt-10 mb-3">Acceptable use</h2>
        <p className="text-muted-foreground">
          You agree not to abuse the service, attempt to bypass the paywall, or automate requests.
        </p>

        <h2 className="text-xl font-serif font-semibold mt-10 mb-3">Contact</h2>
        <p className="text-muted-foreground">
          Email: <strong>support@madam-aurora.co</strong> (replace with your real support email)
        </p>
      </main>
      <Footer />
    </div>
  );
};

export default Terms;

