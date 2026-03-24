import { NextRequest, NextResponse } from "next/server";
import { ensureDbConnected, getAuthenticatedUser, unauthorized } from "@server/next-route-utils";
import { storage } from "@server/storage";

export async function POST(request: NextRequest) {
  const sessionUser = getAuthenticatedUser(request);
  if (!sessionUser) {
    return unauthorized();
  }

  try {
    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { message: "Current password and new password are required" },
        { status: 400 },
      );
    }

    if (String(newPassword).length < 4) {
      return NextResponse.json(
        { message: "New password must be at least 4 characters" },
        { status: 400 },
      );
    }

    await ensureDbConnected();
    const updated = await storage.updateUserPassword(
      sessionUser.id,
      String(currentPassword),
      String(newPassword),
    );

    if (!updated) {
      return NextResponse.json({ message: "Current password is incorrect" }, { status: 400 });
    }

    return NextResponse.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json({ message: "Failed to change password" }, { status: 500 });
  }
}
