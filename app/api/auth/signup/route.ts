import { NextResponse } from "next/server";
import { ensureDbConnected } from "@server/next-route-utils";
import { setSessionCookie } from "@server/next-session";
import { storage } from "@server/storage";

export async function POST(request: Request) {
  try {
    const { email, password, firstName, lastName } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
    }

    if (String(password).length < 4) {
      return NextResponse.json({ message: "Password must be at least 4 characters" }, { status: 400 });
    }

    await ensureDbConnected();

    const existing = await storage.getUserByEmail(email);
    if (existing) {
      return NextResponse.json({ message: "Email already in use" }, { status: 409 });
    }

    const user = await storage.createUserWithPassword({
      email,
      password,
      firstName: firstName || null,
      lastName: lastName || null,
      role: "patron",
    });

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
    console.error("Signup error:", error);
    return NextResponse.json({ message: "Signup failed" }, { status: 500 });
  }
}
