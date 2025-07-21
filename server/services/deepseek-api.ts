import OpenAI from "openai";

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

export class DeepSeekAPI {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      baseURL: 'https://api.deepseek.com',
      apiKey: 'sk-f4e5d68e323a43eea7663aabab248cbf'
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
}`;

    const userPrompt = `Analyze this text for misinformation, bias, and reliability:\n\n"${content}"`;

    try {
      const completion = await this.openai.chat.completions.create({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        model: "deepseek-chat",
        temperature: 0.3,
        max_tokens: 1000
      });

      const result = JSON.parse(completion.choices[0].message.content || '{}');
      return result;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error("DeepSeek API error:", errorMsg);
      throw new Error(`DeepSeek analysis failed: ${errorMsg}`);
    }
  }

  async analyzeSentiment(content: string): Promise<{ label: string; score: number }> {
    const systemPrompt = `Analyze the sentiment of the given text. Respond ONLY in this JSON format:
{
  "label": "POSITIVE" | "NEGATIVE" | "NEUTRAL",  
  "score": number between 0 and 1
}`;

    try {
      const completion = await this.openai.chat.completions.create({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Analyze sentiment: "${content}"` }
        ],
        model: "deepseek-chat",
        temperature: 0.3
      });

      return JSON.parse(completion.choices[0].message.content || '{}');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      throw new Error(`Sentiment analysis failed: ${errorMsg}`);
    }
  }

  async analyzeBias(content: string): Promise<{ bias_score: number; bias_indicators: string[] }> {
    const systemPrompt = `Analyze the text for bias and manipulation. Respond ONLY in this JSON format:
{
  "bias_score": number between 0 and 100,
  "bias_indicators": ["list", "of", "specific", "bias", "indicators", "found"]
}`;

    try {
      const completion = await this.openai.chat.completions.create({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Analyze bias: "${content}"` }
        ],
        model: "deepseek-chat",
        temperature: 0.3
      });

      return JSON.parse(completion.choices[0].message.content || '{}');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      throw new Error(`Bias analysis failed: ${errorMsg}`);
    }
  }
}