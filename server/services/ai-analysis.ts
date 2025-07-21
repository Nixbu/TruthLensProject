import { huggingFaceAPI } from "./huggingface-api";
import type { AnalysisResponse } from "@shared/schema";

interface AnalysisMetrics {
  sentimentScore: number;
  biasScore: number;
  factualityScore: number;
  processingStartTime: number;
}

export async function analyzeContent(content: string, language: string = "he"): Promise<AnalysisResponse> {
  const startTime = Date.now();
  
  try {
    // Perform parallel AI analysis
    const [sentimentResult, biasScore, factualityScore] = await Promise.all([
      huggingFaceAPI.analyzeSentiment(content, language),
      huggingFaceAPI.detectBias(content),
      huggingFaceAPI.checkFactuality(content)
    ]);

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
    console.error("AI Analysis failed:", error);
    
    // Fallback analysis with basic heuristics
    return generateFallbackAnalysis(content, language, startTime);
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
  const isHebrew = language === "he";
  
  const analysis = {
    positivePoints: [] as string[],
    warningPoints: [] as string[],
    recommendations: [] as string[],
    sources: [] as string[]
  };

  // Generate positive points
  if (metrics.factualityScore > 70) {
    analysis.positivePoints.push(isHebrew ? "תוכן נראה עובדתי ומבוסס" : "Content appears factual and well-grounded");
  }
  
  if (metrics.biasScore < 30) {
    analysis.positivePoints.push(isHebrew ? "שפה ניטרלית וענייני" : "Neutral and objective language");
  }
  
  if (Math.abs(metrics.sentimentScore) < 30) {
    analysis.positivePoints.push(isHebrew ? "טון מאוזן ללא רגשניות מוגזמת" : "Balanced tone without excessive emotion");
  }

  // Generate warning points
  if (metrics.biasScore > 50) {
    analysis.warningPoints.push(isHebrew ? "זוהו סימני הטיה בתוכן" : "Bias indicators detected in content");
  }
  
  if (Math.abs(metrics.sentimentScore) > 60) {
    analysis.warningPoints.push(isHebrew ? "שימוש בשפה רגשית" : "Use of emotional language");
  }
  
  if (metrics.factualityScore < 50) {
    analysis.warningPoints.push(isHebrew ? "חוסר במקורות ברורים" : "Lack of clear sources");
  }
  
  // Check for specific warning signs in Hebrew content
  const warningPatterns = [
    { pattern: /מסתירים?|מעלימים?|לא רוצים שתדע/i, message: isHebrew ? "שפה שמרמזת על הסתרת מידע" : "Language suggesting information hiding" },
    { pattern: /הרופאים לא רוצים|הממשלה מסתירה/i, message: isHebrew ? "טענות קונספירטיביות" : "Conspiracy-type claims" },
    { pattern: /כל הרופאים|כל המדענים|כולם יודעים/i, message: isHebrew ? "הכללות רחבות ולא מבוססות" : "Broad unsupported generalizations" }
  ];

  warningPatterns.forEach(({ pattern, message }) => {
    if (pattern.test(content)) {
      analysis.warningPoints.push(message);
    }
  });

  // Generate recommendations based on category
  switch (category) {
    case "reliable":
      analysis.recommendations.push(isHebrew ? "מומלץ לבדוק מקורות נוספים להשלמת התמונה" : "Recommended to check additional sources for complete picture");
      analysis.recommendations.push(isHebrew ? "וודא שהמידע עדכני ורלוונטי" : "Ensure information is current and relevant");
      break;
      
    case "questionable":
      analysis.recommendations.push(isHebrew ? "חפש מקורות נוספים לאימות" : "Search for additional sources for verification");
      analysis.recommendations.push(isHebrew ? "בדק את הקשר המלא של המידע" : "Check the full context of the information");
      analysis.recommendations.push(isHebrew ? "היוועץ עם מומחים בתחום" : "Consult with domain experts");
      break;
      
    case "misinformation":
      analysis.recommendations.push(isHebrew ? "הימנע משיתוף התוכן" : "Avoid sharing this content");
      analysis.recommendations.push(isHebrew ? "בדק עם מקורות רשמיים ואמינים" : "Check with official and reliable sources");
      analysis.recommendations.push(isHebrew ? "דווח על תוכן מטעה אם רלוונטי" : "Report misleading content if relevant");
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

function generateFallbackAnalysis(content: string, language: string, startTime: number): AnalysisResponse {
  const isHebrew = language === "he";
  
  // Basic heuristic analysis
  let reliabilityScore = 60; // Default moderate score
  let biasScore = 30;
  let category: "reliable" | "questionable" | "misinformation" = "questionable";
  
  // Simple pattern matching for obvious cases
  const suspiciousPatterns = [
    /מסתירים?|לא רוצים שתדע|הרופאים לא רוצים/i,
    /כל ה|כולם יודעים|איש לא מדבר על/i,
  ];
  
  const reliablePatterns = [
    /מחקר|אוניברסיטה|מכון|נתונים|סטטיסטיקה/i,
    /לפי המחקר|על פי הנתונים|מקור: /i,
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
        [isHebrew ? "זוהו מקורות אמינים" : "Reliable sources detected"] : [],
      warningPoints: category === "misinformation" ? 
        [isHebrew ? "זוהו דפוסי שפה חשודים" : "Suspicious language patterns detected"] : 
        [isHebrew ? "לא ניתן לאמת באופן מלא" : "Cannot fully verify"],
      recommendations: [
        isHebrew ? "בדק מקורות נוספים" : "Check additional sources",
        isHebrew ? "היוועץ עם מומחים" : "Consult with experts"
      ],
      confidenceLevel: 40,
      processingTime: (Date.now() - startTime) / 1000,
      model: "Fallback Heuristic Analysis"
    }
  };
}
