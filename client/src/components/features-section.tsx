import { Card, CardContent } from "@/components/ui/card";
import { Search, Scale, Link, TrendingUp } from "lucide-react";

const features = [
  {
    icon: Search,
    title: "Fact Checking",
    description: "Verify claims against reliable sources and known databases",
    color: "text-blue-600"
  },
  {
    icon: Scale,
    title: "Bias Detection",
    description: "Analyze language and tone to identify political or ideological biases",
    color: "text-green-600"
  },
  {
    icon: Link,
    title: "Source Verification",
    description: "Evaluate the quality and reliability of cited or related sources",
    color: "text-yellow-600"
  },
  {
    icon: TrendingUp,
    title: "Sentiment Analysis",
    description: "Identify use of emotional language that may bias the reader",
    color: "text-purple-600"
  }
];

export default function FeaturesSection() {
  return (
    <div className="mt-12 mb-12">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold mb-3">What Do We Check?</h3>
        <p className="text-gray-600">Our tool analyzes multiple aspects to provide accurate assessment</p>
      </div>
      
      <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-6">
        {features.map((feature, index) => (
          <Card key={index} className="stats-card text-center">
            <CardContent className="p-6">
              <feature.icon className={`mx-auto mb-4 ${feature.color}`} size={40} />
              <h5 className="font-semibold mb-2">{feature.title}</h5>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
