export const CURRENCY_SYMBOL = "£";

export function formatCurrency(amount: number): string {
  return `${CURRENCY_SYMBOL}${amount.toLocaleString("en-GB", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

export function parseCurrency(value: string): number {
  const cleaned = value.replace(/[^0-9.-]/g, "");
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}
