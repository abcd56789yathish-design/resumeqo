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

let openai;

function getOpenAIClient() {
  if (!openai) {
    openai = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENROUTER_API_KEY,
      defaultHeaders: {
        "HTTP-Referer": process.env.SITE_URL || "http://localhost:3000",
        "X-Title": "Resumeqo",
      },
    });
  }
  return openai;
}

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

    // ===== STEP 2: Decode the base64 data to Uint8Array =====
    let uint8Array;
    let buffer;
    try {
      buffer = Buffer.from(fileData, "base64");
      uint8Array = new Uint8Array(buffer);
    } catch (decodeError) {
      return NextResponse.json(
        { error: "Failed to decode file data. The file may be corrupted." },
        { status: 400 }
      );
    }

    if (uint8Array.length === 0) {
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
        if (typeof globalThis.DOMMatrix === "undefined") {
          const { DOMMatrix } = await import("@napi-rs/canvas");
          globalThis.DOMMatrix = DOMMatrix;
        }
        const { PDFParse, VerbosityLevel } = await import("pdf-parse");
        const parser = new PDFParse({ data: buffer, verbosity: VerbosityLevel.ERRORS });
        const result = await parser.getText();
        resumeText = result.text;
        await parser.destroy();
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
      const detail = parseError?.message || "Unknown parsing error";
      return NextResponse.json(
        { error: `Failed to read the file: ${detail}` },
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

Analyze this resume and return a JSON response with EXACTLY this structure:

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
    "Good work experience section"
  ],
  "improvements": [
    {
      "section": "Experience",
      "originalText": "Responsible for managing team",
      "issue": "Weak passive verb",
      "fix": "Led a team of 5 engineers",
      "rewrites": {
        "concise": "Led team of 5 engineers",
        "quantified": "Led team of 5 engineers, delivering 3 major projects on time",
        "senior": "Spearheaded cross-functional engineering team of 5, driving 3 major initiatives to completion"
      },
      "metricPrompt": null
    },
    {
      "section": "Experience",
      "originalText": "Helped improve sales",
      "issue": "No metrics",
      "fix": "Increased sales by 30% within 6 months",
      "rewrites": {
        "concise": "Boosted sales revenue",
        "quantified": "Increased sales by 30% ($500K) within 6 months",
        "senior": "Drove 30% revenue growth ($500K) across territory in 6 months"
      },
      "metricPrompt": "How much did sales improve? (e.g., 30%, $500K)"
    }
  ],
  "missingKeywords": [
    {"keyword": "React", "importance": "high", "frequency": 5},
    {"keyword": "Node.js", "importance": "medium", "frequency": 3},
    {"keyword": "Agile", "importance": "medium", "frequency": 2}
  ],
  "keywordGap": {
    "fromJD": ${jobDescription ? `true` : `false`},
    "missingFromResume": [
      {"keyword": "TypeScript", "importance": "high", "mentionedInJD": ${jobDescription ? 4 : 0}},
      {"keyword": "CI/CD", "importance": "medium", "mentionedInJD": ${jobDescription ? 2 : 0}}
    ],
    "presentInResume": [
      {"keyword": "Python", "importance": "high", "mentionedInJD": ${jobDescription ? 3 : 0}}
    ]
  },
  "atsScore": 65,
  "atsIssues": [
    "Use standard section headings",
    "Remove tables and columns"
  ],
  "topSuggestion": "Add measurable achievements to every job",
  "industryBenchmark": {
    "percentile": 72,
    "role": "${jobTitle || "General"}",
    "averageScore": 68,
    "topScore": 92
  },
  "bullets": [
    {
      "text": "Responsible for managing a team",
      "section": "Experience",
      "type": "weak",
      "rewrites": {
        "concise": "Managed engineering team",
        "quantified": "Managed team of 5 engineers, shipped 12 features",
        "senior": "Directed engineering team of 5, delivering 12 features ahead of schedule"
      },
      "metricPrompt": null
    },
    {
      "text": "Helped increase sales",
      "section": "Experience",
      "type": "needs-metrics",
      "rewrites": {
        "concise": "Increased sales revenue",
        "quantified": "Increased sales by 35% ($400K) in Q3",
        "senior": "Drove 35% revenue growth ($400K) as lead strategist"
      },
      "metricPrompt": "What was the sales increase? (% or $ amount)"
    }
  ]
}

GUIDELINES:
- improvements: list 3-8 specific issues. For each, provide originalText, issue, fix, and rewrites (concise/quantified/senior variants). Set metricPrompt only when metrics are missing.
- missingKeywords: simple list of keywords the resume lacks (synthesized from common industry terms${jobDescription ? " and the job description" : ""}).
- keywordGap: if a job description is provided, extract keywords from it and compare. Otherwise, set fromJD=false and use common industry keywords.
- bullets: list 3-6 individual bullet points that need rewriting. Include rewrites and metricPrompt where applicable.
- industryBenchmark: estimate how this resume ranks.

Resume to analyze:
${resumeText}

${jobTitle ? `Job Title: ${jobTitle}` : ""}
${jobDescription ? `Job Description: ${jobDescription}` : ""}

Return ONLY valid JSON. No other text or markdown.`;

    // ===== STEP 5: Send to OpenAI =====
    const completion = await getOpenAIClient().chat.completions.create({
      model: "gpt-4o-mini",
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
      temperature: 0.7,
      max_tokens: 4096,
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

    // ===== STEP 7: Return the results (with extracted text for cover letter) =====
    return NextResponse.json({
      ...analysisResult,
      _resumeText: resumeText.substring(0, 5000),
    });
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
