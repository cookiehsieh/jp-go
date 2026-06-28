import React, { useState, useEffect } from "react";
import { AppSettings, ProductInput, HistoryItem } from "./types";
import { calculateQuote } from "./utils/calculator";
import ParameterSettings from "./components/ParameterSettings";
import ProductCalculator from "./components/ProductCalculator";
import CalculationResults from "./components/CalculationResults";
import QuoteCopySection from "./components/QuoteCopySection";
import HistoryLog from "./components/HistoryLog";
import { Gift, Sparkles, RefreshCw, HelpCircle, AlertCircle } from "lucide-react";

const DEFAULT_SETTINGS: AppSettings = {
  exchangeRate: 0.215,
  proxyFeeType: "percent",
  proxyFeeValue: 10,
  roundingOption: "ceil",
  defaultWeightGrams: 0,
  customTemplate: "",
};

const DEFAULT_INPUT: ProductInput = {
  originalPriceJpy: 0,
  taxOption: "include",
  domesticShippingJpy: 0,
  weightGrams: 0,
};

export default function App() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [input, setInput] = useState<ProductInput>(DEFAULT_INPUT);
  const [productName, setProductName] = useState<string>("");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [hasSaved, setHasSaved] = useState<boolean>(false);
  const [showGuide, setShowGuide] = useState<boolean>(false);

  // 1. Load initial states from LocalStorage on mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem("jpshop_settings");
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
      
      const savedHistory = localStorage.getItem("jpshop_history");
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
    } catch (e) {
      console.error("Failed to load state from localStorage:", e);
    }
  }, []);

  // 2. Persistent saves to LocalStorage when settings changes
  const handleSettingsChange = (newSettings: AppSettings) => {
    setSettings(newSettings);
    setHasSaved(false); // input or settings changed, allow saving new values
    try {
      localStorage.setItem("jpshop_settings", JSON.stringify(newSettings));
    } catch (e) {
      console.error("Failed to save settings:", e);
    }
  };

  const handleInputChange = (newInput: ProductInput) => {
    setInput(newInput);
    setHasSaved(false);
  };

  const handleProductNameChange = (name: string) => {
    setProductName(name);
    setHasSaved(false);
  };

  // 3. Perform real-time calculation
  const calculationResult = calculateQuote(input, settings);

  // 4. History log actions
  const handleSaveToHistory = () => {
    // Avoid saving empty price records
    if (calculationResult.priceJpyWithTax === 0) return;

    const newItem: HistoryItem = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleString("zh-TW"),
      productName: productName.trim() || "日本代購商品",
      input,
      settings,
      result: calculationResult,
    };

    const updatedHistory = [newItem, ...history];
    setHistory(updatedHistory);
    setHasSaved(true);
    try {
      localStorage.setItem("jpshop_history", JSON.stringify(updatedHistory));
    } catch (e) {
      console.error("Failed to save history:", e);
    }
  };

  const handleDeleteHistoryItem = (id: string) => {
    const updatedHistory = history.filter((item) => item.id !== id);
    setHistory(updatedHistory);
    try {
      localStorage.setItem("jpshop_history", JSON.stringify(updatedHistory));
    } catch (e) {
      console.error("Failed to delete history item:", e);
    }
  };

  const handleClearAllHistory = () => {
    if (window.confirm("確定要刪除所有的報價紀錄嗎？此動作無法復原。")) {
      setHistory([]);
      try {
        localStorage.removeItem("jpshop_history");
      } catch (e) {
        console.error("Failed to clear history:", e);
      }
    }
  };

  const handleLoadHistoryItem = (item: HistoryItem) => {
    setInput(item.input);
    setSettings(item.settings);
    setProductName(item.productName);
    setHasSaved(true);
  };

  return (
    <div className="min-h-screen bg-[#F7F5F2] text-[#4A453E] font-sans selection:bg-[#EAE7E1] selection:text-[#4A453E] antialiased py-8 px-4 sm:px-6 lg:px-8">
      {/* Maximum width container to keep desktop layouts fluid but bounded */}
      <div className="max-w-7xl mx-auto space-y-8" id="main-container">
        
        {/* Sleek Minimalist Header */}
        <header className="text-center space-y-3 pb-4 border-b border-[#E5E0D8]" id="app-header">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-[#E5E0D8] rounded-full text-xs text-[#8E8679] font-medium shadow-xs">
            <Gift className="w-3.5 h-3.5 text-[#A89F91] animate-bounce" />
            日本代購專屬報價小工具
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[#4A453E] font-sans sm:text-4xl">
            日本代購匯率報價換算
          </h1>
          <p className="text-sm text-[#8E8679] max-w-xl mx-auto leading-relaxed">
            一個給代購賣家與消費者的快速估算神器。提供台銀即時牌告、EMS 國際重量運費、未稅含稅一鍵切換與格式化複製，讓您 10 秒完成優雅報價。
          </p>

          <div className="flex justify-center gap-3 pt-1">
            <button
              onClick={() => setShowGuide(!showGuide)}
              className="text-xs text-[#8E8679] hover:text-[#4A453E] underline flex items-center gap-1 transition-all cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              {showGuide ? "隱藏使用說明" : "新手使用指南"}
            </button>
          </div>
        </header>

        {/* Dynamic Instructional Guide */}
        {showGuide && (
          <div className="bg-white border border-[#E5E0D8] rounded-2xl p-6 shadow-sm space-y-3 animate-fadeIn" id="user-guide-section">
            <h3 className="font-bold text-[#8E8679] uppercase tracking-wider flex items-center gap-1.5 text-sm">
              <Sparkles className="w-4 h-4 text-[#A89F91]" />
              新手代購與換算指南
            </h3>
            <ul className="text-xs text-[#8E8679] space-y-2 list-disc pl-5 leading-relaxed">
              <li>
                <strong>匯率設定</strong>：可以手動輸入或點擊「台銀匯率」按鈕，系統會利用
                Gemini 連網獲取今天台灣銀行的最新<strong>日幣即期賣出</strong>匯率。
              </li>
              <li>
                <strong>稅率處理</strong>：日本有些網站顯示未稅價格，若選擇「未稅」系統會自動乘上
                <strong>1.10 (日本消費稅 10%)</strong>。
              </li>
              <li>
                <strong>國際運費 (EMS)</strong>：日本郵政 EMS 亞洲區運費表已內建。您只需輸入商品預估重量（公克 g），系統即自動查找對應運費級距，無需翻表。
              </li>
              <li>
                <strong>代購費與進位</strong>：支援「百分比」或「固定金額」。報價提供「無條件進位」或「四捨五入」，能避免報價出現小數點，給客人大方好記的整數。
              </li>
              <li>
                <strong>一鍵複製</strong>：產生的格式化文字能客製化，適合直接複製並貼給 Line、IG 或蝦皮的客人。
              </li>
            </ul>
          </div>
        )}

        {/* Multi-Column Responsive Grid Layout */}
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="calculator-workspace">
          
          {/* Left Column (Inputs and Parameters): Occupies 5 columns on desktop */}
          <section className="lg:col-span-5 space-y-8" id="inputs-column">
            
            {/* Component 1: Parameter Setup (Persistent) */}
            <ParameterSettings
              settings={settings}
              onSettingsChange={handleSettingsChange}
            />

            {/* Component 2: Product Input calculator */}
            <ProductCalculator
              input={input}
              onInputChange={handleInputChange}
              productName={productName}
              onProductNameChange={handleProductNameChange}
            />

          </section>

          {/* Right Column (Calculation results and Utilities): Occupies 7 columns on desktop */}
          <section className="lg:col-span-7 space-y-8" id="results-column">
            
            {/* Layout for upper half of results (Breakdowns & Copy templates) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-8 md:gap-6 lg:gap-8">
              
              {/* Component 3: Live Calculation Breakdown */}
              <CalculationResults
                result={calculationResult}
                settings={settings}
                productName={productName}
                onSaveToHistory={handleSaveToHistory}
                hasSaved={hasSaved}
              />

              {/* Component 4: Template formatting & One-click copying */}
              <QuoteCopySection
                result={calculationResult}
                settings={settings}
                productName={productName}
              />

            </div>

            {/* Component 5: Persistent History Archive log */}
            <HistoryLog
              history={history}
              onLoadItem={handleLoadHistoryItem}
              onDeleteItem={handleDeleteHistoryItem}
              onClearAll={handleClearAllHistory}
            />

          </section>

        </main>

        {/* Footer info */}
        <footer className="text-center text-[11px] text-[#A89F91] py-6 border-t border-[#E5E0D8]" id="app-footer">
          <p>© 2026 日本代購報價換算工具 · 專為效率化賣家設計 · <span className="px-2 py-0.5 bg-[#EAE7E1] rounded font-medium text-[10px]">Muji Aesthetic Theme</span></p>
          <p className="mt-1 text-[#A89F91]/80">本工具之 EMS 資費為日本郵便局 Zone 1 (アジア) 標準，匯率提供台銀及開源牌告作為參考，請以賣家實際交易與交易卡費爲準。</p>
        </footer>
      </div>
    </div>
  );
}
