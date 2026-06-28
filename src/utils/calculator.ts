import { AppSettings, ProductInput, CalculationResult } from "../types";
import { getEMSShippingFee } from "./ems";

/**
 * Perform real-time pricing conversion
 */
export function calculateQuote(
  input: ProductInput,
  settings: AppSettings
): CalculationResult {
  // 1. Calculate base product price in JPY (with or without 10% tax)
  const priceJpyWithTax =
    input.taxOption === "exclude"
      ? Math.round(input.originalPriceJpy * 1.1)
      : input.originalPriceJpy;

  // 2. Domestic shipping
  const domesticShippingJpy = input.domesticShippingJpy || 0;

  // 3. International EMS Shipping in JPY
  const { feeJpy: shippingJpy } = getEMSShippingFee(input.weightGrams);

  // 4. Convert JPY to TWD
  const shippingTwd = parseFloat((shippingJpy * settings.exchangeRate).toFixed(2));
  
  // Total JPY
  const costJpy = priceJpyWithTax + domesticShippingJpy + shippingJpy;
  
  // Convert total cost to TWD
  const costTwd = parseFloat((costJpy * settings.exchangeRate).toFixed(2));

  // 5. Calculate Proxy Service Fee in TWD
  let proxyFeeTwd = 0;
  if (settings.proxyFeeType === "percent") {
    proxyFeeTwd = parseFloat((costTwd * (settings.proxyFeeValue / 100)).toFixed(2));
  } else {
    proxyFeeTwd = settings.proxyFeeValue || 0;
  }

  // 6. Final Quotation in TWD before and after rounding
  const rawTotalTwd = costTwd + proxyFeeTwd;
  
  let finalQuoteTwd = rawTotalTwd;
  if (settings.roundingOption === "ceil") {
    finalQuoteTwd = Math.ceil(rawTotalTwd);
  } else if (settings.roundingOption === "round") {
    finalQuoteTwd = Math.round(rawTotalTwd);
  }

  return {
    priceJpyWithTax,
    domesticShippingJpy,
    shippingJpy,
    shippingTwd,
    costJpy,
    costTwd,
    proxyFeeTwd,
    rawTotalTwd,
    finalQuoteTwd,
    weightGrams: input.weightGrams,
  };
}
