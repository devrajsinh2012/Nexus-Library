import { NextResponse } from "next/server";
import { ensureDbConnected } from "@server/next-route-utils";
import { setSessionCookie } from "@server/next-session";
import { storage } from "@server/storage";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

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
    return NextResponse.json({ message: "Signin failed" }, { status: 500 });
  }
}
