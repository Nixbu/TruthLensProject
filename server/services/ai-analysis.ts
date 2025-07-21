import { DeepSeekAPI } from "./deepseek-api";
import type { AnalysisResponse } from "@shared/schema";

const deepSeekAPI = new DeepSeekAPI();

export async function analyzeContent(content: string, language: string = "en"): Promise<AnalysisResponse> {
  const startTime = Date.now();
  
  try {
    console.log("Using DeepSeek AI for comprehensive analysis...");
    
    const result = await deepSeekAPI.analyzeContent(content, language);
    
    const processingTime = (Date.now() - startTime) / 1000;
    
    return {
      reliabilityScore: result.reliability_score,
      biasScore: result.bias_score,
      sentimentScore: result.sentiment_score,
      category: result.category,
      analysis: {
        positivePoints: result.positive_points,
        warningPoints: result.warning_points,
        recommendations: result.recommendations,
        confidenceLevel: result.confidence_level,
        processingTime,
        model: "DeepSeek AI Chat Model"
      }
    };
  } catch (error) {
    console.error("DeepSeek analysis failed:", error);
    
    // Fallback to advanced heuristic analysis
    return generateAdvancedHeuristicAnalysis(content, language, startTime);
  }
}

function generateAdvancedHeuristicAnalysis(content: string, language: string, startTime: number): AnalysisResponse {
  // Advanced pattern-based analysis with comprehensive indicators
  let reliabilityScore = 50;
  let biasScore = 30;
  let sentimentScore = 0;
  let category: "reliable" | "questionable" | "misinformation" = "questionable";
  
  const positivePoints: string[] = [];
  const warningPoints: string[] = [];
  const recommendations: string[] = [];
  
  // Reliability indicators
  const reliablePatterns = [
    { pattern: /study|research|university|academic|peer.reviewed/i, score: 20, message: "Academic or research-based content" },
    { pattern: /according to|based on|data shows|statistics/i, score: 15, message: "References data or sources" },
    { pattern: /published|journal|report|findings/i, score: 10, message: "Published or documented information" },
    { pattern: /\b(dr\.|professor|researcher|scientist)\b/i, score: 10, message: "Expert attribution" }
  ];
  
  // Warning indicators  
  const warningPatterns = [
    { pattern: /hiding|concealing|don't want you to know|secret/i, score: 25, message: "Conspiracy-style language" },
    { pattern: /all (doctors|scientists|experts)|everyone knows|nobody talks about/i, score: 20, message: "Unsupported generalizations" },
    { pattern: /miracle|100% effective|instant cure|guaranteed/i, score: 30, message: "Exaggerated health claims" },
    { pattern: /big pharma|mainstream media|they don't want|wake up/i, score: 25, message: "Anti-establishment rhetoric" },
    { pattern: /shocking|urgent|breaking|must read/i, score: 15, message: "Sensationalist language" },
    { pattern: /only|always|never|completely|totally/i, score: 10, message: "Absolute statements" }
  ];
  
  // Sentiment patterns
  const emotionalPatterns = [
    { pattern: /amazing|incredible|fantastic|wonderful/i, sentiment: 30 },
    { pattern: /terrible|horrible|disaster|dangerous/i, sentiment: -30 },
    { pattern: /urgent|crisis|emergency|warning/i, sentiment: -20 },
    { pattern: /revolutionary|breakthrough|groundbreaking/i, sentiment: 25 }
  ];
  
  // Apply pattern analysis
  reliablePatterns.forEach(({ pattern, score, message }) => {
    if (pattern.test(content)) {
      reliabilityScore += score;
      positivePoints.push(message);
    }
  });
  
  warningPatterns.forEach(({ pattern, score, message }) => {
    if (pattern.test(content)) {
      biasScore += score;
      warningPoints.push(message);
    }
  });
  
  emotionalPatterns.forEach(({ pattern, sentiment }) => {
    if (pattern.test(content)) {
      sentimentScore += sentiment;
    }
  });
  
  // Normalize scores
  reliabilityScore = Math.max(0, Math.min(100, reliabilityScore));
  biasScore = Math.max(0, Math.min(100, biasScore));
  sentimentScore = Math.max(-100, Math.min(100, sentimentScore));
  
  // Determine category
  if (reliabilityScore >= 70 && biasScore <= 40) {
    category = "reliable";
    recommendations.push("Cross-reference with additional sources for completeness");
    recommendations.push("Verify publication date and relevance");
  } else if (reliabilityScore <= 30 || biasScore >= 70) {
    category = "misinformation";
    recommendations.push("Avoid sharing this content");
    recommendations.push("Verify claims with authoritative sources");
    recommendations.push("Be aware of potential misinformation");
  } else {
    category = "questionable";
    recommendations.push("Seek multiple independent sources");
    recommendations.push("Consider the source's credibility");
    recommendations.push("Look for expert opinions");
  }
  
  // Add default points if none found
  if (positivePoints.length === 0) {
    if (!/\b(amazing|incredible|shocking|secret|hidden)\b/i.test(content)) {
      positivePoints.push("Language appears relatively neutral");
    }
  }
  
  if (warningPoints.length === 0 && biasScore > 30) {
    warningPoints.push("Some bias indicators present");
  }
  
  const processingTime = (Date.now() - startTime) / 1000;
  const confidenceLevel = Math.min(85, 40 + (positivePoints.length + warningPoints.length) * 10);
  
  return {
    reliabilityScore,
    biasScore,
    sentimentScore,
    category,
    analysis: {
      positivePoints,
      warningPoints,
      recommendations,
      confidenceLevel,
      processingTime,
      model: "Advanced Pattern Analysis (Fallback)"
    }
  };
}