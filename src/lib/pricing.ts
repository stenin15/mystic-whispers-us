export type ProductKey = "basic" | "complete" | "guide";

export const PRICE_MAP: Record<
  ProductKey,
  { label: string; amountUsd: number; display: string }
> = {
  basic: {
    label: "Personal Relationship Pattern Reading",
    amountUsd: 9.9,
    display: "$9.90",
  },
  complete: {
    label: "Complete Reading + Exclusive PDF Guide + 15-min Live Session",
    amountUsd: 29.9,
    display: "$29.90",
  },
  guide: {
    label: "Exclusive PDF Guide + Personal Energy Map",
    amountUsd: 27.0,
    display: "$27.00",
  },
};

