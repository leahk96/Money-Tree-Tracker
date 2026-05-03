export const SUPPORTED_CURRENCIES: Record<string, string> = {
  GBP: "£",
  USD: "$",
  EUR: "€",
  JPY: "¥",
  CAD: "CA$",
  AUD: "A$",
  INR: "₹",
  CHF: "Fr",
  SEK: "kr",
  NOK: "kr",
  DKK: "kr",
  MXN: "MX$",
  BRL: "R$",
  ZAR: "R",
  SGD: "S$",
  HKD: "HK$",
  NZD: "NZ$",
  KRW: "₩",
  TRY: "₺",
  AED: "د.إ",
};

export const CURRENCY_SYMBOL = "£";

export function formatCurrencyWith(amount: number, symbol: string): string {
  return `${symbol}${amount.toLocaleString("en-GB", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

export function formatCurrency(amount: number): string {
  return formatCurrencyWith(amount, CURRENCY_SYMBOL);
}

export function parseCurrency(value: string): number {
  const cleaned = value.replace(/[^0-9.-]/g, "");
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}
