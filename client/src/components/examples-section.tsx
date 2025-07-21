import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const examples = [
  {
    category: "Political Tweets",
    text: "The government is hiding the truth about...",
    result: "Bias Detected",
    variant: "secondary" as const,
    color: "text-yellow-600"
  },
  {
    category: "News Headlines",
    text: "New study shows 15% reduction in air pollution",
    result: "Reliable",
    variant: "default" as const,
    color: "text-green-600"
  },
  {
    category: "Social Media Posts",
    text: "Doctors don't want you to know about this cure...",
    result: "Misinformation",
    variant: "destructive" as const,
    color: "text-red-600"
  }
];

export default function ExamplesSection() {
  return (
    <div className="mb-12">
      <Card>
        <CardContent className="p-6">
          <h5 className="text-xl font-bold text-center mb-6">Usage Examples</h5>
          <div className="grid md:grid-cols-3 gap-4">
            {examples.map((example, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <h6 className={`font-semibold mb-2 ${example.color}`}>
                  {example.category}
                </h6>
                <p className="text-sm text-gray-700 mb-3">
                  "{example.text}"
                </p>
                <Badge variant={example.variant}>
                  {example.result}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
