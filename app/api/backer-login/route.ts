import { NextResponse } from "next/server";
import { createBackerToken } from "../checkout/token";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");
  const token = searchParams.get("token");
  const next = searchParams.get("next") || "/";

  if (!email || !token) {
    return NextResponse.json({ error: "Missing email or token" }, { status: 400 });
  }

  const expectedToken = createBackerToken(email);
  if (token !== expectedToken) {
    return NextResponse.json({ error: "Invalid link" }, { status: 403 });
  }

  const cookieStore = await cookies();
  cookieStore.set("backer_email", email, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  return NextResponse.redirect(new URL(next, req.url));
}
