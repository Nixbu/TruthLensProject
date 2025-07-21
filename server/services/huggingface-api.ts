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

const HF_API_TOKEN = process.env.HUGGINGFACE_API_TOKEN || "";
const HF_API_URL = "https://api-inference.huggingface.co/models";

if (!HF_API_TOKEN) {
  console.warn("Warning: HUGGINGFACE_API_TOKEN not found. AI analysis will use fallback methods.");
}

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
    // Use reliable sentiment analysis model
    const model = "cardiffnlp/twitter-roberta-base-sentiment";
    
    try {
      const result = await this.query(model, { inputs: text });
      return Array.isArray(result) ? result : [result];
    } catch (error) {
      console.error("Sentiment analysis failed:", error);
      throw error;
    }
  }

  async classifyText(text: string): Promise<any> {
    // Use zero-shot classification model
    const model = "facebook/bart-large-mnli";
    
    const candidateLabels = [
      "factual news",
      "opinion",
      "misinformation", 
      "propaganda",
      "neutral information",
      "biased content"
    ];

    try {
      const result = await this.query(model, {
        inputs: text,
        parameters: { candidate_labels: candidateLabels }
      });
      return result;
    } catch (error) {
      console.error("Text classification failed:", error);
      throw error;
    }
  }

  async detectBias(text: string): Promise<number> {
    try {
      // Use text classification to detect bias
      const classification = await this.classifyText(text);
      
      // Calculate bias score based on classification results
      let biasScore = 0;
      
      if (classification && typeof classification === 'object' && 'labels' in classification) {
        const biasLabels = ["opinion", "propaganda", "biased content"];
        const labels = classification.labels as string[];
        const scores = classification.scores as number[];
        
        labels.forEach((label: string, index: number) => {
          if (biasLabels.some(biasLabel => label.toLowerCase().includes(biasLabel))) {
            biasScore += scores[index] * 100;
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
      
      if (classification && typeof classification === 'object' && 'labels' in classification) {
        const labels = classification.labels as string[];
        const scores = classification.scores as number[];
        
        labels.forEach((label: string, index: number) => {
          const score = scores[index] * 100;
          
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
