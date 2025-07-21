interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

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

export class OpenRouterAPI {
  private apiKey: string;
  private baseUrl = "https://openrouter.ai/api/v1/chat/completions";

  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY || "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";
  }

  private async makeRequest(model: string, messages: any[]): Promise<OpenRouterResponse> {
    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:5000",
        "X-Title": "TruthLens Misinformation Detector"
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.3,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return response.json();
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
      // Try Llama 3.3 70B first (most capable)
      const response = await this.makeRequest("meta-llama/llama-3.3-70b-instruct", [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ]);

      const result = JSON.parse(response.choices[0].message.content);
      return result;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.log("Llama 3.3 70B failed, trying Mistral 7B:", errorMsg);
      
      try {
        // Fallback to Mistral 7B
        const response = await this.makeRequest("mistralai/mistral-7b-instruct", [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ]);

        const result = JSON.parse(response.choices[0].message.content);
        return result;
      } catch (error2) {
        const errorMsg2 = error2 instanceof Error ? error2.message : String(error2);
        console.log("Mistral 7B failed, trying DeepSeek R1:", errorMsg2);
        
        try {
          // Fallback to DeepSeek R1
          const response = await this.makeRequest("deepseek/deepseek-r1", [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ]);

          const result = JSON.parse(response.choices[0].message.content);
          return result;
        } catch (error3) {
          const errorMsg3 = error3 instanceof Error ? error3.message : String(error3);
          console.log("All OpenRouter models failed:", errorMsg3);
          throw new Error("OpenRouter analysis failed");
        }
      }
    }
  }

  async analyzeSentiment(content: string): Promise<{ label: string; score: number }> {
    const systemPrompt = `Analyze the sentiment of the given text. Respond ONLY in this JSON format:
{
  "label": "POSITIVE" | "NEGATIVE" | "NEUTRAL",  
  "score": number between 0 and 1
}`;

    try {
      const response = await this.makeRequest("mistralai/mistral-7b-instruct", [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Analyze sentiment: "${content}"` }
      ]);

      return JSON.parse(response.choices[0].message.content);
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
      const response = await this.makeRequest("mistralai/mistral-7b-instruct", [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Analyze bias: "${content}"` }
      ]);

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      throw new Error(`Bias analysis failed: ${errorMsg}`);
    }
  }
}