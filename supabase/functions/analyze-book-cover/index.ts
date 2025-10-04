import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { image } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("AI service is not configured");
    }

    console.log("Analyzing book cover with AI...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a book recognition expert. Analyze book cover images and provide detailed information about the book. Always respond in valid JSON format with this exact structure:
{
  "title": "The book title",
  "author": "The author name",
  "description": "A comprehensive 2-3 sentence description of the book including genre, themes, and what makes it notable",
  "availability": "Where this book can be found (Amazon, Barnes & Noble, local libraries, Project Gutenberg if public domain, etc.)"
}

If you cannot identify the book with certainty, make your best educated guess based on visible text and imagery, but mention in the description that it's an estimation.`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Please analyze this book cover and provide the title, author, description, and where it can be found."
              },
              {
                type: "image_url",
                image_url: {
                  url: image
                }
              }
            ]
          }
        ]
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.error("Rate limit exceeded");
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        console.error("Payment required");
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Failed to analyze book cover");
    }

    const data = await response.json();
    console.log("AI response received");
    
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse the JSON response from the AI
    let bookInfo;
    try {
      // Try to extract JSON from the response (AI might wrap it in markdown code blocks)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        bookInfo = JSON.parse(jsonMatch[0]);
      } else {
        bookInfo = JSON.parse(content);
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse book information");
    }

    console.log("Book analysis complete:", bookInfo.title);

    return new Response(
      JSON.stringify(bookInfo),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in analyze-book-cover function:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "An unexpected error occurred" 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
