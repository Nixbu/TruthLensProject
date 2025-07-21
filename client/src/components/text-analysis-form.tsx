import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { AnalysisResponse } from "@shared/schema";

interface TextAnalysisFormProps {
  onResult: (result: AnalysisResponse) => void;
  isAnalyzing: boolean;
  setIsAnalyzing: (analyzing: boolean) => void;
}

const sampleTexts = [
  'The government is hiding the truth about COVID vaccines from us!',
  'New study by Stanford University shows 15% reduction in air pollution in major cities',
  'Doctors don\'t want you to know about this natural cure that fixes everything!'
];

export default function TextAnalysisForm({ onResult, isAnalyzing, setIsAnalyzing }: TextAnalysisFormProps) {
  const [content, setContent] = useState("");
  const [currentSample, setCurrentSample] = useState(0);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast({
        title: "Error",
        description: "Please enter text to analyze",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      const response = await apiRequest("POST", "/api/analyze", {
        content: content.trim(),
        language: "en"
      });

      const result: AnalysisResponse = await response.json();
      onResult(result);
      
      toast({
        title: "Analysis Complete",
        description: "Analysis results are displayed below",
      });
    } catch (error) {
      console.error("Analysis failed:", error);
      toast({
        title: "Analysis Error",
        description: "An error occurred during text analysis. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSampleText = () => {
    setContent(sampleTexts[currentSample]);
    setCurrentSample((prev) => (prev + 1) % sampleTexts.length);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="contentInput" className="font-semibold">
          Content to analyze:
        </Label>
        <Textarea
          id="contentInput"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter the text you want to check here..."
          rows={4}
        />
        <div className="flex justify-between items-center text-sm text-gray-500">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSampleText}
          >
            Use sample text
          </Button>
          <span>Up to 280 characters recommended for best results</span>
        </div>
      </div>
      
      <div className="text-center">
        <Button
          type="submit"
          disabled={isAnalyzing}
          className="btn-analyze px-8"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            "Analyze Content"
          )}
        </Button>
      </div>
    </form>
  );
}
