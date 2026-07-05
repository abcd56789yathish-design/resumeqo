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

    if (!resumeText) {
      return NextResponse.json({ error: "No resume text provided." }, { status: 400 });
    }

    const prompt = `You are an expert cover letter writer. Write a tailored cover letter based on the resume and job description below.

Resume:
${resumeText.substring(0, 4000)}

${jobTitle ? `Job Title: ${jobTitle}` : ""}
${jobDescription ? `Job Description: ${jobDescription}` : ""}

Write a professional, compelling cover letter that:
1. Opens with a strong hook
2. Highlights 2-3 key achievements from the resume relevant to the role
3. Explains why the candidate is a great fit
4. Closes with a call to action
5. Uses a confident, professional tone

Format as plain text with proper paragraph breaks. Include a subject line. Do not use markdown.`;

    const completion = await getOpenAIClient().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are an expert cover letter writer. Write professional, tailored cover letters. Return only the letter text, no extra commentary." },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const letter = completion.choices[0]?.message?.content?.trim();

    if (!letter) {
      return NextResponse.json({ error: "Failed to generate cover letter." }, { status: 500 });
    }

    return NextResponse.json({ letter });
  } catch (error) {
    console.error("Cover letter API error:", error);
    return NextResponse.json({ error: error.message || "Something went wrong." }, { status: 500 });
  }
}
