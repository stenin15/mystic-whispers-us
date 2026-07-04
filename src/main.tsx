import { createRoot } from "react-dom/client";
import { Component, ReactNode } from "react";
import App from "./App.tsx";
import "./index.css";
import { initTikTok } from "./lib/tiktok";

initTikTok();

class RootErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  state = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    // Push to dataLayer so GTM / Clarity picks it up
    try {
      (window as { dataLayer?: unknown[] }).dataLayer =
        (window as { dataLayer?: unknown[] }).dataLayer || [];
      ((window as { dataLayer?: unknown[] }).dataLayer as unknown[]).push({
        event: "AppCrash",
        error_message: error?.message,
        component_stack: info?.componentStack?.slice(0, 500),
      });
    } catch { /* ignore */ }
  }

  render() {
    const { error } = this.state;
    if (error) {
      return (
        <div style={{ minHeight: "100vh", background: "#04040e", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem", fontFamily: "sans-serif" }}>
          <div style={{ maxWidth: 420, textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 16 }}>✦</div>
            <p style={{ color: "#a855f7", fontWeight: 700, marginBottom: 8 }}>Something went wrong</p>
            <p style={{ color: "#ffffff60", fontSize: 13, marginBottom: 24 }}>
              We're having trouble loading your reading. Please refresh the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{ background: "#a855f7", color: "#fff", border: "none", borderRadius: 8, padding: "10px 24px", cursor: "pointer", fontSize: 14, fontWeight: 600 }}
            >
              Refresh
            </button>
            {import.meta.env.DEV && (
              <pre style={{ marginTop: 24, color: "#ff6b6b", fontSize: 11, textAlign: "left", overflowX: "auto", background: "#1a0a0a", padding: 12, borderRadius: 6 }}>
                {(error as Error).message}
              </pre>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById("root")!).render(
  <RootErrorBoundary>
    <App />
  </RootErrorBoundary>
);
