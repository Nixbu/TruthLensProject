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
  'ממשלת ישראל מסתירה מאיתנו את האמת על הקורונה!',
  'מחקר חדש של אוניברסיטת תל אביב מראה ירידה של 15% בזיהום האוויר בגוש דן',
  'רופאים לא רוצים שתדעו על התרופה הטבעית הזאת שמרפאה הכל!'
];

export default function TextAnalysisForm({ onResult, isAnalyzing, setIsAnalyzing }: TextAnalysisFormProps) {
  const [content, setContent] = useState("");
  const [currentSample, setCurrentSample] = useState(0);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast({
        title: "שגיאה",
        description: "אנא הכנס טקסט לניתוח",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      const response = await apiRequest("POST", "/api/analyze", {
        content: content.trim(),
        language: "he"
      });

      const result: AnalysisResponse = await response.json();
      onResult(result);
      
      toast({
        title: "ניתוח הושלם בהצלחה",
        description: "תוצאות הניתוח מוצגות למטה",
      });
    } catch (error) {
      console.error("Analysis failed:", error);
      toast({
        title: "שגיאה בניתוח",
        description: "אירעה שגיאה במהלך ניתוח הטקסט. אנא נסה שנית.",
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
        <Label htmlFor="contentInput" className="text-right font-semibold">
          תוכן לניתוח:
        </Label>
        <Textarea
          id="contentInput"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="הכנס כאן את הטקסט שברצונך לבדוק..."
          rows={4}
          className="text-right"
          dir="rtl"
        />
        <div className="flex justify-between items-center text-sm text-gray-500">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSampleText}
          >
            השתמש בטקסט לדוגמה
          </Button>
          <span>מומלץ עד 280 תווים לתוצאה טובה ביותר</span>
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
              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              מנתח...
            </>
          ) : (
            "נתח תוכן"
          )}
        </Button>
      </div>
    </form>
  );
}
