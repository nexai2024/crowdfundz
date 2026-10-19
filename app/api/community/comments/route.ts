import { NextResponse } from "next/server";
import { addProjectComment, allowCommunityAttempt, CommunityError } from "@/lib/community";
import { getSessionUserId } from "@/lib/current-user";
import { sameOriginOrForbid } from "@/lib/http";
import { requestIp } from "@/lib/waitlist-rate-limit";

export async function POST(request: Request) {
  const origin = sameOriginOrForbid(request);
  if (origin) return origin;

  if (!allowCommunityAttempt(requestIp(request))) {
    return NextResponse.json(
      { error: "Too many attempts from this network. Try again in a few minutes." },
      { status: 429 }
    );
  }

  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Sign in to comment." }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { subdomain?: unknown; slug?: unknown; body?: unknown };
    const subdomain = typeof body.subdomain === "string" ? body.subdomain.trim().toLowerCase() : "";
    const slug = typeof body.slug === "string" ? body.slug.trim().toLowerCase() : "";
    const text = typeof body.body === "string" ? body.body : "";
    const comment = await addProjectComment(userId, subdomain, slug, text);
    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    if (error instanceof CommunityError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Community comment failed", error);
    return NextResponse.json({ error: "Could not post that comment." }, { status: 503 });
  }
}
