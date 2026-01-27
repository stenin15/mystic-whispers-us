import { Footer } from "@/components/layout/Footer";

const Contact = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <main className="container max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-3xl md:text-4xl font-serif font-bold mb-6">Contact</h1>
        <p className="text-muted-foreground mb-6">
          Need help with your order or access? Reach out and we’ll assist.
        </p>

        <div className="rounded-2xl border border-border/30 p-6 bg-card/20">
          <p className="text-muted-foreground">
            Support email: <strong>support@madam-aurora.co</strong> (replace with your real support email)
          </p>
          <p className="text-muted-foreground mt-3">
            Typical response time: <strong>1–2 business days</strong>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;

