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
    const { text, section, tone, context } = await request.json();

    if (!text) {
      return NextResponse.json({ error: "No bullet text provided." }, { status: 400 });
    }

    const toneInstructions = {
      concise: "Make it short, punchy, and direct. Remove fluff. Use strong action verbs. Max 15 words.",
      quantified: "Add specific numbers, percentages, dollar amounts, or timeframes. Make it measurable and data-driven.",
      senior: "Rewrite with a leadership/strategic tone. Use words like spearheaded, directed, drove, orchestrated. Emphasize impact and ownership.",
    };

    const instruction = toneInstructions[tone] || toneInstructions.quantified;

    const prompt = `You are an expert resume editor. Rewrite the following resume bullet point.

Context: This bullet is from the "${section}" section of a resume.
${context ? `Additional context: ${context}` : ""}

Tone: ${instruction}

Original: "${text}"

Return ONLY the rewritten bullet text. No explanations, no quotes, no markdown.`;

    const completion = await getOpenAIClient().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are an expert resume editor. Return only the rewritten text." },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 150,
    });

    const rewrite = completion.choices[0]?.message?.content?.trim();

    if (!rewrite) {
      return NextResponse.json({ error: "Failed to generate rewrite." }, { status: 500 });
    }

    return NextResponse.json({ rewrite });
  } catch (error) {
    console.error("Rewrite API error:", error);
    return NextResponse.json({ error: error.message || "Something went wrong." }, { status: 500 });
  }
}
