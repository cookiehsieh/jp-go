import React from "react";
import { ProductInput, TaxOption } from "../types";
import { Scale, Tag, Truck, Info, HelpCircle } from "lucide-react";

interface ProductCalculatorProps {
  input: ProductInput;
  onInputChange: (newInput: ProductInput) => void;
  productName: string;
  onProductNameChange: (name: string) => void;
}

// Helper presets of common items for quick weight selection
const COMMON_WEIGHT_PRESETS = [
  { name: "短袖 T-Shirt", weight: 150 },
  { name: "連帽衛衣 / 外套", weight: 650 },
  { name: "牛仔褲 / 長褲", weight: 500 },
  { name: "運動鞋 (含鞋盒)", weight: 1100 },
  { name: "馬克杯 / 陶瓷杯", weight: 400 },
  { name: "保養品化妝水 (瓶裝)", weight: 250 },
  { name: "日系泡麵 (大碗公)", weight: 180 },
  { name: "任天堂 Switch 主機", weight: 400 },
  { name: "公仔 / 模型 (中型盒裝)", weight: 800 },
];

export default function ProductCalculator({
  input,
  onInputChange,
  productName,
  onProductNameChange,
}: ProductCalculatorProps) {
  const updateInput = <K extends keyof ProductInput>(key: K, value: ProductInput[K]) => {
    onInputChange({
      ...input,
      [key]: value,
    });
  };

  const selectPresetWeight = (grams: number) => {
    updateInput("weightGrams", grams);
  };

  return (
    <div className="bg-white border border-[#E5E0D8] rounded-2xl p-6 shadow-sm space-y-5" id="product-calculator-card">
      <div className="border-b border-[#E5E0D8] pb-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[#8E8679] flex items-center gap-2 font-sans">
          <Tag className="w-4 h-4 text-[#A89F91]" />
          2. 商品估價輸入區
        </h2>
      </div>

      {/* Product Name (Optional, for history logging) */}
      <div className="space-y-2">
        <label className="block text-[11px] font-bold text-[#4A453E] uppercase tracking-wide">商品名稱 / 備註</label>
        <input
          type="text"
          value={productName}
          onChange={(e) => onProductNameChange(e.target.value)}
          placeholder="例如：日本限定 NB 運動鞋 / 藥妝化妝水 (選填)"
          className="w-full px-4 py-2.5 bg-[#F9F8F6] border border-[#E5E0D8] rounded-lg text-[#4A453E] text-sm focus:outline-none focus:ring-1 focus:ring-[#A89F91] transition-all"
        />
      </div>

      {/* JPY Original Price & Tax option */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="block text-[11px] font-bold text-[#4A453E] uppercase tracking-wide">日幣商品原價</label>
          <div className="grid grid-cols-2 gap-1 bg-[#F0EEEA] p-0.5 rounded-lg text-xs">
            <button
              type="button"
              onClick={() => updateInput("taxOption", "include")}
              className={`px-2.5 py-1 font-bold rounded-md transition-all cursor-pointer ${
                input.taxOption === "include"
                  ? "bg-white text-[#4A453E] shadow-xs"
                  : "text-[#8E8679] hover:text-[#4A453E]"
              }`}
            >
              含稅價
            </button>
            <button
              type="button"
              onClick={() => updateInput("taxOption", "exclude")}
              className={`px-2.5 py-1 font-bold rounded-md transition-all cursor-pointer ${
                input.taxOption === "exclude"
                  ? "bg-white text-[#4A453E] shadow-xs"
                  : "text-[#8E8679] hover:text-[#4A453E]"
              }`}
            >
              未稅 (+10%)
            </button>
          </div>
        </div>

        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A89F91] font-medium font-mono text-sm">¥</span>
          <input
            type="number"
            value={input.originalPriceJpy || ""}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              updateInput("originalPriceJpy", isNaN(val) ? 0 : val);
            }}
            placeholder="請輸入日幣價格"
            min="0"
            className="w-full pl-8 pr-12 py-2.5 bg-[#F9F8F6] border border-[#E5E0D8] rounded-lg text-[#4A453E] text-sm font-mono focus:outline-none focus:ring-1 focus:ring-[#A89F91] transition-all"
          />
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[#8E8679] font-medium font-sans">
            円
          </span>
        </div>
      </div>

      {/* Japan Domestic Shipping (日本境內運費) */}
      <div className="space-y-2">
        <label className="block text-[11px] font-bold text-[#4A453E] uppercase tracking-wide flex justify-between items-center">
          <span className="flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-[#A89F91]" /> 日本境內運費 <span className="text-[10px] text-[#8E8679] font-normal tracking-normal lowercase">（通常為 0 或滿額免運）</span>
          </span>
        </label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A89F91] font-medium font-mono text-sm">¥</span>
          <input
            type="number"
            value={input.domesticShippingJpy || ""}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              updateInput("domesticShippingJpy", isNaN(val) ? 0 : val);
            }}
            placeholder="預設為 0"
            min="0"
            className="w-full pl-8 pr-12 py-2.5 bg-[#F9F8F6] border border-[#E5E0D8] rounded-lg text-[#4A453E] text-sm font-mono focus:outline-none focus:ring-1 focus:ring-[#A89F91] transition-all"
          />
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[#8E8679] font-medium">
            円
          </span>
        </div>
      </div>

      {/* Product Weight & EMS Shipping standard */}
      <div className="space-y-3">
        <label className="block text-[11px] font-bold text-[#4A453E] uppercase tracking-wide flex justify-between items-center">
          <span className="flex items-center gap-1.5">
            <Scale className="w-4 h-4 text-[#A89F91]" /> 商品重量 <span className="text-[10px] text-[#8E8679] font-normal tracking-normal lowercase">（選填，用於估算 EMS 運費）</span>
          </span>
        </label>
        
        <div className="relative">
          <input
            type="number"
            value={input.weightGrams || ""}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              updateInput("weightGrams", isNaN(val) ? 0 : val);
            }}
            placeholder="請輸入公克克數 (g)，例如 500"
            min="0"
            className="w-full px-4 py-2.5 bg-[#F9F8F6] border border-[#E5E0D8] rounded-lg text-[#4A453E] text-sm font-mono pr-12 focus:outline-none focus:ring-1 focus:ring-[#A89F91] transition-all"
          />
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[#8E8679] font-medium">
            g (公克)
          </span>
        </div>

        {/* Quick Weight Presets Helper */}
        <div className="bg-[#F0EEEA] p-3.5 rounded-lg border border-[#E5E0D8] space-y-2">
          <span className="text-xs font-bold text-[#8E8679] flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5 text-[#A89F91]" /> 常見商品重量估算參考 (點選套用)：
          </span>
          <div className="flex flex-wrap gap-1.5 max-h-[140px] overflow-y-auto pr-1">
            {COMMON_WEIGHT_PRESETS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => selectPresetWeight(preset.weight)}
                className="px-2 py-1 bg-white hover:bg-[#F9F8F6] text-[11px] text-[#4A453E] rounded-md border border-[#E5E0D8] transition-all active:scale-[0.98] cursor-pointer font-medium"
              >
                {preset.name} ({preset.weight}g)
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
