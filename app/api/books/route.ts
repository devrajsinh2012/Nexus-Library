import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { storage } from "@server/storage";
import { api } from "@shared/routes";
import { ensureDbConnected, requireAdmin } from "@server/next-route-utils";

export async function GET(request: NextRequest) {
  await ensureDbConnected();
  const search = request.nextUrl.searchParams.get("search") || undefined;
  const books = await storage.getBooks(search);
  return NextResponse.json(books);
}

export async function POST(request: NextRequest) {
  const auth = requireAdmin(request);
  if (auth.response) return auth.response;

  try {
    await ensureDbConnected();
    const input = api.books.create.input.parse(await request.json());
    const book = await storage.createBook(input);
    return NextResponse.json(book, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { message: err.errors[0].message, field: err.errors[0].path.join(".") },
        { status: 400 },
      );
    }

    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

