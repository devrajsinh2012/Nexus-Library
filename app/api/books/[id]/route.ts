import { NextResponse } from "next/server";
import { storage } from "@server/storage";
import { ensureDbConnected } from "@server/next-route-utils";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  await ensureDbConnected();
  const { id } = await context.params;
  const book = await storage.getBook(id);
  if (!book) {
    return NextResponse.json({ message: "Book not found" }, { status: 404 });
  }

  return NextResponse.json(book);
}

