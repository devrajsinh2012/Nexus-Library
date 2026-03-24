import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";

export type SessionUser = {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  role: string;
  exp: number;
};

const SESSION_COOKIE = "nexus_session";
const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;

function getSecret(): string {
  return process.env.SESSION_SECRET || "nexus-library-secret";
}

function signPayload(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

function encodeToken(user: SessionUser): string {
  const payload = Buffer.from(JSON.stringify(user)).toString("base64url");
  const signature = signPayload(payload);
  return `${payload}.${signature}`;
}

function decodeToken(token: string): SessionUser | null {
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const expected = signPayload(payload);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as SessionUser;
    if (!parsed.exp || parsed.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function getSessionUser(request: NextRequest): SessionUser | null {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return decodeToken(token);
}

export function setSessionCookie(response: NextResponse, user: Omit<SessionUser, "exp">) {
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const token = encodeToken({ ...user, exp });

  response.cookies.set({
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set({
    name: SESSION_COOKIE,
    value: "",
    path: "/",
    expires: new Date(0),
  });
}
