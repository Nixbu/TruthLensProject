import Header from "@/components/header";
import TextAnalysisForm from "@/components/text-analysis-form";
import AnalysisResults from "@/components/analysis-results";
import FeaturesSection from "@/components/features-section";
import ExamplesSection from "@/components/examples-section";
import Footer from "@/components/footer";
import { useState } from "react";
import type { AnalysisResponse } from "@shared/schema";

export default function Home() {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  return (
    <div className="min-h-screen">
      <Header />
      
      <div className="container mx-auto px-4">
        {/* Main Analysis Card */}
        <div className="flex justify-center">
          <div className="w-full max-w-4xl">
            <div className="main-card">
              <div className="p-6 lg:p-8">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-3">בדק את התוכן שלך</h3>
                  <p className="text-gray-600">הכנס טקסט קצר (ציוץ, כותרת או פוסט) לניתוח</p>
                </div>
                
                <TextAnalysisForm
                  onResult={setAnalysisResult}
                  isAnalyzing={isAnalyzing}
                  setIsAnalyzing={setIsAnalyzing}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Analysis Results */}
        {analysisResult && (
          <AnalysisResults result={analysisResult} />
        )}

        {/* Features Section */}
        <FeaturesSection />

        {/* Examples Section */}
        <ExamplesSection />
      </div>

      <Footer />
    </div>
  );
}
