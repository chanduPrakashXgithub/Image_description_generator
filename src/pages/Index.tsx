import { BookAnalyzer } from "@/components/BookAnalyzer";
import { BookOpen } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Gradient glow effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-96 bg-[var(--gradient-glow)] pointer-events-none" />

      <div className="relative z-10 container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h1 className="text-5xl font-bold tracking-tight">
            Book Cover Analyzer
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Upload any book cover and know  more about  the title, author, and where to find it
          </p>
        </div>

        {/* Main Component */}
        <BookAnalyzer />

        {/* Footer */}
        <div className="text-center mt-16 text-sm text-muted-foreground">
          Powered by AI vision technology
        </div>
      </div>
    </div>
  );
};

export default Index;
