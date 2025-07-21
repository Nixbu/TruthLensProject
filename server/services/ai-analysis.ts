import { huggingFaceAPI } from "./huggingface-api";
import type { AnalysisResponse } from "@shared/schema";

interface AnalysisMetrics {
  sentimentScore: number;
  biasScore: number;
  factualityScore: number;
  processingStartTime: number;
}

export async function analyzeContent(content: string, language: string = "en"): Promise<AnalysisResponse> {
  const startTime = Date.now();
  
  try {
    // Try AI analysis first, fallback to heuristics if it fails
    let sentimentResult, biasScore, factualityScore;
    
    try {
      [sentimentResult, biasScore, factualityScore] = await Promise.all([
        huggingFaceAPI.analyzeSentiment(content, language),
        huggingFaceAPI.detectBias(content),
        huggingFaceAPI.checkFactuality(content)
      ]);
    } catch (aiError) {
      console.log("HuggingFace API unavailable, using advanced heuristic analysis");
      // Use sophisticated pattern-based analysis instead
      return generateAdvancedHeuristicAnalysis(content, language, startTime);
    }

    const metrics: AnalysisMetrics = {
      sentimentScore: extractSentimentScore(sentimentResult),
      biasScore,
      factualityScore,
      processingStartTime: startTime
    };

    // Determine overall reliability and category
    const reliabilityScore = calculateReliabilityScore(metrics);
    const category = determineCategory(reliabilityScore, metrics);
    
    // Generate detailed analysis
    const analysis = generateDetailedAnalysis(content, metrics, category, language);
    
    const processingTime = (Date.now() - startTime) / 1000;

    return {
      reliabilityScore,
      biasScore: metrics.biasScore,
      sentimentScore: metrics.sentimentScore,
      category,
      analysis: {
        ...analysis,
        processingTime,
        model: "HuggingFace Multi-Model Analysis",
        confidenceLevel: calculateConfidenceLevel(metrics)
      }
    };
  } catch (error) {
    console.error("Analysis failed:", error);
    
    // Final fallback to advanced analysis
    return generateAdvancedHeuristicAnalysis(content, language, startTime);
  }
}

function extractSentimentScore(sentimentResult: any[]): number {
  if (!Array.isArray(sentimentResult) || sentimentResult.length === 0) {
    return 0;
  }

  const sentiment = sentimentResult[0];
  let score = 0;
  
  // Convert sentiment to numeric score (-100 to 100)
  if (sentiment.label?.toLowerCase().includes('positive')) {
    score = sentiment.score * 100;
  } else if (sentiment.label?.toLowerCase().includes('negative')) {
    score = -sentiment.score * 100;
  } else if (sentiment.label?.toLowerCase().includes('neutral')) {
    score = 0;
  }
  
  return score;
}

function calculateReliabilityScore(metrics: AnalysisMetrics): number {
  // Weight different factors
  const factualityWeight = 0.5;
  const biasWeight = 0.3;
  const sentimentWeight = 0.2;
  
  // Normalize bias score (lower bias = higher reliability)
  const normalizedBias = 100 - metrics.biasScore;
  
  // Normalize sentiment extremity (less extreme = more reliable)
  const sentimentExtremity = Math.abs(metrics.sentimentScore);
  const normalizedSentiment = Math.max(0, 100 - sentimentExtremity);
  
  const score = (
    metrics.factualityScore * factualityWeight +
    normalizedBias * biasWeight +
    normalizedSentiment * sentimentWeight
  );
  
  return Math.round(Math.max(0, Math.min(100, score)));
}

function determineCategory(reliabilityScore: number, metrics: AnalysisMetrics): "reliable" | "questionable" | "misinformation" {
  if (reliabilityScore >= 75 && metrics.biasScore < 40) {
    return "reliable";
  } else if (reliabilityScore <= 40 || metrics.biasScore > 70) {
    return "misinformation";
  } else {
    return "questionable";
  }
}

function generateDetailedAnalysis(content: string, metrics: AnalysisMetrics, category: string, language: string) {
  const analysis = {
    positivePoints: [] as string[],
    warningPoints: [] as string[],
    recommendations: [] as string[],
    sources: [] as string[]
  };

  // Generate positive points
  if (metrics.factualityScore > 70) {
    analysis.positivePoints.push("Content appears factual and well-grounded");
  }
  
  if (metrics.biasScore < 30) {
    analysis.positivePoints.push("Neutral and objective language");
  }
  
  if (Math.abs(metrics.sentimentScore) < 30) {
    analysis.positivePoints.push("Balanced tone without excessive emotion");
  }

  // Generate warning points
  if (metrics.biasScore > 50) {
    analysis.warningPoints.push("Bias indicators detected in content");
  }
  
  if (Math.abs(metrics.sentimentScore) > 60) {
    analysis.warningPoints.push("Use of emotional language");
  }
  
  if (metrics.factualityScore < 50) {
    analysis.warningPoints.push("Lack of clear sources");
  }
  
  // Check for specific warning signs in English content
  const warningPatterns = [
    { pattern: /hiding?|concealing?|don't want you to know/i, message: "Language suggesting information hiding" },
    { pattern: /doctors don't want|government is hiding|they don't want/i, message: "Conspiracy-type claims" },
    { pattern: /all doctors|all scientists|everyone knows|nobody talks about/i, message: "Broad unsupported generalizations" },
    { pattern: /secret cure|miracle|100% effective|big pharma/i, message: "Suspicious health claims" },
    { pattern: /mainstream media|fake news|wake up|open your eyes/i, message: "Anti-establishment rhetoric" }
  ];

  warningPatterns.forEach(({ pattern, message }) => {
    if (pattern.test(content)) {
      analysis.warningPoints.push(message);
    }
  });

  // Generate recommendations based on category
  switch (category) {
    case "reliable":
      analysis.recommendations.push("Recommended to check additional sources for complete picture");
      analysis.recommendations.push("Ensure information is current and relevant");
      break;
      
    case "questionable":
      analysis.recommendations.push("Search for additional sources for verification");
      analysis.recommendations.push("Check the full context of the information");
      analysis.recommendations.push("Consult with domain experts");
      break;
      
    case "misinformation":
      analysis.recommendations.push("Avoid sharing this content");
      analysis.recommendations.push("Check with official and reliable sources");
      analysis.recommendations.push("Report misleading content if relevant");
      break;
  }

  return analysis;
}

function calculateConfidenceLevel(metrics: AnalysisMetrics): number {
  // Higher confidence when we have clear indicators
  let confidence = 50; // Base confidence
  
  // Increase confidence for clear cases
  if (metrics.factualityScore > 80 || metrics.factualityScore < 20) {
    confidence += 20;
  }
  
  if (metrics.biasScore > 70 || metrics.biasScore < 20) {
    confidence += 15;
  }
  
  if (Math.abs(metrics.sentimentScore) > 70) {
    confidence += 10;
  }
  
  return Math.min(95, confidence);
}

function generateAdvancedHeuristicAnalysis(content: string, language: string, startTime: number): AnalysisResponse {
  // Advanced pattern-based analysis with comprehensive indicators
  let reliabilityScore = 50; // Base score
  let biasScore = 30; // Base bias score  
  let sentimentScore = 0; // Neutral sentiment base
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
  
  // Bias/warning indicators  
  const warningPatterns = [
    { pattern: /hiding|concealing|don't want you to know|secret/i, score: 25, message: "Conspiracy-style language" },
    { pattern: /all (doctors|scientists|experts)|everyone knows|nobody talks about/i, score: 20, message: "Unsupported generalizations" },
    { pattern: /miracle|100% effective|instant cure|guaranteed/i, score: 30, message: "Exaggerated health claims" },
    { pattern: /big pharma|mainstream media|they don't want|wake up/i, score: 25, message: "Anti-establishment rhetoric" },
    { pattern: /shocking|urgent|breaking|must read/i, score: 15, message: "Sensationalist language" },
    { pattern: /only|always|never|completely|totally/i, score: 10, message: "Absolute statements" }
  ];
  
  // Sentiment analysis patterns
  const emotionalPatterns = [
    { pattern: /amazing|incredible|fantastic|wonderful/i, sentiment: 30 },
    { pattern: /terrible|horrible|disaster|dangerous/i, sentiment: -30 },
    { pattern: /urgent|crisis|emergency|warning/i, sentiment: -20 },
    { pattern: /revolutionary|breakthrough|groundbreaking/i, sentiment: 25 }
  ];
  
  // Apply reliability scoring
  reliablePatterns.forEach(({ pattern, score, message }) => {
    if (pattern.test(content)) {
      reliabilityScore += score;
      positivePoints.push(message);
    }
  });
  
  // Apply bias/warning scoring
  warningPatterns.forEach(({ pattern, score, message }) => {
    if (pattern.test(content)) {
      biasScore += score;
      warningPoints.push(message);
    }
  });
  
  // Apply sentiment scoring
  emotionalPatterns.forEach(({ pattern, sentiment }) => {
    if (pattern.test(content)) {
      sentimentScore += sentiment;
    }
  });
  
  // Normalize scores
  reliabilityScore = Math.max(0, Math.min(100, reliabilityScore));
  biasScore = Math.max(0, Math.min(100, biasScore));
  sentimentScore = Math.max(-100, Math.min(100, sentimentScore));
  
  // Determine category based on scores
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
  
  // Add general positive points if none found
  if (positivePoints.length === 0) {
    if (!/\b(amazing|incredible|shocking|secret|hidden)\b/i.test(content)) {
      positivePoints.push("Language appears relatively neutral");
    }
  }
  
  // Add warning if none found but content seems questionable
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
      model: "Advanced Pattern Analysis Engine"
    }
  };
}

function generateFallbackAnalysis(content: string, language: string, startTime: number): AnalysisResponse {
  // Basic heuristic analysis
  let reliabilityScore = 60; // Default moderate score
  let biasScore = 30;
  let category: "reliable" | "questionable" | "misinformation" = "questionable";
  
  // Simple pattern matching for obvious cases
  const suspiciousPatterns = [
    /hiding?|don't want you to know|doctors don't want/i,
    /all doctors|everyone knows|nobody talks about/i,
    /secret cure|miracle|100% effective/i,
    /wake up|open your eyes|mainstream media/i,
  ];
  
  const reliablePatterns = [
    /study|university|research|data|statistics/i,
    /according to|based on|source:|published/i,
    /peer.reviewed|journal|academic/i,
  ];

  if (suspiciousPatterns.some(pattern => pattern.test(content))) {
    reliabilityScore = 25;
    biasScore = 75;
    category = "misinformation";
  } else if (reliablePatterns.some(pattern => pattern.test(content))) {
    reliabilityScore = 80;
    biasScore = 20;
    category = "reliable";
  }

  return {
    reliabilityScore,
    biasScore,
    sentimentScore: 0,
    category,
    analysis: {
      positivePoints: category === "reliable" ? 
        ["Reliable sources detected"] : [],
      warningPoints: category === "misinformation" ? 
        ["Suspicious language patterns detected"] : 
        ["Cannot fully verify"],
      recommendations: [
        "Check additional sources",
        "Consult with experts"
      ],
      confidenceLevel: 40,
      processingTime: (Date.now() - startTime) / 1000,
      model: "Fallback Heuristic Analysis"
    }
  };
}
