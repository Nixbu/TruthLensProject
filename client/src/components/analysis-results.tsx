import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, XCircle, Cpu } from "lucide-react";
import type { AnalysisResponse } from "@shared/schema";

interface AnalysisResultsProps {
  result: AnalysisResponse;
}

export default function AnalysisResults({ result }: AnalysisResultsProps) {
  const getResultIcon = () => {
    switch (result.category) {
      case "reliable":
        return <CheckCircle className="text-green-600" size={32} />;
      case "questionable":
        return <AlertTriangle className="text-yellow-600" size={32} />;
      case "misinformation":
        return <XCircle className="text-red-600" size={32} />;
    }
  };

  const getResultTitle = () => {
    switch (result.category) {
      case "reliable":
        return "Reliable Content";
      case "questionable":
        return "Questionable Content";
      case "misinformation":
        return "Potential Misinformation";
    }
  };

  const getResultDescription = () => {
    switch (result.category) {
      case "reliable":
        return "The text appears to be reliable and based on credible sources. No significant bias indicators or unsupported claims were detected.";
      case "questionable":
        return "Possible bias indicators or lack of reliable sources detected. It's recommended to check additional sources before sharing.";
      case "misinformation":
        return "Strong indicators of potentially misleading or inaccurate information detected. It's strongly recommended to avoid sharing this content.";
    }
  };

  const getBadgeVariant = () => {
    switch (result.category) {
      case "reliable":
        return "default";
      case "questionable":
        return "secondary";
      case "misinformation":
        return "destructive";
    }
  };

  const getBadgeColor = () => {
    switch (result.category) {
      case "reliable":
        return "bg-green-500 hover:bg-green-600";
      case "questionable":
        return "bg-yellow-500 hover:bg-yellow-600";
      case "misinformation":
        return "bg-red-500 hover:bg-red-600";
    }
  };

  return (
    <div className="flex justify-center mt-6">
      <div className="w-full max-w-4xl">
        <h4 className="text-2xl font-bold text-center mb-6">Analysis Results</h4>
        
        <Card className={`analysis-card result-${result.category}`}>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                {getResultIcon()}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h5 className="text-xl font-bold">{getResultTitle()}</h5>
                  <Badge className={`text-white ${getBadgeColor()}`}>
                    {result.reliabilityScore}%
                  </Badge>
                </div>
                
                <p className="text-gray-700 mb-4">
                  {getResultDescription()}
                </p>
                
                <div className="grid md:grid-cols-2 gap-4">
                  {result.analysis.positivePoints.length > 0 && (
                    <div>
                      <h6 className="font-semibold text-green-700 mb-2">
                        <CheckCircle className="inline mr-1" size={16} />
                        Positive Points:
                      </h6>
                      <ul className="space-y-1">
                        {result.analysis.positivePoints.map((point, index) => (
                          <li key={index} className="text-sm">• {point}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {result.analysis.warningPoints.length > 0 && (
                    <div>
                      <h6 className="font-semibold text-yellow-700 mb-2">
                        <AlertTriangle className="inline mr-1" size={16} />
                        {result.category === "misinformation" ? "Warning Signs:" : "Points of Concern:"}
                      </h6>
                      <ul className="space-y-1">
                        {result.analysis.warningPoints.map((point, index) => (
                          <li key={index} className="text-sm">• {point}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {result.analysis.recommendations.length > 0 && (
                    <div className="md:col-span-2">
                      <h6 className="font-semibold text-blue-700 mb-2">
                        Recommendations:
                      </h6>
                      <ul className="space-y-1">
                        {result.analysis.recommendations.map((rec, index) => (
                          <li key={index} className="text-sm">• {rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Analysis Details */}
        <Card className="mt-4">
          <CardContent className="p-4">
            <h6 className="font-semibold mb-3">
              <Cpu className="inline mr-1" size={16} />
              AI Analysis Details
            </h6>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-gray-500 mb-1">AI Model:</div>
                <div className="font-medium">{result.analysis.model}</div>
              </div>
              <div>
                <div className="text-gray-500 mb-1">Processing Time:</div>
                <div className="font-medium">{result.analysis.processingTime.toFixed(1)} seconds</div>
              </div>
              <div>
                <div className="text-gray-500 mb-1">Confidence Level:</div>
                <div className="font-medium">{result.analysis.confidenceLevel}%</div>
              </div>
              <div>
                <div className="text-gray-500 mb-1">Bias Score:</div>
                <div className="font-medium">{result.biasScore}%</div>
              </div>
            </div>
            <div className="mt-4 text-xs text-gray-500">
              Disclaimer: These results are based on automated analysis and do not replace independent verification of sources.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
