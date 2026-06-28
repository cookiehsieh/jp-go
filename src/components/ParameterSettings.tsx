import React, { useState } from "react";
import { AppSettings, ProxyFeeType, RoundingOption } from "../types";
import { RefreshCw, TrendingUp, DollarSign, Percent, AlertCircle } from "lucide-react";

interface ParameterSettingsProps {
  settings: AppSettings;
  onSettingsChange: (newSettings: AppSettings) => void;
}

export default function ParameterSettings({
  settings,
  onSettingsChange,
}: ParameterSettingsProps) {
  const [loading, setLoading] = useState(false);
  const [fetchInfo, setFetchInfo] = useState<{
    time?: string;
    source?: string;
    error?: string;
  }>({});

  // Fetch from the server-side Bank of Taiwan / backup exchange rate API
  const fetchLatestRate = async () => {
    setLoading(true);
    setFetchInfo({});
    try {
      const res = await fetch("/api/exchange-rate");
      if (!res.ok) throw new Error("網路連線錯誤，無法取得最新匯率");
      
      const data = await res.json();
      if (data.success && data.rates) {
        // Use the spot selling rate as default for proxy calculators as it's the standard credit card/wire transfer reference,
        // but offer the cash rate info for reference too.
        const recommendedRate = data.rates.spotSelling || data.rates.cashSelling || 0.215;
        
        onSettingsChange({
          ...settings,
          exchangeRate: parseFloat(recommendedRate.toFixed(4)),
        });

        setFetchInfo({
          time: data.rates.updateTime,
          source: data.rates.source,
        });
      } else {
        throw new Error(data.message || "無法解析匯率資料");
      }
    } catch (err: any) {
      console.error(err);
      setFetchInfo({
        error: err.message || "取得匯率時發生未知錯誤，請稍後再試",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    onSettingsChange({
      ...settings,
      [key]: value,
    });
  };

  return (
    <div className="bg-white border border-[#E5E0D8] rounded-2xl p-6 shadow-sm space-y-6" id="parameter-settings-card">
      <div className="border-b border-[#E5E0D8] pb-4 flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[#8E8679] flex items-center gap-2 font-sans">
          <TrendingUp className="w-4 h-4 text-[#A89F91]" />
          1. 參數設定區 <span className="text-[10px] text-[#A89F91] font-normal tracking-normal lowercase">（將自動記憶設定）</span>
        </h2>
      </div>

      {/* Exchange Rate Input Section */}
      <div className="space-y-3">
        <label className="block text-[11px] font-bold text-[#4A453E] uppercase tracking-wide flex justify-between items-center">
          <span>目前日幣匯率 (TWD/JPY)</span>
          <span className="text-[11px] font-medium text-[#8E8679] font-mono">1 JPY = {settings.exchangeRate} TWD</span>
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A89F91] font-mono text-sm">¥</span>
            <input
              type="number"
              value={settings.exchangeRate || ""}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                updateSetting("exchangeRate", isNaN(val) ? 0 : val);
              }}
              step="0.001"
              placeholder="0.215"
              className="w-full pl-8 pr-4 py-2.5 bg-[#F9F8F6] border border-[#E5E0D8] rounded-lg text-[#4A453E] focus:outline-none focus:ring-1 focus:ring-[#A89F91] transition-all text-sm font-mono"
            />
          </div>
          <button
            onClick={fetchLatestRate}
            disabled={loading}
            className="px-3.5 py-2.5 bg-[#7E6E5A] hover:bg-[#6D5F4D] text-white rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all focus:ring-1 focus:ring-[#A89F91] active:scale-[0.98] cursor-pointer disabled:opacity-50"
            title="從台銀獲取最新匯率"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
            {loading ? "獲取中..." : "台銀匯率"}
          </button>
        </div>

        {/* Fetch details or error message */}
        {fetchInfo.time && (
          <div className="bg-[#F0EEEA] text-[#4A453E] text-[11px] p-3 rounded-lg space-y-1 border border-[#E5E0D8]">
            <div className="flex justify-between">
              <span className="text-[#8E8679]">更新時間：</span>
              <span className="font-mono font-medium">{fetchInfo.time}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8E8679]">匯率來源：</span>
              <span className="font-medium">{fetchInfo.source}</span>
            </div>
            <div className="text-[10px] text-[#A89F91] mt-1 border-t border-[#E5E0D8] pt-1 text-right">
              * 系統已為您自動載入此即期賣出匯率
            </div>
          </div>
        )}

        {fetchInfo.error && (
          <div className="bg-red-50 text-red-600 text-xs p-3 rounded-xl flex items-start gap-1.5 border border-red-100 animate-pulse">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{fetchInfo.error}</span>
          </div>
        )}
      </div>

      {/* Proxy Service Fee Settings */}
      <div className="space-y-3">
        <label className="block text-[11px] font-bold text-[#4A453E] uppercase tracking-wide">代購服務費設定</label>
        <div className="grid grid-cols-2 gap-2 bg-[#F0EEEA] p-1 rounded-lg">
          <button
            type="button"
            onClick={() => updateSetting("proxyFeeType", "percent")}
            className={`py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
              settings.proxyFeeType === "percent"
                ? "bg-white text-[#4A453E] shadow-xs"
                : "text-[#8E8679] hover:text-[#4A453E]"
            }`}
          >
            總價百分比 %
          </button>
          <button
            type="button"
            onClick={() => updateSetting("proxyFeeType", "fixed")}
            className={`py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
              settings.proxyFeeType === "fixed"
                ? "bg-white text-[#4A453E] shadow-xs"
                : "text-[#8E8679] hover:text-[#4A453E]"
            }`}
          >
            固定金額 TWD
          </button>
        </div>

        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A89F91]">
            {settings.proxyFeeType === "percent" ? (
              <Percent className="w-3.5 h-3.5" />
            ) : (
              <DollarSign className="w-3.5 h-3.5" />
            )}
          </div>
          <input
            type="number"
            value={settings.proxyFeeValue || ""}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              updateSetting("proxyFeeValue", isNaN(val) ? 0 : val);
            }}
            placeholder={settings.proxyFeeType === "percent" ? "10" : "150"}
            min="0"
            className="w-full pl-9 pr-4 py-2.5 bg-[#F9F8F6] border border-[#E5E0D8] rounded-lg text-[#4A453E] focus:outline-none focus:ring-1 focus:ring-[#A89F91] transition-all text-sm font-mono"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#8E8679] font-medium">
            {settings.proxyFeeType === "percent" ? "% 服務費" : "元 / 每件"}
          </span>
        </div>
      </div>

      {/* Rounding settings */}
      <div className="space-y-3">
        <label className="block text-[11px] font-bold text-[#4A453E] uppercase tracking-wide">台幣報價進位規則</label>
        <div className="grid grid-cols-3 gap-2 bg-[#F0EEEA] p-1 rounded-lg">
          {(["ceil", "round", "none"] as RoundingOption[]).map((option) => {
            const labelMap = {
              ceil: "無條件進位",
              round: "四捨五入",
              none: "不處理",
            };
            return (
              <button
                key={option}
                type="button"
                onClick={() => updateSetting("roundingOption", option)}
                className={`py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  settings.roundingOption === option
                    ? "bg-white text-[#4A453E] shadow-xs"
                    : "text-[#8E8679] hover:text-[#4A453E]"
                }`}
              >
                {labelMap[option]}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
