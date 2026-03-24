import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { storage } from "@server/storage";
import { ensureDbConnected, getAuthenticatedUser, unauthorized } from "@server/next-route-utils";

const loanRequestSchema = z.object({
  bookId: z.string().min(1),
});

export async function GET(request: NextRequest) {
  const user = getAuthenticatedUser(request);
  if (!user) return unauthorized();

  try {
    await ensureDbConnected();
    const requests = await storage.getLoanRequests(user.id);
    return NextResponse.json(requests);
  } catch {
    return NextResponse.json({ message: "Failed to fetch loan requests" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const user = getAuthenticatedUser(request);
  if (!user) return unauthorized();

  try {
    await ensureDbConnected();
    const input = loanRequestSchema.parse(await request.json());

    const book = await storage.getBook(input.bookId);
    if (!book) {
      return NextResponse.json({ message: "Book not found" }, { status: 404 });
    }

    const loanRequest = await storage.createLoanRequest({
      bookId: input.bookId,
      userId: user.id,
    });

    return NextResponse.json(loanRequest, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ message: err.errors[0].message }, { status: 400 });
    }

    if (err instanceof Error) {
      return NextResponse.json({ message: err.message }, { status: 400 });
    }

    return NextResponse.json({ message: "Failed to submit loan request" }, { status: 500 });
  }
}
