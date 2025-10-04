import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, Sparkles, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface BookInfo {
  title: string;
  author: string;
  description: string;
  availability: string;
}

export const BookAnalyzer = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [bookInfo, setBookInfo] = useState<BookInfo | null>(null);
  const { toast } = useToast();

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file",
          variant: "destructive",
        });
        return;
      }

      setImageFile(file);
      setBookInfo(null);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeBook = async () => {
    if (!imagePreview) {
      toast({
        title: "No image selected",
        description: "Please upload a book cover image first",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setBookInfo(null);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-book-cover", {
        body: { image: imagePreview },
      });

      if (error) {
        console.error("Function error:", error);
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setBookInfo(data);
      toast({
        title: "Analysis complete!",
        description: "Book information extracted successfully",
      });
    } catch (error) {
      console.error("Error analyzing book:", error);
      toast({
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "Failed to analyze book cover. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Upload Section */}
      <Card className="p-8 border-2 border-dashed border-border hover:border-primary transition-colors">
        <label htmlFor="book-upload" className="cursor-pointer block">
          <input
            id="book-upload"
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
          <div className="flex flex-col items-center justify-center space-y-4 py-8">
            {imagePreview ? (
              <div className="relative group">
                <img
                  src={imagePreview}
                  alt="Book cover preview"
                  className="max-h-96 rounded-lg shadow-2xl transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                  <Upload className="w-12 h-12 text-white" />
                </div>
              </div>
            ) : (
              <>
                <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center">
                  <Upload className="w-12 h-12 text-primary" />
                </div>
                <div className="text-center">
                  <p className="text-lg font-medium">Upload a book cover</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Click to browse or drag and drop
                  </p>
                </div>
              </>
            )}
          </div>
        </label>
      </Card>

      {/* Analyze Button */}
      {imagePreview && (
        <Button
          onClick={analyzeBook}
          disabled={isAnalyzing}
          size="lg"
          className="w-full text-lg py-6 glow-blue"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-5 w-5" />
              Analyze Book Cover
            </>
          )}
        </Button>
      )}

      {/* Results Section */}
      {bookInfo && (
        <Card className="p-8 space-y-6 animate-in fade-in-50 duration-500">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Title</h3>
              <p className="text-2xl font-bold">{bookInfo.title}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Author</h3>
              <p className="text-xl">{bookInfo.author}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Description</h3>
              <p className="text-base leading-relaxed">{bookInfo.description}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Where to Find</h3>
              <p className="text-base leading-relaxed">{bookInfo.availability}</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
