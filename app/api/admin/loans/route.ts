import { NextRequest, NextResponse } from "next/server";
import { storage } from "@server/storage";
import { ensureDbConnected, requireAdmin } from "@server/next-route-utils";

export async function GET(request: NextRequest) {
  const auth = requireAdmin(request);
  if (auth.response) return auth.response;

  try {
    await ensureDbConnected();
    const loans = await storage.getAllLoans();
    return NextResponse.json(loans);
  } catch {
    return NextResponse.json({ message: "Failed to fetch loans" }, { status: 500 });
  }
}

