import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { storage } from "@server/storage";
import { api } from "@shared/routes";
import { ensureDbConnected, getAuthenticatedUser, unauthorized } from "@server/next-route-utils";

export async function GET(request: NextRequest) {
  const user = getAuthenticatedUser(request);
  if (!user) return unauthorized();

  await ensureDbConnected();
  const loans = await storage.getLoans(user.id);
  return NextResponse.json(loans);
}

export async function POST(request: NextRequest) {
  const user = getAuthenticatedUser(request);
  if (!user) return unauthorized();

  try {
    api.loans.create.input.parse(await request.json());
    return NextResponse.json(
      { message: "Direct checkout is disabled. Submit a loan request for librarian approval." },
      { status: 400 },
    );
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ message: err.errors[0].message }, { status: 400 });
    }

    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

