import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertAnalysisRequestSchema, analysisResponseSchema } from "@shared/schema";
import { analyzeContent } from "./services/ai-analysis";

export async function registerRoutes(app: Express): Promise<Server> {
  // Analysis endpoint
  app.post("/api/analyze", async (req, res) => {
    try {
      const validatedData = insertAnalysisRequestSchema.parse(req.body);
      
      // Perform AI analysis
      const analysisResult = await analyzeContent(validatedData.content, validatedData.language);
      
      // Store the analysis request and results
      await storage.createAnalysisRequest({
        ...validatedData,
        reliabilityScore: analysisResult.reliabilityScore,
        biasScore: analysisResult.biasScore,
        sentimentScore: analysisResult.sentimentScore,
        category: analysisResult.category,
        analysis: JSON.stringify(analysisResult.analysis),
      });

      // Validate the response
      const validatedResponse = analysisResponseSchema.parse(analysisResult);
      
      res.json(validatedResponse);
    } catch (error) {
      console.error("Analysis error:", error);
      res.status(500).json({ 
        error: "Failed to analyze content", 
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get recent analyses (optional endpoint for future use)
  app.get("/api/analyses", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const analyses = await storage.getRecentAnalysisRequests(limit);
      res.json(analyses);
    } catch (error) {
      console.error("Error fetching analyses:", error);
      res.status(500).json({ error: "Failed to fetch analyses" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
