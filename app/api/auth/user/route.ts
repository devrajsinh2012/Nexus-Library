import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@server/next-session";

export async function GET(request: NextRequest) {
  const user = getSessionUser(request);
  if (!user) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  return NextResponse.json({
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    profileImageUrl: null,
  });
}

