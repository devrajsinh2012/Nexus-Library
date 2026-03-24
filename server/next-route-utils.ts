import { NextRequest, NextResponse } from "next/server";
import { connectDB, ensureSchema } from "./db";
import { getSessionUser } from "./next-session";

let schemaReady = false;

export async function ensureDbConnected() {
  await connectDB();
  if (!schemaReady) {
    await ensureSchema();
    schemaReady = true;
  }
}

export function unauthorized(message = "Unauthorized") {
  return NextResponse.json({ message }, { status: 401 });
}

export function forbidden(message = "Forbidden") {
  return NextResponse.json({ message }, { status: 403 });
}

export function getAuthenticatedUser(request: NextRequest) {
  return getSessionUser(request);
}

export function requireAdmin(request: NextRequest) {
  const user = getSessionUser(request);
  if (!user) {
    return { user: null, response: unauthorized() };
  }

  if (user.role !== "librarian" && user.role !== "admin") {
    return {
      user: null,
      response: forbidden("Forbidden: librarian or admin role required"),
    };
  }

  return { user, response: null };
}
