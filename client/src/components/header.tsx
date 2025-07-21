import { Shield } from "lucide-react";

export default function Header() {
  return (
    <div className="hero-section text-center">
      <div className="container mx-auto px-4">
        <div className="flex justify-center">
          <div className="max-w-4xl">
            <Shield className="mx-auto mb-4" size={48} />
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">TruthLens</h1>
            <p className="text-xl mb-4 opacity-90">כלי מתקדם לזיהוי דיסאינפורמציה באמצעות בינה מלאכותית</p>
            <p className="opacity-80">נתח תוכן ברשתות חברתיות, כותרות חדשותיות ופוסטים כדי לזהות מידע מטעה או מוטה</p>
          </div>
        </div>
      </div>
    </div>
  );
}
