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

    await ensureDbConnected();

    const hasAdmin = await storage.hasAdminUsers();
    if (hasAdmin) {
      return NextResponse.json({ message: "First admin is already configured" }, { status: 409 });
    }

    const existing = await storage.getUserByEmail(email);
    const user = existing
      ? await storage.setUserPasswordAndRole(existing.id, password, "admin")
      : await storage.createUserWithPassword({
          email,
          password,
          firstName: firstName || null,
          lastName: lastName || null,
          role: "admin",
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
    console.error("Setup first admin error:", error);
    return NextResponse.json({ message: "Failed to setup first admin" }, { status: 500 });
  }
}
