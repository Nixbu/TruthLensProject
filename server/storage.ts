import { users, analysisRequests, type User, type InsertUser, type AnalysisRequest, type InsertAnalysisRequest } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  createAnalysisRequest(request: InsertAnalysisRequest & {
    reliabilityScore: number;
    biasScore: number;
    sentimentScore: number;
    category: string;
    analysis: string;
  }): Promise<AnalysisRequest>;
  getAnalysisRequest(id: number): Promise<AnalysisRequest | undefined>;
  getRecentAnalysisRequests(limit?: number): Promise<AnalysisRequest[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private analysisRequests: Map<number, AnalysisRequest>;
  private currentUserId: number;
  private currentAnalysisId: number;

  constructor() {
    this.users = new Map();
    this.analysisRequests = new Map();
    this.currentUserId = 1;
    this.currentAnalysisId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createAnalysisRequest(request: InsertAnalysisRequest & {
    reliabilityScore: number;
    biasScore: number;
    sentimentScore: number;
    category: string;
    analysis: string;
  }): Promise<AnalysisRequest> {
    const id = this.currentAnalysisId++;
    const analysisRequest: AnalysisRequest = {
      id,
      content: request.content,
      language: request.language,
      reliabilityScore: request.reliabilityScore.toString(),
      biasScore: request.biasScore.toString(),
      sentimentScore: request.sentimentScore.toString(),
      category: request.category,
      analysis: request.analysis,
      createdAt: new Date(),
    };
    
    this.analysisRequests.set(id, analysisRequest);
    return analysisRequest;
  }

  async getAnalysisRequest(id: number): Promise<AnalysisRequest | undefined> {
    return this.analysisRequests.get(id);
  }

  async getRecentAnalysisRequests(limit: number = 10): Promise<AnalysisRequest[]> {
    const requests = Array.from(this.analysisRequests.values());
    return requests
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0))
      .slice(0, limit);
  }
}

export const storage = new MemStorage();
