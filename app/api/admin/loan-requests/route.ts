import { NextRequest, NextResponse } from "next/server";
import { storage } from "@server/storage";
import { ensureDbConnected, requireAdmin } from "@server/next-route-utils";

export async function GET(request: NextRequest) {
  const auth = requireAdmin(request);
  if (auth.response) return auth.response;

  try {
    await ensureDbConnected();
    const requests = await storage.getAllLoanRequests();
    return NextResponse.json(requests);
  } catch {
    return NextResponse.json({ message: "Failed to fetch loan requests" }, { status: 500 });
  }
}
