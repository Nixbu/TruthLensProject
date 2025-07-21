import { GoogleGenAI } from "@google/genai";

interface AnalysisResult {
  reliability_score: number;
  bias_score: number;
  sentiment_score: number;
  category: "reliable" | "questionable" | "misinformation";
  positive_points: string[];
  warning_points: string[];
  recommendations: string[];
  confidence_level: number;
}

export class GeminiAPI {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ 
      apiKey: process.env.GEMINI_API_KEY || "AIzaSyA7T42xLss8T_8hJytmvfofYKd_tCGsopo"
    });
  }

  async analyzeContent(content: string, language: string = "en"): Promise<AnalysisResult> {
    const systemPrompt = `You are an expert misinformation detection AI. Analyze the given text for:

1. RELIABILITY SCORE (0-100): How trustworthy and factual the content appears
2. BIAS SCORE (0-100): Level of bias, emotional manipulation, or agenda-driven language  
3. SENTIMENT SCORE (-100 to 100): Emotional tone from very negative to very positive
4. CATEGORY: "reliable", "questionable", or "misinformation"
5. POSITIVE POINTS: What makes the content trustworthy
6. WARNING POINTS: Red flags, bias indicators, suspicious claims
7. RECOMMENDATIONS: What readers should do with this information
8. CONFIDENCE LEVEL (0-100): How confident you are in your analysis

Look for these warning signs:
- Conspiracy language ("they don't want you to know", "secret", "hidden truth")
- Unsupported health claims ("miracle cure", "100% effective", "instant results")
- Anti-establishment rhetoric ("big pharma", "mainstream media lies")
- Emotional manipulation and sensationalist language
- Absolute statements without evidence
- Lack of credible sources or citations

Respond ONLY in valid JSON format like this:
{
  "reliability_score": 65,
  "bias_score": 35,
  "sentiment_score": -20,
  "category": "questionable",
  "positive_points": ["Uses some factual language", "Mentions specific data"],
  "warning_points": ["Lacks credible sources", "Uses emotional appeals"],
  "recommendations": ["Verify with authoritative sources", "Check for peer-reviewed studies"],
  "confidence_level": 80
}

Analyze this text for misinformation, bias, and reliability: "${content}"`;

    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: systemPrompt,
        config: {
          temperature: 0.3,
          maxOutputTokens: 1000,
          responseMimeType: "application/json"
        }
      });

      const result = JSON.parse(response.text || '{}');
      return result;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error("Gemini API error:", errorMsg);
      throw new Error(`Gemini analysis failed: ${errorMsg}`);
    }
  }

  async analyzeSentiment(content: string): Promise<{ label: string; score: number }> {
    const prompt = `Analyze the sentiment of this text and respond ONLY in JSON format:
{
  "label": "POSITIVE" | "NEGATIVE" | "NEUTRAL",  
  "score": number between 0 and 1
}

Text: "${content}"`;

    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash", 
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      return JSON.parse(response.text || '{}');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      throw new Error(`Sentiment analysis failed: ${errorMsg}`);
    }
  }

  async analyzeBias(content: string): Promise<{ bias_score: number; bias_indicators: string[] }> {
    const prompt = `Analyze this text for bias and manipulation. Respond ONLY in JSON format:
{
  "bias_score": number between 0 and 100,
  "bias_indicators": ["list", "of", "specific", "bias", "indicators", "found"]
}

Text: "${content}"`;

    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      return JSON.parse(response.text || '{}');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      throw new Error(`Bias analysis failed: ${errorMsg}`);
    }
  }
}