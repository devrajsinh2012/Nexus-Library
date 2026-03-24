import { NextResponse } from "next/server";
import { setSessionCookie } from "@server/next-session";
import { storage } from "@server/storage";
import { ensureDbConnected } from "@server/next-route-utils";

export async function GET(request: Request) {
  return NextResponse.redirect(new URL("/auth/signin", request.url));
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body ?? {};

    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
    }

    await ensureDbConnected();
    const user = await storage.authenticateUser(email, password);
    if (!user) {
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 });
    }

    const response = NextResponse.json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    });

    setSessionCookie(response, {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    });

    return response;
  } catch (error) {
    console.error("Signin error:", error);
    return NextResponse.json({ message: "Login failed" }, { status: 500 });
  }
}

