export interface EMSBracket {
  maxWeight: number; // in grams
  feeJpy: number; // in Japanese Yen
}

// Japan Post EMS Rates for Zone 1 (Asia, including Taiwan)
// Effective since June 1, 2022
export const EMS_ZONE1_RATES: EMSBracket[] = [
  { maxWeight: 500, feeJpy: 1450 },
  { maxWeight: 600, feeJpy: 1620 },
  { maxWeight: 700, feeJpy: 1790 },
  { maxWeight: 800, feeJpy: 1960 },
  { maxWeight: 900, feeJpy: 2130 },
  { maxWeight: 1000, feeJpy: 2300 },
  { maxWeight: 1250, feeJpy: 2650 },
  { maxWeight: 1500, feeJpy: 3000 },
  { maxWeight: 1750, feeJpy: 3350 },
  { maxWeight: 2000, feeJpy: 3700 },
  { maxWeight: 2500, feeJpy: 4300 },
  { maxWeight: 3000, feeJpy: 4900 },
  { maxWeight: 3500, feeJpy: 5500 },
  { maxWeight: 4000, feeJpy: 6100 },
  { maxWeight: 4500, feeJpy: 6700 },
  { maxWeight: 5000, feeJpy: 7300 },
  { maxWeight: 5500, feeJpy: 7900 },
  { maxWeight: 6000, feeJpy: 8500 },
  { maxWeight: 7000, feeJpy: 9700 },
  { maxWeight: 8000, feeJpy: 10900 },
  { maxWeight: 9000, feeJpy: 12100 },
  { maxWeight: 10000, feeJpy: 13300 },
];

/**
 * Calculates the EMS shipping fee in JPY based on weight in grams
 * @param weightGrams The weight in grams
 * @returns Object containing the calculated fee in JPY and the bracket's maximum weight
 */
export function getEMSShippingFee(weightGrams: number): { feeJpy: number; bracketMaxWeight: number } {
  if (weightGrams <= 0) {
    return { feeJpy: 0, bracketMaxWeight: 0 };
  }

  // Find matching bracket
  for (const bracket of EMS_ZONE1_RATES) {
    if (weightGrams <= bracket.maxWeight) {
      return { feeJpy: bracket.feeJpy, bracketMaxWeight: bracket.maxWeight };
    }
  }

  // Above 10kg (10,000g)
  // Standard EMS Zone 1 surcharge is 1,200 JPY per additional 1,000g (or fraction thereof)
  const baseWeight = 10000;
  const baseFee = 13300;
  const extraWeight = weightGrams - baseWeight;
  const extraIntervals = Math.ceil(extraWeight / 1000);
  const feeJpy = baseFee + extraIntervals * 1200;
  const bracketMaxWeight = baseWeight + extraIntervals * 1000;

  return { feeJpy, bracketMaxWeight };
}
