import { NextRequest, NextResponse } from "next/server";
import { storage } from "@server/storage";
import { ensureDbConnected, requireAdmin } from "@server/next-route-utils";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const auth = requireAdmin(request);
  if (auth.response) return auth.response;

  try {
    await ensureDbConnected();
    const { id } = await context.params;
    const updates = await request.json();
    const book = await storage.updateBook(id, updates);
    return NextResponse.json(book);
  } catch {
    return NextResponse.json({ message: "Failed to update book" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const auth = requireAdmin(request);
  if (auth.response) return auth.response;

  try {
    await ensureDbConnected();
    const { id } = await context.params;
    await storage.deleteBook(id);
    return NextResponse.json({ message: "Book deleted" });
  } catch {
    return NextResponse.json({ message: "Failed to delete book" }, { status: 500 });
  }
}

