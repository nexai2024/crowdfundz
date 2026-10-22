import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/current-user";
import { sameOriginOrForbid } from "@/lib/http";
import { requestIp } from "@/lib/waitlist-rate-limit";
import { allowCommunityAttempt, CommunityError, joinProjectRoom, leaveProjectRoom } from "@/lib/community";

async function readBody(request: Request) {
  const body = (await request.json()) as { subdomain?: unknown; slug?: unknown };
  const subdomain = typeof body.subdomain === "string" ? body.subdomain.trim().toLowerCase() : "";
  const slug = typeof body.slug === "string" ? body.slug.trim().toLowerCase() : "";
  return { subdomain, slug };
}

async function authorize(request: Request): Promise<{ response: Response } | { userId: string }> {
  const origin = sameOriginOrForbid(request);
  if (origin) return { response: origin };
  if (!(await allowCommunityAttempt(requestIp(request)))) {
    return {
      response: NextResponse.json(
        { error: "Too many attempts from this network. Try again in a few minutes." },
        { status: 429 }
      ),
    };
  }
  const userId = await getSessionUserId();
  if (!userId) {
    return { response: NextResponse.json({ error: "Sign in to join a project room." }, { status: 401 }) };
  }
  return { userId };
}

export async function POST(request: Request) {
  const auth = await authorize(request);
  if ("response" in auth) return auth.response;

  try {
    const { subdomain, slug } = await readBody(request);
    const result = await joinProjectRoom(auth.userId, subdomain, slug);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof CommunityError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Community join failed", error);
    return NextResponse.json({ error: "Could not join that room." }, { status: 503 });
  }
}

export async function DELETE(request: Request) {
  const auth = await authorize(request);
  if ("response" in auth) return auth.response;

  try {
    const { subdomain, slug } = await readBody(request);
    const result = await leaveProjectRoom(auth.userId, subdomain, slug);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof CommunityError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Community leave failed", error);
    return NextResponse.json({ error: "Could not leave that room." }, { status: 503 });
  }
}
