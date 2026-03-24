import { NextRequest, NextResponse } from "next/server";
import { storage } from "@server/storage";
import { ensureDbConnected, requireAdmin } from "@server/next-route-utils";

export async function GET(request: NextRequest) {
  const auth = requireAdmin(request);
  if (auth.response) return auth.response;

  try {
    await ensureDbConnected();
    const users = await storage.getAllUsers();
    return NextResponse.json(users);
  } catch {
    return NextResponse.json({ message: "Failed to fetch users" }, { status: 500 });
  }
}

