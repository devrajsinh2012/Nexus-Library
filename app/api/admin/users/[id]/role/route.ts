import { NextRequest, NextResponse } from "next/server";
import { storage } from "@server/storage";
import { ensureDbConnected, requireAdmin } from "@server/next-route-utils";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const auth = requireAdmin(request);
  if (auth.response) return auth.response;

  try {
    const { role } = await request.json();
    if (!["patron", "librarian", "admin"].includes(role)) {
      return NextResponse.json({ message: "Invalid role" }, { status: 400 });
    }

    if (role === "admin" && auth.user?.role !== "admin") {
      return NextResponse.json(
        { message: "Only an admin can assign admin role" },
        { status: 403 },
      );
    }

    await ensureDbConnected();
    const { id } = await context.params;
    const user = await storage.updateUserRole(id, role);
    return NextResponse.json(user);
  } catch {
    return NextResponse.json({ message: "Failed to update role" }, { status: 500 });
  }
}

