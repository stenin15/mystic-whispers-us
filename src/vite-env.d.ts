/// <reference types="vite/client" />

interface Window {
  fbq?: (...args: any[]) => void;
  gtag?: (...args: any[]) => void;
}