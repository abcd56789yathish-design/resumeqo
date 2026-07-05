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

export async function POST(request) {
  try {
    const { resumeText, jobTitle, jobDescription } = await request.json();

    if (!resumeText || resumeText.trim().length < 20) {
      return NextResponse.json(
        { error: "Please provide a resume with at least 20 characters." },
        { status: 400 }
      );
    }

    if (!jobDescription || jobDescription.trim().length < 10) {
      return NextResponse.json(
        { error: "Please provide a job description." },
        { status: 400 }
      );
    }

    const prompt = `You are an expert resume writer and career coach. Your task is to tailor the given resume to match the target job description.

Return ONLY valid JSON with this exact structure:
{
  "tailoredSummary": "A rewritten professional summary (2-3 sentences) optimized for this specific role.",
  "tailoredExperience": [
    {
      "original": "Original bullet point text",
      "tailored": "AI-rewritten bullet point that uses keywords from the job description and quantifies achievements",
      "section": "Experience"
    }
  ],
  "tailoredSkills": ["skill1", "skill2", "skill3"],
  "keywordsAdded": ["keyword1", "keyword2"],
  "keywordsRemoved": ["keyword3"],
  "fullTailoredResume": "The COMPLETE tailored resume as plain text, with all sections rewritten to match the job. Include name header, summary, experience with rewritten bullets, education, and skills sections."
}

RULES:
- Rewrite each bullet point to be more impactful, quantified, and keyword-optimized for the target role.
- Add relevant keywords from the job description that the resume is missing.
- Remove or de-emphasize skills/experience not relevant to the target role.
- Use strong action verbs (led, drove, delivered, spearheaded, optimized, architected).
- Quantify achievements with specific numbers, percentages, or dollar amounts.
- Keep the same overall structure but optimize every line for the target job.
- The fullTailoredResume should be a complete, ready-to-use resume.

Resume:
${resumeText.substring(0, 8000)}

${jobTitle ? `Target Job Title: ${jobTitle}` : ""}
Target Job Description:
${jobDescription.substring(0, 4000)}

Return ONLY valid JSON. No other text or markdown.`;

    const completion = await getOpenAIClient().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert resume tailor. Always return valid JSON only, no additional text.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 4096,
    });

    const aiResponse = completion.choices[0]?.message?.content;

    if (!aiResponse) {
      return NextResponse.json(
        { error: "AI tailoring failed. Please try again." },
        { status: 500 }
      );
    }

    let result;
    try {
      const cleaned = aiResponse
        .replace(/```json\s*/g, "")
        .replace(/```\s*/g, "")
        .trim();
      result = JSON.parse(cleaned);
    } catch (parseError) {
      console.error("Failed to parse AI response:", aiResponse);
      return NextResponse.json(
        { error: "Failed to parse tailoring results. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      original: resumeText.substring(0, 5000),
      ...result,
    });
  } catch (error) {
    console.error("Tailor API error:", error);

    if (error.status === 401) {
      return NextResponse.json(
        { error: "Invalid API key. Get a free key at https://openrouter.ai/keys and add it to .env.local." },
        { status: 500 }
      );
    }

    if (error.status === 429) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please wait a moment and try again." },
        { status: 429 }
      );
    }

    if (error.status === 402 || error.status === 403) {
      return NextResponse.json(
        { error: "Insufficient credits. Add funds to your OpenRouter account at https://openrouter.ai." },
        { status: 402 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
