import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { normalizeSubdomain, subdomainError } from "./lib/subdomain";

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

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // /api/auth and the rest of app/api are route handlers, not creator subdomains.
  if (isApiPath(pathname)) {
    return NextResponse.next();
  }

  // Legal pages stay on the app router even when the host is a creator subdomain.
  if (pathname === "/legal" || pathname.startsWith("/legal/") || pathname === "/community" || pathname.startsWith("/community/")) {
    return NextResponse.next();
  }

  const hostname = (req.headers.get("host") || "").split(":")[0].toLowerCase();
  if (hostname === "www.crowdventure.quest" || hostname === "www.venturesolo.quest") {
    const url = req.nextUrl.clone();
    url.hostname = hostname.slice(4);
    url.protocol = "https:";
    return NextResponse.redirect(url, 308);
  }

  const isApex = APEX_HOSTS.has(hostname);
  if (isApex) {
    return NextResponse.next();
  }

  const subdomain = normalizeSubdomain(hostname.split(".")[0] ?? "");
  // The page looks the creator up. Proxy only rewrites a well-formed host so a
  // self-fetch cannot 404 every creator page when the deployment is protected.
  if (!subdomain || subdomainError(subdomain)) {
    return new NextResponse(null, { status: 404 });
  }

  return NextResponse.rewrite(new URL(`/${subdomain}${pathname}`, req.url));
}
