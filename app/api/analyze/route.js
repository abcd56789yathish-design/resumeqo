// ============================================
// ANALYZE API (/api/analyze) - AI Resume Analysis
// ============================================
// This API endpoint:
// 1. Receives file data as base64 (JSON body)
// 2. Detects file type (PDF or DOCX)
// 3. Extracts text from the file
// 4. Sends to OpenRouter (OpenAI-compatible API) for analysis
// 5. Returns structured results (score, improvements, etc.)

import { NextResponse } from "next/server";
import OpenAI from "openai";

// Initialize OpenRouter client (OpenAI-compatible API)
// OpenRouter gives access to GPT-4, Claude, Gemini, and more.
// Get a free key at https://openrouter.ai/keys
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:3000", // Your site for OpenRouter rankings
    "X-Title": "Resumeqo", // Your app name for OpenRouter rankings
  },
});

/**
 * POST handler - receives and analyzes resumes
 * Body (JSON): {
 *   fileData: "base64encodedstring",
 *   fileName: "resume.pdf",
 *   fileType: "application/pdf",
 *   jobTitle: "Software Engineer",
 *   jobDescription: "..."
 * }
 */
export async function POST(request) {
  try {
    // ===== STEP 1: Parse the incoming JSON body =====
    const body = await request.json();
    const { fileData, fileName, fileType, jobTitle, jobDescription } = body;

    // Validate required fields
    if (!fileData || !fileName) {
      return NextResponse.json(
        { error: "No file data provided. Please upload a resume." },
        { status: 400 }
      );
    }

    // ===== STEP 2: Decode the base64 data to Buffer =====
    let buffer;
    try {
      buffer = Buffer.from(fileData, "base64");
    } catch (decodeError) {
      return NextResponse.json(
        { error: "Failed to decode file data. The file may be corrupted." },
        { status: 400 }
      );
    }

    if (buffer.length === 0) {
      return NextResponse.json(
        { error: "The uploaded file is empty." },
        { status: 400 }
      );
    }

    // ===== STEP 3: Extract text based on file type =====
    let resumeText = "";
    const extension = fileName.split(".").pop().toLowerCase();

    try {
      if (extension === "pdf") {
        // Parse PDF using pdf-parse
        const { PDFParse } = await import("pdf-parse");
        const pdf = new PDFParse({ data: buffer });
        await pdf.load();
        const result = await pdf.getText();
        resumeText = result.text || "";
      } else if (extension === "docx") {
        // Parse DOCX using mammoth
        const mammoth = await import("mammoth");
        const result = await mammoth.extractRawText({ buffer });
        resumeText = result.value || "";
      } else if (extension === "doc") {
        // For old .doc files, try mammoth first, fallback with message
        try {
          const mammoth = await import("mammoth");
          const result = await mammoth.extractRawText({ buffer });
          resumeText = result.value || "";
        } catch (docError) {
          return NextResponse.json(
            {
              error:
                "Old .doc format is not supported. Please save your resume as .docx or .pdf.",
            },
            { status: 400 }
          );
        }
      } else {
        return NextResponse.json(
          {
            error:
              "Unsupported file format. Please upload PDF (.pdf) or Word (.docx) files.",
          },
          { status: 400 }
        );
      }
    } catch (parseError) {
      console.error("File parsing error:", parseError);
      return NextResponse.json(
        {
          error:
            "Failed to read the file. Make sure it's a valid PDF or Word document.",
        },
        { status: 400 }
      );
    }

    // Check if any text was extracted
    if (!resumeText || resumeText.trim().length < 20) {
      return NextResponse.json(
        {
          error:
            "Could not extract enough text from this file. The file might be scanned images, protected, or empty.",
        },
        { status: 400 }
      );
    }

    // Trim and limit text length (OpenAI has token limits)
    resumeText = resumeText.substring(0, 8000);

    // ===== STEP 4: Build the prompt for OpenAI =====
    const prompt = `You are an expert resume reviewer and career coach.

Analyze this resume and return a JSON response with EXACTLY this format:
{
  "overallScore": 75,
  "scoreBreakdown": {
    "formatting": 80,
    "content": 70,
    "keywords": 65,
    "experience": 85,
    "education": 75
  },
  "strongPoints": [
    "Clear contact information",
    "Good work experience section",
    "Relevant skills listed"
  ],
  "improvements": [
    {
      "section": "Summary",
      "issue": "Too generic",
      "fix": "Add specific achievements"
    },
    {
      "section": "Experience",
      "issue": "No metrics used",
      "fix": "Add numbers like increased sales by 30%"
    }
  ],
  "missingKeywords": [
    "React", "Node.js", "Agile"
  ],
  "atsScore": 65,
  "atsIssues": [
    "Use standard section headings",
    "Remove tables and columns"
  ],
  "topSuggestion": "Add measurable achievements to every job"
}

Resume to analyze:
${resumeText}

${jobTitle ? `Job Title: ${jobTitle}` : ""}
${jobDescription ? `Job Description: ${jobDescription}` : ""}

Return ONLY the JSON. No other text.`;

    // ===== STEP 5: Send to OpenAI =====
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Fast and cost-effective model
      messages: [
        {
          role: "system",
          content:
            "You are an expert resume reviewer. Always return valid JSON only, no additional text.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7, // Balanced between creativity and consistency
      max_tokens: 2000, // Limit response length
    });

    // ===== STEP 6: Parse the AI response =====
    const aiResponse = completion.choices[0]?.message?.content;

    if (!aiResponse) {
      return NextResponse.json(
        { error: "AI analysis failed. Please try again." },
        { status: 500 }
      );
    }

    // Try to parse the JSON from the response
    let analysisResult;
    try {
      // Remove any markdown code block formatting if present
      const cleanedResponse = aiResponse
        .replace(/```json\s*/g, "")
        .replace(/```\s*/g, "")
        .trim();
      analysisResult = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", aiResponse);
      return NextResponse.json(
        { error: "Failed to parse analysis results. Please try again." },
        { status: 500 }
      );
    }

    // ===== STEP 7: Return the results =====
    return NextResponse.json(analysisResult);
  } catch (error) {
    console.error("Analysis API error:", error);

    // Handle specific API errors
    if (error.status === 401) {
      return NextResponse.json(
        {
          error:
            "Invalid API key. Get a free key at https://openrouter.ai/keys and add it to .env.local.",
        },
        { status: 500 }
      );
    }

    if (error.status === 429) {
      return NextResponse.json(
        {
          error:
            "Rate limit exceeded. Please wait a moment and try again.",
        },
        { status: 429 }
      );
    }

    // Handle insufficient credits (OpenRouter-specific)
    if (error.status === 402 || error.status === 403) {
      return NextResponse.json(
        {
          error:
            "Insufficient credits. Add funds to your OpenRouter account at https://openrouter.ai.",
        },
        { status: 402 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
