import { NextRequest, NextResponse } from "next/server";
import { storage } from "@server/storage";
import { ensureDbConnected, requireAdmin } from "@server/next-route-utils";

export async function GET(request: NextRequest) {
  const auth = requireAdmin(request);
  if (auth.response) return auth.response;

  await ensureDbConnected();
  const search = request.nextUrl.searchParams.get("search") || undefined;
  const books = await storage.getBooks(search);
  return NextResponse.json(books);
}

