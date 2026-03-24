import { NextRequest, NextResponse } from "next/server";
import { storage } from "@server/storage";
import { ensureDbConnected, requireAdmin } from "@server/next-route-utils";

export async function GET(request: NextRequest) {
  const auth = requireAdmin(request);
  if (auth.response) return auth.response;

  try {
    await ensureDbConnected();
    const holds = await storage.getAllHolds();
    return NextResponse.json(holds);
  } catch {
    return NextResponse.json({ message: "Failed to fetch holds" }, { status: 500 });
  }
}

