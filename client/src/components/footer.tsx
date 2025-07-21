import { Shield } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-8 mt-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Shield size={20} />
              <h6 className="font-semibold">TruthLens</h6>
            </div>
            <p className="text-gray-400 text-sm">
              AI-powered misinformation detection tool
            </p>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-sm">
              Developed as part of academic project • 
              <a href="#" className="text-white hover:text-gray-300 mx-1">GitHub</a> • 
              <a href="#" className="text-white hover:text-gray-300 mx-1">Documentation</a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
