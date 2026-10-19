import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isReservedSubdomain } from "./lib/subdomain";

const APEX_HOSTS = new Set([
  "crowdventure.quest",
  "venturesolo.quest",
  "localhost",
  "127.0.0.1",
]);

export const config = {
  matcher: [
    "/((?!_next/|_static/|.*\\..*).*)",
  ],
};

function isApiPath(pathname: string): boolean {
  return pathname === "/api" || pathname.startsWith("/api/");
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // /api/auth and the rest of app/api are route handlers, not creator subdomains.
  if (isApiPath(pathname)) {
    return NextResponse.next();
  }

  const hostname = (req.headers.get("host") || "").split(":")[0];
  const isApex = APEX_HOSTS.has(hostname);
  const subdomain = isApex ? "" : hostname.split(".")[0] ?? "";

  if (isApex) {
    return NextResponse.next();
  }

  if (!subdomain || isReservedSubdomain(subdomain)) {
    return new NextResponse(null, { status: 404 });
  }

  try {
    const response = await fetch(
      `${req.nextUrl.origin}/api/tenant?subdomain=${encodeURIComponent(subdomain)}`
    );

    if (response.ok) {
      return NextResponse.rewrite(new URL(`/${subdomain}${pathname}`, req.url));
    }
  } catch (error) {
    console.error("Proxy: Error fetching tenant:", error);
  }

  return new NextResponse(null, { status: 404 });
}
