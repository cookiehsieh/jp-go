import React, { useState } from "react";
import { HistoryItem } from "../types";
import { History, Search, Trash2, ArrowUpRight, RotateCcw, Calendar } from "lucide-react";

interface HistoryLogProps {
  history: HistoryItem[];
  onLoadItem: (item: HistoryItem) => void;
  onDeleteItem: (id: string) => void;
  onClearAll: () => void;
}

export default function HistoryLog({
  history,
  onLoadItem,
  onDeleteItem,
  onClearAll,
}: HistoryLogProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredHistory = history.filter((item) => {
    const term = searchTerm.toLowerCase();
    const nameMatch = item.productName.toLowerCase().includes(term);
    const priceMatch = item.result.finalQuoteTwd.toString().includes(term);
    const jpyMatch = item.input.originalPriceJpy.toString().includes(term);
    return nameMatch || priceMatch || jpyMatch;
  });

  return (
    <div className="bg-white border border-[#E5E0D8] rounded-2xl p-6 shadow-sm space-y-5" id="history-log-card">
      <div className="border-b border-[#E5E0D8] pb-4 flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[#8E8679] flex items-center gap-2 font-sans">
          <History className="w-4 h-4 text-[#A89F91]" />
          5. 歷史報價存檔 
          <span className="text-[10px] bg-[#EAE7E1] text-[#4A453E] border border-[#E5E0D8] px-2.5 py-0.5 rounded-full font-mono font-bold">
            {history.length} 筆
          </span>
        </h2>
        {history.length > 0 && (
          <button
            onClick={onClearAll}
            className="text-xs text-red-600 hover:text-red-800 font-bold transition-all cursor-pointer"
          >
            清除所有紀錄
          </button>
        )}
      </div>

      {/* Search Input */}
      {history.length > 0 && (
        <div className="relative">
          <Search className="w-4 h-4 text-[#A89F91] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜尋商品名稱、台幣或日幣價格..."
            className="w-full pl-9 pr-4 py-2 bg-[#F9F8F6] border border-[#E5E0D8] rounded-lg text-[#4A453E] text-xs focus:outline-none focus:ring-1 focus:ring-[#A89F91] focus:border-[#A89F91] transition-all"
          />
        </div>
      )}

      {/* History Items List */}
      {filteredHistory.length === 0 ? (
        <div className="text-center py-8 text-[#8E8679] text-xs space-y-1.5 border border-dashed border-[#E5E0D8] rounded-xl">
          <History className="w-8 h-8 text-[#A89F91] mx-auto" />
          <p>{history.length === 0 ? "尚無儲存的報價紀錄" : "找不到符合搜尋的報價"}</p>
          {history.length === 0 && <p className="text-[10px] text-[#A89F91]">點擊計算結果下方的「儲存此筆報價」即可記錄</p>}
        </div>
      ) : (
        <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
          {filteredHistory.map((item) => (
            <div
              key={item.id}
              className="bg-[#F9F8F6] border border-[#E5E0D8] rounded-xl p-4 space-y-3 shadow-xs hover:border-[#A89F91] transition-all"
            >
              <div className="flex justify-between items-start gap-2">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-[#4A453E] font-sans leading-snug">
                    {item.productName || "未命名商品"}
                  </h4>
                  <div className="flex items-center gap-1 text-[10px] text-[#A89F91] font-sans">
                    <Calendar className="w-3 h-3" />
                    <span>{item.timestamp}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-base font-bold text-[#4A453E]">
                    $ {item.result.finalQuoteTwd.toLocaleString()} 元
                  </div>
                  <div className="text-[10px] text-[#8E8679] font-mono">
                    {item.input.originalPriceJpy} 円 (匯率 {item.settings.exchangeRate})
                  </div>
                </div>
              </div>

              {/* Badges and detail highlights */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#E5E0D8] pt-2.5 text-[11px] text-[#8E8679]">
                <div className="flex flex-wrap gap-1.5">
                  <span className="bg-white text-[#4A453E] px-2 py-0.5 rounded border border-[#E5E0D8]">
                    重: {item.input.weightGrams}g (運: ¥{item.result.shippingJpy})
                  </span>
                  <span className="bg-white text-[#4A453E] px-2 py-0.5 rounded border border-[#E5E0D8]">
                    代購費: ${Math.round(item.result.proxyFeeTwd)}元
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onLoadItem(item)}
                    className="text-[#4A453E] hover:text-white bg-[#EAE7E1] hover:bg-[#7E6E5A] px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer font-bold"
                    title="載入此報價數據至計算器"
                  >
                    <RotateCcw className="w-3 h-3" />
                    載入
                  </button>
                  <button
                    onClick={() => onDeleteItem(item.id)}
                    className="text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 p-1.5 rounded-lg transition-all cursor-pointer"
                    title="刪除"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
