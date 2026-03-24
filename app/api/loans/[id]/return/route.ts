import { NextRequest, NextResponse } from "next/server";
import { LoanNotFoundError, storage } from "@server/storage";
import { ensureDbConnected, getAuthenticatedUser, unauthorized } from "@server/next-route-utils";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const user = getAuthenticatedUser(request);
  if (!user) return unauthorized();

  try {
    await ensureDbConnected();
    const { id } = await context.params;
    const loan = await storage.returnLoan(id);
    const book = await storage.getBook(loan.bookId);
    if (book) {
      await storage.updateBook(book.id, { availableCopies: book.availableCopies + 1 });
    }

    return NextResponse.json(loan);
  } catch (error) {
    if (error instanceof LoanNotFoundError) {
      return NextResponse.json({ message: "Loan not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Failed to return loan" }, { status: 500 });
  }
}

