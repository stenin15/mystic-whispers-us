// Global type declarations

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
  }
}

export {};
