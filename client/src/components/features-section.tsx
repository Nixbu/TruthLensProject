import { Card, CardContent } from "@/components/ui/card";
import { Search, Scale, Link, TrendingUp } from "lucide-react";

const features = [
  {
    icon: Search,
    title: "בדיקת עובדות",
    description: "אימות טענות מול מקורות אמינים ומסדי נתונים מוכרים",
    color: "text-blue-600"
  },
  {
    icon: Scale,
    title: "זיהוי הטיה",
    description: "ניתוח שפה ולשון לזיהוי הטיות פוליטיות או אידיאולוגיות",
    color: "text-green-600"
  },
  {
    icon: Link,
    title: "בדיקת מקורות",
    description: "הערכת איכות ואמינות המקורות המצוטטים או הקשורים",
    color: "text-yellow-600"
  },
  {
    icon: TrendingUp,
    title: "ניתוח רגשות",
    description: "זיהוי שימוש בשפה רגשית שעלולה להטות את הקורא",
    color: "text-purple-600"
  }
];

export default function FeaturesSection() {
  return (
    <div className="mt-12 mb-12">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold mb-3">מה אנחנו בודקים?</h3>
        <p className="text-gray-600">הכלי שלנו מנתח מספר היבטים כדי לספק הערכה מדויקת</p>
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
