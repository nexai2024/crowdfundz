import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeSubdomain } from "@/lib/subdomain";

export async function GET(request: NextRequest) {
  const subdomain = normalizeSubdomain(request.nextUrl.searchParams.get("subdomain") || "");

  if (!subdomain) {
    return NextResponse.json({ error: "Subdomain is required" }, { status: 400 });
  }

  try {
    const creator = await prisma.user.findUnique({
      where: { subdomain },
      select: { id: true, name: true, subdomain: true },
    });

    if (!creator) {
      return NextResponse.json({ error: "Creator not found" }, { status: 404 });
    }

    return NextResponse.json(creator);
  } catch (error) {
    console.error("API: Error fetching creator:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
