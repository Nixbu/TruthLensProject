import { Shield } from "lucide-react";

export default function Header() {
  return (
    <div className="hero-section text-center">
      <div className="container mx-auto px-4">
        <div className="flex justify-center">
          <div className="max-w-4xl">
            <Shield className="mx-auto mb-4" size={48} />
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">TruthLens</h1>
            <p className="text-xl mb-4 opacity-90">AI-Powered Misinformation Detection Tool</p>
            <p className="opacity-80">Analyze social media content, news headlines, and posts to detect misleading or biased information</p>
          </div>
        </div>
      </div>
    </div>
  );
}
