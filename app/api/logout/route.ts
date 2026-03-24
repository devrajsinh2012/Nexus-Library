import { NextResponse } from "next/server";
import { clearSessionCookie } from "@server/next-session";

export async function GET(request: Request) {
  const url = new URL("/", request.url);
  const response = NextResponse.redirect(url);
  clearSessionCookie(response);
  return response;
}

