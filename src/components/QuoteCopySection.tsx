import React, { useState, useEffect } from "react";
import { AppSettings, CalculationResult } from "../types";
import { Copy, Check, FileText, Settings, Sparkles } from "lucide-react";

interface QuoteCopySectionProps {
  result: CalculationResult;
  settings: AppSettings;
  productName: string;
}

// Default presets
const PRESET_TEMPLATES = [
  {
    id: "simple",
    name: "簡短摘要版 (適合 IG / FB / Line)",
    template: `🇯🇵【日本代購商品報價】
✨ 商品名稱：{name}
原價日幣：{jpyPrice} 円
適用匯率：{rate}
💰 最終台幣總報價：$ {finalQuote} 元 (不含或已加計國內運費)`,
  },
  {
    id: "detailed",
    name: "詳細明細版 (適合蝦皮 / 私訊細節)",
    template: `🌸【日本代購商品明細與報價】
📦 商品名稱：{name}
-----------------------------
- 日幣商品售價：{jpyPriceWithTax} 円
- 日本境內運費：{domesticShippingJpy} 円
- 國際 EMS 運費：{shippingJpy} 円 (約 NT$ {shippingTwd} 元)
- 代購服務費用：NT$ {proxyFeeTwd} 元
- 估算商品重量：{weightGrams}g
-----------------------------
📊 換算匯率：{rate}
🛍️ 最終建議台幣總金額：$ {finalQuote} 元`,
  },
  {
    id: "custom",
    name: "自訂範本版",
    template: `【日本連線代購】
🧸 商品：{name}
日幣：{jpyPrice} 円 / 匯率：{rate}
👉 最終台幣報價：$ {finalQuote} 元`,
  },
];

export default function QuoteCopySection({
  result,
  settings,
  productName,
}: QuoteCopySectionProps) {
  const [selectedPreset, setSelectedPreset] = useState<string>("simple");
  const [customTemplateText, setCustomTemplateText] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  const [showEditor, setShowEditor] = useState<boolean>(false);

  // Load custom template from localStorage if exists
  useEffect(() => {
    const savedCustom = localStorage.getItem("jpshop_custom_template");
    if (savedCustom) {
      setCustomTemplateText(savedCustom);
    } else {
      const defaultCustom = PRESET_TEMPLATES.find((p) => p.id === "custom")?.template || "";
      setCustomTemplateText(defaultCustom);
    }
  }, []);

  // Format the template with calculated values
  const getFormattedText = () => {
    const activeTemplate =
      selectedPreset === "custom"
        ? customTemplateText
        : PRESET_TEMPLATES.find((p) => p.id === selectedPreset)?.template || "";

    const name = productName.trim() || "日本精選商品";
    const jpyPrice = result.priceJpyWithTax.toLocaleString();
    const jpyPriceWithTax = result.priceJpyWithTax.toLocaleString();
    const domesticShippingJpy = result.domesticShippingJpy.toString();
    const shippingJpy = result.shippingJpy.toString();
    const shippingTwd = Math.round(result.shippingTwd).toString();
    const proxyFeeTwd = Math.round(result.proxyFeeTwd).toString();
    const weightGrams = result.weightGrams.toString();
    const rate = settings.exchangeRate.toString();
    const finalQuote = result.finalQuoteTwd.toLocaleString();

    return activeTemplate
      .replace(/{name}/g, name)
      .replace(/{jpyPrice}/g, jpyPrice)
      .replace(/{jpyPriceWithTax}/g, jpyPriceWithTax)
      .replace(/{domesticShippingJpy}/g, domesticShippingJpy)
      .replace(/{shippingJpy}/g, shippingJpy)
      .replace(/{shippingTwd}/g, shippingTwd)
      .replace(/{proxyFeeTwd}/g, proxyFeeTwd)
      .replace(/{weightGrams}/g, weightGrams)
      .replace(/{rate}/g, rate)
      .replace(/{finalQuote}/g, finalQuote);
  };

  const handleCopy = async () => {
    try {
      const textToCopy = getFormattedText();
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Clipboard copy failed:", err);
    }
  };

  const handleSaveCustomTemplate = (newVal: string) => {
    setCustomTemplateText(newVal);
    localStorage.setItem("jpshop_custom_template", newVal);
  };

  return (
    <div className="bg-white border border-[#E5E0D8] rounded-2xl p-6 shadow-sm space-y-5" id="quote-copy-card">
      <div className="border-b border-[#E5E0D8] pb-4 flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[#8E8679] flex items-center gap-2 font-sans">
          <FileText className="w-4 h-4 text-[#A89F91]" />
          4. 一鍵報價複製功能
        </h2>
        <button
          onClick={() => setShowEditor(!showEditor)}
          className="text-[#8E8679] hover:text-[#4A453E] text-xs flex items-center gap-1 font-bold transition-all cursor-pointer"
        >
          <Settings className="w-3.5 h-3.5" />
          {showEditor ? "關閉自訂" : "修改範本"}
        </button>
      </div>

      {/* Preset template selector */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold text-[#8E8679] uppercase tracking-wide block">
          選擇報價格式
        </span>
        <div className="flex flex-col gap-1.5">
          {PRESET_TEMPLATES.map((preset) => (
            <button
              key={preset.id}
              onClick={() => setSelectedPreset(preset.id)}
              className={`px-4 py-2 text-left text-xs font-bold rounded-lg transition-all border cursor-pointer ${
                selectedPreset === preset.id
                  ? "bg-[#EAE7E1] border-[#A89F91] text-[#4A453E] shadow-xs"
                  : "bg-white hover:bg-[#F9F8F6] border-[#E5E0D8] text-[#8E8679]"
              }`}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Template Editor */}
      {showEditor && selectedPreset === "custom" && (
        <div className="bg-[#F9F8F6] border border-[#E5E0D8] rounded-xl p-4 space-y-2">
          <div className="text-xs font-bold text-[#4A453E] flex justify-between">
            <span>自訂報價格式編輯器</span>
            <span className="text-[#8E8679] font-normal">支援變數代入</span>
          </div>
          <textarea
            value={customTemplateText}
            onChange={(e) => handleSaveCustomTemplate(e.target.value)}
            rows={5}
            className="w-full p-3 bg-white border border-[#E5E0D8] rounded-lg text-xs font-sans focus:ring-1 focus:ring-[#A89F91] focus:border-[#A89F91] focus:outline-none text-[#4A453E]"
            placeholder="請輸入格式範本..."
          />
          <div className="text-[10px] text-[#8E8679] space-y-1">
            <p className="font-bold text-[#4A453E]">💡 可用變數說明 (請用大括號包住)：</p>
            <div className="grid grid-cols-2 gap-1 font-mono text-[9px] text-[#8E8679] bg-white p-2 rounded border border-[#E5E0D8]">
              <div>{"{name}"} : 商品名稱</div>
              <div>{"{jpyPrice}"} : 日幣含稅價</div>
              <div>{"{rate}"} : 目前匯率</div>
              <div>{"{finalQuote}"} : 最終台幣報價</div>
              <div>{"{domesticShippingJpy}"} : 境內運</div>
              <div>{"{shippingJpy}"} : EMS 日幣</div>
              <div>{"{shippingTwd}"} : EMS 台幣</div>
              <div>{"{proxyFeeTwd}"} : 代購費台幣</div>
            </div>
          </div>
        </div>
      )}

      {/* Read-only Live Preview Card */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold text-[#8E8679] uppercase tracking-wide block">
          報價預覽 
        </span>
        <div className="bg-[#F9F8F6] text-[#4A453E] border border-[#E5E0D8] text-xs p-4 rounded-xl font-sans whitespace-pre-wrap leading-relaxed select-all max-h-[220px] overflow-y-auto">
          {getFormattedText()}
        </div>
      </div>

      {/* Big Interactive Copy Button */}
      <button
        onClick={handleCopy}
        disabled={result.priceJpyWithTax === 0}
        className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
          copied
            ? "bg-[#2F6D3F] hover:bg-[#255631] text-white shadow-sm"
            : "bg-[#7E6E5A] hover:bg-[#6D5F4D] text-white shadow-sm active:scale-[0.99]"
        } disabled:opacity-50`}
      >
        {copied ? (
          <>
            <Check className="w-4 h-4" />
            已成功複製至剪貼簿！
          </>
        ) : (
          <>
            <Copy className="w-4 h-4" />
            一鍵複製報價文字
          </>
        )}
      </button>
    </div>
  );
}
