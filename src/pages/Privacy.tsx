import { Footer } from "@/components/layout/Footer";

const Privacy = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <main className="container max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-3xl md:text-4xl font-serif font-bold mb-6">Privacy Policy</h1>
        <p className="text-muted-foreground mb-6">
          This Privacy Policy explains how Madame Aurora (“we”, “us”) collects and uses information when you use this
          website and purchase digital content. For entertainment and self-reflection purposes.
        </p>

        <h2 className="text-xl font-serif font-semibold mt-10 mb-3">Information we collect</h2>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2">
          <li>Contact information (e.g., email) you submit in forms.</li>
          <li>Order/payment metadata necessary to deliver your purchase.</li>
          <li>Technical data (IP address, device/browser, pages visited) for security and analytics.</li>
        </ul>

        <h2 className="text-xl font-serif font-semibold mt-10 mb-3">How we use information</h2>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2">
          <li>To provide and improve the experience and deliver purchased content.</li>
          <li>To prevent fraud/abuse and keep the service secure.</li>
          <li>To measure marketing performance (analytics/advertising pixels where enabled).</li>
        </ul>

        <h2 className="text-xl font-serif font-semibold mt-10 mb-3">Data retention</h2>
        <p className="text-muted-foreground">
          We retain data only as long as needed for operations, legal compliance, and fraud prevention.
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

export default Privacy;

