import { NextResponse } from "next/server";
import { ensureDbConnected } from "@server/next-route-utils";
import { storage } from "@server/storage";

export async function GET() {
  try {
    await ensureDbConnected();
    const hasAdmin = await storage.hasAdminUsers();
    return NextResponse.json({ needsSetup: !hasAdmin });
  } catch (error) {
    console.error("Setup status error:", error);
    return NextResponse.json({ message: "Failed to check setup status" }, { status: 500 });
  }
}
