import { NextResponse } from "next/server";
import { betaWaitlistEnabled } from "@/lib/beta-gate";
import { sameOriginOrForbid } from "@/lib/http";
import { allowWaitlistAttempt, requestIp } from "@/lib/waitlist-rate-limit";
import { joinWaitlist, WaitlistError } from "@/lib/waitlist";

export async function POST(request: Request) {
  if (!betaWaitlistEnabled()) {
    return NextResponse.json({ error: "The waitlist is closed." }, { status: 404 });
  }

  const origin = sameOriginOrForbid(request);
  if (origin) return origin;

  if (!(await allowWaitlistAttempt(requestIp(request)))) {
    return NextResponse.json(
      { error: "Too many attempts from this network. Try again in a few minutes.", code: "rate_limited" },
      { status: 429 }
    );
  }

  try {
    const body = (await request.json()) as {
      name?: unknown;
      email?: unknown;
      message?: unknown;
      consent?: unknown;
      companyWebsite?: unknown;
      source?: unknown;
    };
    const result = await joinWaitlist(body);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof WaitlistError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.status });
    }
    console.error("Waitlist signup failed", error);
    return NextResponse.json({ error: "Could not join the waitlist.", code: "unavailable" }, { status: 503 });
  }
}
