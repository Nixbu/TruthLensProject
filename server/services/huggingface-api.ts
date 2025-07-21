interface HuggingFaceResponse {
  label: string;
  score: number;
}

interface SentimentResponse extends HuggingFaceResponse {
  // Sentiment analysis specific response
}

interface ClassificationResponse extends HuggingFaceResponse {
  // Text classification specific response
}

const HF_API_TOKEN = process.env.HUGGINGFACE_API_TOKEN || process.env.HF_API_TOKEN || "";
const HF_API_URL = "https://api-inference.huggingface.co/models";

export class HuggingFaceAPI {
  private async query(modelName: string, data: any): Promise<any> {
    const response = await fetch(`${HF_API_URL}/${modelName}`, {
      headers: {
        Authorization: `Bearer ${HF_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HuggingFace API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async analyzeSentiment(text: string, language: string = "en"): Promise<SentimentResponse[]> {
    // Use multilingual sentiment model or language-specific model
    const model = language === "he" ? 
      "avichr/heBERT_sentiment_analysis" :
      "cardiffnlp/twitter-roberta-base-sentiment-latest";
    
    try {
      const result = await this.query(model, { inputs: text });
      return Array.isArray(result) ? result : [result];
    } catch (error) {
      // Fallback to English model if Hebrew model fails
      if (language === "he") {
        const fallbackResult = await this.query("cardiffnlp/twitter-roberta-base-sentiment-latest", { inputs: text });
        return Array.isArray(fallbackResult) ? fallbackResult : [fallbackResult];
      }
      throw error;
    }
  }

  async classifyText(text: string): Promise<ClassificationResponse[]> {
    // Use a general text classification model
    const model = "facebook/bart-large-mnli";
    
    const candidateLabels = [
      "factual news",
      "opinion",
      "misinformation",
      "propaganda",
      "neutral information",
      "biased content"
    ];

    const result = await this.query(model, {
      inputs: text,
      parameters: { candidate_labels: candidateLabels }
    });

    return result;
  }

  async detectBias(text: string): Promise<number> {
    try {
      // Use text classification to detect bias
      const classification = await this.classifyText(text);
      
      // Calculate bias score based on classification results
      let biasScore = 0;
      
      if (Array.isArray(classification.labels)) {
        const biasLabels = ["opinion", "propaganda", "biased content"];
        classification.labels.forEach((label: string, index: number) => {
          if (biasLabels.some(biasLabel => label.toLowerCase().includes(biasLabel))) {
            biasScore += classification.scores[index] * 100;
          }
        });
      }

      return Math.min(biasScore, 100);
    } catch (error) {
      console.warn("Bias detection failed, returning default score:", error);
      return 30; // Default moderate bias score
    }
  }

  async checkFactuality(text: string): Promise<number> {
    try {
      const classification = await this.classifyText(text);
      
      // Calculate factuality score
      let factualityScore = 50; // Default neutral score
      
      if (Array.isArray(classification.labels)) {
        classification.labels.forEach((label: string, index: number) => {
          const score = classification.scores[index] * 100;
          
          if (label.toLowerCase().includes("factual") || label.toLowerCase().includes("neutral")) {
            factualityScore += score;
          } else if (label.toLowerCase().includes("misinformation") || label.toLowerCase().includes("propaganda")) {
            factualityScore -= score;
          }
        });
      }

      return Math.max(0, Math.min(100, factualityScore));
    } catch (error) {
      console.warn("Factuality check failed, returning default score:", error);
      return 60; // Default moderate reliability score
    }
  }
}

export const huggingFaceAPI = new HuggingFaceAPI();
