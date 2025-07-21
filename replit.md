# TruthLens - AI-Powered Disinformation Detection Tool

## Overview

TruthLens is a Hebrew-language disinformation detection tool that analyzes text content from social media posts, news headlines, and other sources to identify potential misinformation, bias, and reliability issues. The application uses AI services to perform sentiment analysis, bias detection, and factuality checking, providing users with comprehensive analysis results and actionable insights.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **Styling**: TailwindCSS with shadcn/ui component library
- **State Management**: TanStack Query for server state management
- **Form Management**: React Hook Form with Zod validation
- **UI Components**: Radix UI primitives with custom styling
- **Language Support**: Right-to-left (RTL) layout for Hebrew content

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **AI Integration**: OpenRouter API with Llama 3.3 70B, Mistral 7B, and DeepSeek R1 models
- **Session Management**: PostgreSQL-based session storage
- **Build System**: Vite for frontend, esbuild for backend

### Project Structure
- **Monorepo Setup**: Single repository with shared schemas
- **Client**: React frontend in `/client` directory
- **Server**: Express backend in `/server` directory
- **Shared**: Common types and schemas in `/shared` directory

## Key Components

### Database Schema
The application uses two main database tables:
- **users**: User authentication and management
- **analysis_requests**: Stores content analysis results with metrics like reliability score, bias score, sentiment score, and detailed analysis

### AI Analysis Pipeline
- **Multi-model Analysis**: Parallel processing using multiple AI models
- **Hebrew Language Support**: Specialized models for Hebrew text analysis with English fallback
- **Metrics Calculation**: 
  - Reliability Score (0-100)
  - Bias Score (0-100) 
  - Sentiment Score (-100 to 100)
  - Category Classification (reliable/questionable/misinformation)

### API Endpoints
- **POST /api/analyze**: Main analysis endpoint for content evaluation
- **GET /api/analyses**: Retrieve recent analysis history

### Frontend Components
- **TextAnalysisForm**: Main input form with sample texts
- **AnalysisResults**: Display analysis results with visual indicators
- **FeaturesSection**: Educational content about detection capabilities
- **ExamplesSection**: Sample analysis demonstrations

## Data Flow

1. User submits text content through the frontend form
2. Content is validated using Zod schemas
3. Backend processes the request through AI analysis service
4. Multiple AI models analyze the content in parallel:
   - Sentiment analysis (Hebrew-specific or multilingual models)
   - Bias detection
   - Factuality checking
5. Results are aggregated and stored in PostgreSQL database
6. Structured response is returned to frontend
7. Results are displayed with visual indicators and detailed breakdown

## External Dependencies

### AI Services
- **OpenRouter API**: Primary AI analysis provider with free daily limits
- **Models Used**: Multi-model fallback system
  - `meta-llama/llama-3.3-70b-instruct` (Primary - Most capable)
  - `mistralai/mistral-7b-instruct` (Fallback)
  - `deepseek/deepseek-r1` (Secondary fallback)
- **Advanced Pattern Analysis**: Sophisticated fallback system with conspiracy detection

### Database
- **Neon Database**: Serverless PostgreSQL provider
- **Connection**: Uses `@neondatabase/serverless` driver
- **ORM**: Drizzle ORM with TypeScript support

### UI Libraries
- **shadcn/ui**: Component library built on Radix UI
- **TailwindCSS**: Utility-first CSS framework
- **Lucide React**: Icon library

## Deployment Strategy

### Development Environment
- **Hot Reload**: Vite dev server with HMR
- **Type Checking**: TypeScript compilation checks
- **Database Migrations**: Drizzle Kit for schema management

### Production Build
- **Frontend**: Vite build output to `dist/public`
- **Backend**: esbuild bundle to `dist/index.js`
- **Static Assets**: Served by Express in production
- **Environment Variables**: Database URL and HuggingFace API token required

### Architecture Benefits
- **Modular Design**: Clear separation between frontend, backend, and shared code
- **Type Safety**: End-to-end TypeScript with shared schemas
- **Scalable AI**: Multiple model approach with fallback mechanisms
- **Internationalization Ready**: RTL support and Hebrew-specific processing
- **Performance Optimized**: Parallel AI processing and efficient caching strategies

### Key Design Decisions
- **Serverless Database**: Chosen for scalability and reduced infrastructure management
- **Multi-model AI**: Improves accuracy and provides fallback options
- **Shared Schema**: Ensures type consistency between frontend and backend
- **Component-based UI**: Modular, reusable components for maintainability