import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { storage } from "@server/storage";
import { ensureDbConnected } from "@server/next-route-utils";

let groqClient: Groq | null = null;

function getGroqClient() {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY environment variable is not configured");
  }

  if (!groqClient) {
    groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }

  return groqClient;
}

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await ensureDbConnected();
    const { id } = await context.params;
    const book = await storage.getBook(id);
    if (!book) {
      return NextResponse.json({ message: "Book not found" }, { status: 404 });
    }

    if (book.aiSummary) {
      return NextResponse.json({ summary: book.aiSummary });
    }

    let groq: Groq;
    try {
      groq = getGroqClient();
    } catch (error) {
      console.error("AI summary configuration error:", error);
      return NextResponse.json({ message: "AI summary service is not available" }, { status: 503 });
    }

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "You are an expert librarian. Summarize the following book in 3 short paragraphs: 1) What it's about, 2) Key themes, 3) Who should read it.",
        },
        {
          role: "user",
          content: `Title: ${book.title}\nAuthors: ${book.authors.join(", ")}\nDescription: ${book.description || ""}`,
        },
      ],
    });

    const summary = response.choices[0]?.message?.content || "Summary unavailable.";
    await storage.updateBook(book.id, { aiSummary: summary });

    return NextResponse.json({ summary });
  } catch (error) {
    console.error("AI summary error:", error);
    return NextResponse.json({ message: "Failed to generate summary" }, { status: 500 });
  }
}

