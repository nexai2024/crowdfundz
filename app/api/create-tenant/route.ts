import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeSubdomain, subdomainError } from "@/lib/subdomain";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      name?: string;
      email?: string;
      subdomain?: string;
      headline?: string;
    };

    const name = body.name?.trim() || "";
    const email = body.email?.trim().toLowerCase() || "";
    const subdomain = normalizeSubdomain(body.subdomain || "");
    const headline = body.headline?.trim() || null;
    const slugError = subdomainError(subdomain);

    if (!name || !email || !subdomain) {
      return NextResponse.json(
        { error: "Name, email, and subdomain are required" },
        { status: 400 }
      );
    }
    if (!email.includes("@")) {
      return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });
    }
    if (slugError) {
      return NextResponse.json({ error: slugError }, { status: 400 });
    }

    const existing = await prisma.user.findFirst({
      where: { OR: [{ subdomain }, { email }] },
      select: { subdomain: true, email: true },
    });

    if (existing?.subdomain === subdomain) {
      return NextResponse.json({ error: "That subdomain is already claimed" }, { status: 409 });
    }
    if (existing?.email === email) {
      return NextResponse.json({ error: "That email is already registered" }, { status: 409 });
    }

    const creator = await prisma.user.create({
      data: { name, email, subdomain, headline },
      select: { id: true, name: true, subdomain: true, headline: true },
    });

    return NextResponse.json(creator, { status: 201 });
  } catch (error) {
    console.error("Error creating creator:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
