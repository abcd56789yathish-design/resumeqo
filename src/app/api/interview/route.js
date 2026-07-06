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
    const { resumeText, jobTitle, jobDescription, question, mode } = await request.json();

    if (!question || question.trim().length < 2) {
      return NextResponse.json(
        { error: "Please enter a question." },
        { status: 400 }
      );
    }

    let systemPrompt = "You are an expert interview coach. ";
    let userPrompt = "";

    if (mode === "behavioral") {
      systemPrompt += `You help candidates prepare for behavioral interviews using the STAR method (Situation, Task, Action, Result).
Answer the candidate's question by providing a structured STAR response tailored to their background.
Return ONLY valid JSON with this structure:
{
  "type": "behavioral",
  "question": "The interview question",
  "starResponse": {
    "situation": "Describe the situation",
    "task": "Describe the task",
    "action": "Describe the action taken",
    "result": "Describe the result achieved"
  },
  "fullAnswer": "A complete, polished answer combining all STAR elements as a coherent response.",
  "tips": ["Tip 1", "Tip 2", "Tip 3"]
}`;
    } else if (mode === "technical") {
      systemPrompt += `You help candidates prepare for technical interviews.
Answer the candidate's question with a clear, accurate technical explanation.
Return ONLY valid JSON with this structure:
{
  "type": "technical",
  "question": "The interview question",
  "answer": "A thorough technical answer with explanation, code examples if relevant, and best practices.",
  "keyPoints": ["Key point 1", "Key point 2", "Key point 3"],
  "followUpQuestions": ["Follow-up 1", "Follow-up 2"]
}`;
    } else {
      systemPrompt += `You help candidates prepare for any interview question.
Provide a strategic answer tailored to their background and the role.
Return ONLY valid JSON with this structure:
{
  "type": "general",
  "question": "The interview question",
  "answer": "A comprehensive, well-structured answer.",
  "keyPoints": ["Key point 1", "Key point 2", "Key point 3"],
  "tips": ["Tip 1", "Tip 2", "Tip 3"]
}`;
    }

    systemPrompt += "\n\nAlways return valid JSON only, no additional text or markdown.";

    userPrompt = `Question: ${question}`;
    if (resumeText && resumeText.trim().length > 20) {
      userPrompt += `\n\nCandidate's Resume:\n${resumeText.substring(0, 4000)}`;
    }
    if (jobTitle) {
      userPrompt += `\n\nTarget Role: ${jobTitle}`;
    }
    if (jobDescription && jobDescription.trim().length > 10) {
      userPrompt += `\n\nJob Description:\n${jobDescription.substring(0, 2000)}`;
    }

    userPrompt += `\n\nProvide a response that helps the candidate ace this interview question. Tailor the answer to their specific background.`;

    const completion = await getOpenAIClient().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 2048,
    });

    const aiResponse = completion.choices[0]?.message?.content;

    if (!aiResponse) {
      return NextResponse.json(
        { error: "AI interview coach failed. Please try again." },
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
      return NextResponse.json(
        { error: "Failed to parse AI response. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Interview API error:", error);

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
