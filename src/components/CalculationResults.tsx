import React from "react";
import { AppSettings, CalculationResult } from "../types";
import { Calculator, Save, CheckCircle } from "lucide-react";

interface CalculationResultsProps {
  result: CalculationResult;
  settings: AppSettings;
  productName: string;
  onSaveToHistory: () => void;
  hasSaved: boolean;
}

export default function CalculationResults({
  result,
  settings,
  productName,
  onSaveToHistory,
  hasSaved,
}: CalculationResultsProps) {
  // Helpers to format currency numbers cleanly
  const formatCurrency = (val: number, isTwd: boolean = true) => {
    return isTwd
      ? `$ ${Math.round(val).toLocaleString()}`
      : `${val.toLocaleString()} 円`;
  };

  const formatCurrencyValueOnly = (val: number) => {
    return Math.round(val).toLocaleString();
  };

  return (
    <div className="bg-white border border-[#E5E0D8] rounded-2xl p-6 shadow-sm space-y-6" id="calculation-results-card">
      <div className="border-b border-[#E5E0D8] pb-4 flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[#8E8679] flex items-center gap-2 font-sans">
          <Calculator className="w-4 h-4 text-[#A89F91]" />
          3. 即時計算結果
        </h2>
        <span className="text-[10px] bg-[#EAE7E1] text-[#4A453E] border border-[#E5E0D8] px-2.5 py-1 rounded-full font-mono font-bold">
          匯率：{settings.exchangeRate}
        </span>
      </div>

      {/* Primary Recommended Quote Card (Muji Aesthetic Minimalist) */}
      <div className="bg-[#F9F8F6] border border-[#E5E0D8] rounded-xl p-6 text-center space-y-2 relative overflow-hidden shadow-xs">
        {/* Subtle decorative elements matching theme */}
        <div className="absolute right-0 top-0 w-24 h-24 bg-[#F0EEEA]/40 rounded-full translate-x-8 -translate-y-8"></div>
        <div className="absolute left-0 bottom-0 w-16 h-16 bg-[#F0EEEA]/40 rounded-full -translate-x-6 translate-y-6"></div>

        <span className="text-[11px] font-bold uppercase tracking-widest text-[#A89F91] block">
          最終建議台幣報價
        </span>
        <div className="text-5xl font-light mt-1 flex items-baseline justify-center gap-1.5 text-[#4A453E] py-1 font-sans">
          <span className="text-xl font-bold text-[#A89F91]">TWD</span>
          <span className="font-bold tracking-tight">{formatCurrencyValueOnly(result.finalQuoteTwd)}</span>
          <span className="text-sm font-normal text-[#8E8679]">元</span>
        </div>
        
        <div className="text-[11px] text-[#8E8679] font-sans flex items-center justify-center gap-1">
          <span>進位：{
            settings.roundingOption === "ceil" ? "無條件進位至個位" : 
            settings.roundingOption === "round" ? "四捨五入至個位" : "不處理"
          }</span>
          {settings.roundingOption !== "none" && (
            <span className="text-[10px] bg-[#EAE7E1] text-[#4A453E] px-1.5 py-0.5 rounded font-mono border border-[#E5E0D8]">
              原始: ${result.rawTotalTwd.toFixed(1)}
            </span>
          )}
        </div>
      </div>

      {/* Detailed Breakdown List */}
      <div className="space-y-3.5" id="detailed-breakdown-list">
        <h3 className="text-[11px] font-bold text-[#8E8679] uppercase tracking-wider">
          成本與費用細目
        </h3>

        <div className="space-y-2.5 divide-y divide-[#E5E0D8] text-sm">
          {/* JPY Original cost */}
          <div className="flex justify-between items-center pt-2">
            <span className="text-[#8E8679] flex items-center gap-1">
              商品日幣成本 
              {settings.proxyFeeType === "percent" && (
                <span className="text-[9px] bg-[#EAE7E1] text-[#4A453E] px-1.5 py-0.5 rounded border border-[#E5E0D8]">
                  影響代購費
                </span>
              )}
            </span>
            <div className="text-right">
              <div className="font-bold text-[#4A453E]">{formatCurrency(result.priceJpyWithTax, false)}</div>
              <div className="text-xs text-[#A89F91] font-mono">
                約 NTD {formatCurrency(result.priceJpyWithTax * settings.exchangeRate, true)}
              </div>
            </div>
          </div>

          {/* JPY Domestic shipping */}
          {result.domesticShippingJpy > 0 && (
            <div className="flex justify-between items-center pt-2.5">
              <span className="text-[#8E8679]">日本境內運費</span>
              <div className="text-right">
                <div className="font-bold text-[#4A453E]">{formatCurrency(result.domesticShippingJpy, false)}</div>
                <div className="text-xs text-[#A89F91] font-mono">
                  約 NTD {formatCurrency(result.domesticShippingJpy * settings.exchangeRate, true)}
                </div>
              </div>
            </div>
          )}

          {/* International EMS */}
          <div className="flex justify-between items-center pt-2.5">
            <span className="text-[#8E8679] flex items-center gap-1">
              國際運費 (EMS-亞洲)
              {result.weightGrams > 0 && (
                <span className="text-[10px] bg-[#EAE7E1] text-[#4A453E] px-1.5 py-0.5 rounded font-mono border border-[#E5E0D8]">
                  {result.weightGrams}g
                </span>
              )}
            </span>
            <div className="text-right">
              <div className="font-bold text-[#4A453E]">
                {result.shippingJpy > 0 ? formatCurrency(result.shippingJpy, false) : "無重量 / 免運"}
              </div>
              <div className="text-xs text-[#A89F91] font-mono">
                約 NTD {formatCurrency(result.shippingTwd, true)}
              </div>
            </div>
          </div>

          {/* Subtotal Cost in TWD */}
          <div className="flex justify-between items-center pt-2.5 bg-[#F9F8F6] p-2.5 rounded-lg border border-[#E5E0D8]">
            <span className="text-[#4A453E] font-bold">總商品成本 (含運)</span>
            <div className="text-right">
              <span className="font-bold text-[#4A453E]">{formatCurrency(result.costTwd, true)}</span>
              <span className="text-xs text-[#8E8679] block font-mono">({result.costJpy} 円)</span>
            </div>
          </div>

          {/* Proxy service fee */}
          <div className="flex justify-between items-center pt-2.5">
            <span className="text-[#8E8679] flex items-center gap-1.5">
              代購服務費
              <span className="text-[9px] bg-[#EAE7E1] text-[#4A453E] px-1.5 py-0.5 rounded border border-[#E5E0D8]">
                {settings.proxyFeeType === "percent"
                  ? `${settings.proxyFeeValue}%`
                  : `固定 $${settings.proxyFeeValue}`}
              </span>
            </span>
            <div className="text-right font-bold text-[#4A453E]">
              {formatCurrency(result.proxyFeeTwd, true)}
            </div>
          </div>
        </div>
      </div>

      {/* Save Quote Button */}
      <div className="pt-2">
        <button
          onClick={onSaveToHistory}
          disabled={result.priceJpyWithTax === 0}
          className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
            hasSaved
              ? "bg-[#EAF5EC] border border-[#C6E2CC] text-[#2F6D3F] hover:bg-[#DDF0E2]"
              : "bg-white border border-[#E5E0D8] text-[#4A453E] hover:bg-[#F9F8F6] hover:border-[#A89F91]"
          } active:scale-[0.99] disabled:opacity-50`}
        >
          {hasSaved ? (
            <>
              <CheckCircle className="w-4 h-4 text-[#2F6D3F] animate-pulse" />
              已儲存此筆報價至紀錄
            </>
          ) : (
            <>
              <Save className="w-4 h-4 text-[#8E8679]" />
              儲存此筆報價至紀錄
            </>
          )}
        </button>
      </div>
    </div>
  );
}
