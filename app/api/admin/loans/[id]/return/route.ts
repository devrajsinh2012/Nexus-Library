import { NextRequest, NextResponse } from "next/server";
import { storage } from "@server/storage";
import { ensureDbConnected, requireAdmin } from "@server/next-route-utils";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const auth = requireAdmin(request);
  if (auth.response) return auth.response;

  try {
    await ensureDbConnected();
    const { id } = await context.params;
    const loan = await storage.returnLoan(id);
    const book = await storage.getBook(loan.bookId);
    if (book) {
      await storage.updateBook(book.id, { availableCopies: book.availableCopies + 1 });
    }

    return NextResponse.json(loan);
  } catch {
    return NextResponse.json({ message: "Failed to return loan" }, { status: 500 });
  }
}

