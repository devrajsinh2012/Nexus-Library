import { NextRequest, NextResponse } from "next/server";
import { storage } from "@server/storage";
import { api } from "@shared/routes";
import { ensureDbConnected, getAuthenticatedUser, unauthorized } from "@server/next-route-utils";

export async function GET(request: NextRequest) {
  const user = getAuthenticatedUser(request);
  if (!user) return unauthorized();

  await ensureDbConnected();
  const holds = await storage.getHolds(user.id);
  return NextResponse.json(holds);
}

export async function POST(request: NextRequest) {
  const user = getAuthenticatedUser(request);
  if (!user) return unauthorized();

  try {
    await ensureDbConnected();
    const input = api.holds.create.input.parse(await request.json());
    const hold = await storage.createHold({
      bookId: input.bookId,
      userId: user.id,
      status: "waiting",
    });

    return NextResponse.json(hold, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }
}

