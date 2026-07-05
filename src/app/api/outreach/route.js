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
    const { resumeText, targetRole, targetCompany, messageType } = await request.json();

    if (!resumeText || resumeText.trim().length < 20) {
      return NextResponse.json(
        { error: "Please provide a resume with at least 20 characters." },
        { status: 400 }
      );
    }

    if (!targetRole || !targetCompany) {
      return NextResponse.json(
        { error: "Please provide both a target role and target company." },
        { status: 400 }
      );
    }

    const isLinkedIn = messageType === "linkedin";

    const prompt = `You are an expert career coach and networking specialist. Write a short, personalized cold ${isLinkedIn ? "LinkedIn message" : "email"} from a job seeker to a hiring manager or recruiter at a specific company.

The message must:
1. Reference 1-2 specific achievements from the person's resume that are highly relevant to the target role
2. Explain briefly why those achievements make them valuable to the target company specifically
3. Be concise (${isLinkedIn ? "max 300 characters like a LinkedIn DM" : "max 150 words like a short email"})
4. End with a subtle call to action (request for a brief chat or feedback)
5. Sound natural and human — NOT generic or templated
6. Absolutely NO phrases like "I'm interested in" or "I'm reaching out because" — skip the fluff

Resume highlights:
${resumeText.substring(0, 4000)}

Target Role: ${targetRole}
Target Company: ${targetCompany}

Return ONLY the message text. No subject line, no explanation, no markdown. Just the message body.`;

    const completion = await getOpenAIClient().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You write short, personalized cold ${isLinkedIn ? "LinkedIn messages" : "emails"} for job seekers. Each message references specific resume achievements relevant to the target company. Keep it concise and natural. Return only the message text.`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.8,
      max_tokens: 500,
    });

    const message = completion.choices[0]?.message?.content?.trim();

    if (!message) {
      return NextResponse.json(
        { error: "Failed to generate outreach message." },
        { status: 500 }
      );
    }

    return NextResponse.json({ message, type: messageType });
  } catch (error) {
    console.error("Outreach API error:", error);

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
