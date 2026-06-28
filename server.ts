import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with telemetry header
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// API endpoint to fetch latest exchange rates
app.get("/api/exchange-rate", async (req, res) => {
  console.log("Fetching latest JPY to TWD exchange rate...");
  
  const ai = getGeminiClient();
  
  if (ai) {
    try {
      // Query Gemini with Search Grounding to find latest Bank of Taiwan (BOT) rate
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: "請查詢台灣銀行今天最新牌告日圓(JPY)對新台幣(TWD)的匯率。請提供現金賣出（本行賣出-現金）與即期賣出（本行賣出-即期）的數值，以及今天匯率更新的時間或日期。",
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              cashSelling: {
                type: Type.NUMBER,
                description: "台灣銀行日幣現金賣出匯率（例如 0.2158）",
              },
              spotSelling: {
                type: Type.NUMBER,
                description: "台灣銀行日幣即期賣出匯率（例如 0.2144）",
              },
              updateTime: {
                type: Type.STRING,
                description: "牌告匯率的最新更新時間（如：2026/06/28 09:30）",
              },
              source: {
                type: Type.STRING,
                description: "資料來源，例如：臺灣銀行官網",
              },
            },
            required: ["cashSelling", "spotSelling", "updateTime"],
          },
        },
      });

      if (response.text) {
        const data = JSON.parse(response.text);
        console.log("Gemini parsed rate successfully:", data);
        return res.json({
          success: true,
          rates: {
            cashSelling: data.cashSelling || 0.215,
            spotSelling: data.spotSelling || 0.214,
            updateTime: data.updateTime || new Date().toLocaleString("zh-TW"),
            source: data.source || "台灣銀行（經由 Gemini 聯網查詢）",
          },
        });
      }
    } catch (error) {
      console.error("Gemini grounding exchange rate fetch failed, trying backup:", error);
    }
  } else {
    console.log("Gemini API key is not configured, running fallback exchange rate fetch...");
  }

  // Fallback 1: Fetch from a free public exchange API (e.g. exchangerate-api)
  try {
    const backupRes = await fetch("https://open.er-api.com/v6/latest/JPY");
    if (backupRes.ok) {
      const backupData = await backupRes.json();
      if (backupData && backupData.rates && backupData.rates.TWD) {
        const jpyToTwd = backupData.rates.TWD;
        console.log("Backup API rate fetched successfully:", jpyToTwd);
        
        // Formulate reasonable spot & cash selling rates based on mid-market JPY/TWD
        const spotSelling = parseFloat((jpyToTwd * 1.01).toFixed(4)); // spot has minor bank spread
        const cashSelling = parseFloat((jpyToTwd * 1.02).toFixed(4)); // cash has larger spread
        
        return res.json({
          success: true,
          rates: {
            cashSelling,
            spotSelling,
            updateTime: new Date().toLocaleString("zh-TW") + " (預估)",
            source: "國際開源匯率 API (ExchangeRate-API)",
          },
        });
      }
    }
  } catch (backupError) {
    console.error("Backup exchange rate API failed too:", backupError);
  }

  // Fallback 2: Hardcoded recent representative rate
  return res.json({
    success: true,
    rates: {
      cashSelling: 0.2165,
      spotSelling: 0.2150,
      updateTime: new Date().toLocaleString("zh-TW") + " (離線預設值)",
      source: "系統離線預設值（台銀平均參考價）",
    },
  });
});

// Vite middleware for development or serving static files for production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
