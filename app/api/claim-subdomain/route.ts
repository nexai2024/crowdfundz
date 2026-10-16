import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/current-user";
import { sameOriginOrForbid } from "@/lib/http";
import { normalizeSubdomain, subdomainError } from "@/lib/subdomain";

export async function POST(request: NextRequest) {
  const origin = sameOriginOrForbid(request);
  if (origin) return origin;

  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Sign in to claim a subdomain" }, { status: 401 });
    }
    if (sessionUser.subdomain) {
      return NextResponse.json(
        { error: "This account already has a subdomain" },
        { status: 409 }
      );
    }

    const body = (await request.json()) as { subdomain?: string; headline?: string };
    const subdomain = normalizeSubdomain(body.subdomain || "");
    const headline = body.headline?.trim() || null;
    const invalid = subdomainError(subdomain);

    if (!subdomain) {
      return NextResponse.json({ error: "A subdomain is required" }, { status: 400 });
    }
    if (invalid) {
      return NextResponse.json({ error: invalid }, { status: 400 });
    }

    const creator = await prisma.user.update({
      where: { id: sessionUser.id },
      data: {
        subdomain,
        ...(headline ? { headline } : {}),
      },
      select: { id: true, subdomain: true, headline: true },
    });

    return NextResponse.json(creator);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "That subdomain is already claimed" }, { status: 409 });
    }
    console.error("Error claiming subdomain:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
