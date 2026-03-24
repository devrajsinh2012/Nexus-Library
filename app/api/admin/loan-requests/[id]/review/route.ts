import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { storage } from "@server/storage";
import { ensureDbConnected, requireAdmin } from "@server/next-route-utils";

const reviewSchema = z.object({
  action: z.enum(["approved", "rejected"]),
});

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const auth = requireAdmin(request);
  if (auth.response) return auth.response;

  try {
    await ensureDbConnected();
    const { id } = await context.params;
    const input = reviewSchema.parse(await request.json());

    const result = await storage.reviewLoanRequest(id, auth.user!.id, input.action);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ message: err.errors[0].message }, { status: 400 });
    }

    if (err instanceof Error) {
      return NextResponse.json({ message: err.message }, { status: 400 });
    }

    return NextResponse.json({ message: "Failed to review loan request" }, { status: 500 });
  }
}
