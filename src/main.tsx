import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// TEMP: verify Vercel/Vite envs after redeploy (remove after confirming)
// eslint-disable-next-line no-console
console.log(
  import.meta.env.VITE_MARKET,
  import.meta.env.VITE_LOCALE,
  import.meta.env.VITE_CURRENCY,
);

createRoot(document.getElementById("root")!).render(<App />);
