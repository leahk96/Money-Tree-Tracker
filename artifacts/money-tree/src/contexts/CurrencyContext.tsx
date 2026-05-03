import { createContext, useContext, ReactNode } from "react";
import { useProfile } from "@/contexts/ProfileContext";
import { formatCurrencyWith, SUPPORTED_CURRENCIES } from "@/lib/currency";

interface CurrencyContextType {
  symbol: string;
  fmt: (amount: number) => string;
}

const defaultFmt = (amount: number) =>
  `£${amount.toLocaleString("en-GB", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

const CurrencyContext = createContext<CurrencyContextType>({
  symbol: "£",
  fmt: defaultFmt,
});

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const { profile } = useProfile();
  const symbol = SUPPORTED_CURRENCIES[profile?.currency ?? "GBP"] ?? "£";
  const fmt = (amount: number) => formatCurrencyWith(amount, symbol);

  return (
    <CurrencyContext.Provider value={{ symbol, fmt }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
