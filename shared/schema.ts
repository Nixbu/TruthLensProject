import { pgTable, text, serial, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const analysisRequests = pgTable("analysis_requests", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  language: text("language").notNull().default("en"),
  reliabilityScore: decimal("reliability_score", { precision: 5, scale: 2 }),
  biasScore: decimal("bias_score", { precision: 5, scale: 2 }),
  sentimentScore: decimal("sentiment_score", { precision: 5, scale: 2 }),
  category: text("category"), // "reliable", "questionable", "misinformation"
  analysis: text("analysis"), // JSON string of detailed analysis
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertAnalysisRequestSchema = createInsertSchema(analysisRequests).pick({
  content: true,
  language: true,
});

export const analysisResponseSchema = z.object({
  reliabilityScore: z.number().min(0).max(100),
  biasScore: z.number().min(0).max(100),
  sentimentScore: z.number().min(-100).max(100),
  category: z.enum(["reliable", "questionable", "misinformation"]),
  analysis: z.object({
    positivePoints: z.array(z.string()),
    warningPoints: z.array(z.string()),
    recommendations: z.array(z.string()),
    sources: z.array(z.string()).optional(),
    confidenceLevel: z.number().min(0).max(100),
    processingTime: z.number(),
    model: z.string(),
  }),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertAnalysisRequest = z.infer<typeof insertAnalysisRequestSchema>;
export type AnalysisRequest = typeof analysisRequests.$inferSelect;
export type AnalysisResponse = z.infer<typeof analysisResponseSchema>;
