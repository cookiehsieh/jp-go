export type ProxyFeeType = "fixed" | "percent";

export type TaxOption = "include" | "exclude";

export type RoundingOption = "ceil" | "round" | "none";

export interface AppSettings {
  exchangeRate: number; // e.g. 0.215
  proxyFeeType: ProxyFeeType; // "fixed" | "percent"
  proxyFeeValue: number; // e.g. 150 (TWD) or 10 (%)
  roundingOption: RoundingOption; // "ceil" | "round" | "none"
  defaultWeightGrams: number; // default weight if user wants to set one
  customTemplate: string; // user-defined copy template
}

export interface ProductInput {
  originalPriceJpy: number; // JPY original price
  taxOption: TaxOption; // "include" | "exclude" (adds 10% if exclude)
  domesticShippingJpy: number; // Japanese domestic shipping
  weightGrams: number; // Weight for EMS shipping calculation
}

export interface CalculationResult {
  priceJpyWithTax: number; // Price with tax in JPY
  domesticShippingJpy: number; // Domestic shipping in JPY
  shippingJpy: number; // EMS shipping fee in JPY
  shippingTwd: number; // EMS shipping fee in TWD
  costJpy: number; // Total JPY cost (product + domestic + shipping)
  costTwd: number; // Total item cost in TWD
  proxyFeeTwd: number; // Calculated proxy service fee in TWD
  rawTotalTwd: number; // Cost + Proxy Fee in TWD before rounding
  finalQuoteTwd: number; // Rounded quote in TWD
  weightGrams: number; // weight used
}

export interface HistoryItem {
  id: string;
  timestamp: string;
  productName: string;
  input: ProductInput;
  settings: AppSettings;
  result: CalculationResult;
}
