import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured in environment variables." }, 
        { status: 500 }
      );
    }

    // Direct fetch to Gemini API for ZERO cost infrastructure overhead
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ 
          role: "user",
          parts: [{ text: `You are a film production AI assistant for Marionette Studio. Keep responses concise, professional, and cinematic. User Query: ${prompt}` }] 
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 250,
        }
      })
    });

    if (!res.ok) {
      throw new Error(`Gemini API Error: ${res.statusText}`);
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "NO_RESPONSE_RECEIVED";

    return NextResponse.json({ reply: text });
  } catch (error) {
    console.error("Copilot AI Error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
