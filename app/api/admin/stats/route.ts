import { NextRequest, NextResponse } from "next/server";
import { storage } from "@server/storage";
import { ensureDbConnected, requireAdmin } from "@server/next-route-utils";

export async function GET(request: NextRequest) {
  const auth = requireAdmin(request);
  if (auth.response) return auth.response;

  try {
    await ensureDbConnected();
    const stats = await storage.getStats();
    return NextResponse.json(stats);
  } catch {
    return NextResponse.json({ message: "Failed to fetch stats" }, { status: 500 });
  }
}

