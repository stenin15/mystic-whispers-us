export type ProductKey = "basic" | "complete" | "guide";

export const PRICE_MAP: Record<
  ProductKey,
  { label: string; amountUsd: number; display: string }
> = {
  basic: {
    label: "Personal Palm Reading",
    amountUsd: 9.9,
    display: "$9.90",
  },
  complete: {
    label: "Complete Palm Reading",
    amountUsd: 29.9,
    display: "$29.90",
  },
  guide: {
    label: "Ritual & Integration Guide",
    amountUsd: 27.0,
    display: "$27.00",
  },
};

