import { NextResponse } from "next/server";
import { sameOriginOrForbid } from "@/lib/http";
import { requestIp } from "@/lib/waitlist-rate-limit";
import { allowRescueAttempt, createRescueOptIn, isRescueSchemaMissing, RescueError } from "@/lib/rescue";

export async function POST(request: Request) {
  const origin = sameOriginOrForbid(request);
  if (origin) return origin;

  if (!allowRescueAttempt(requestIp(request))) {
    return NextResponse.json(
      { error: "Too many attempts from this network. Try again in a few minutes." },
      { status: 429 }
    );
  }

  try {
    const body = (await request.json()) as {
      name?: unknown;
      email?: unknown;
      role?: unknown;
      project?: unknown;
      message?: unknown;
      consent?: unknown;
      companyWebsite?: unknown;
    };
    const result = await createRescueOptIn(body);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof RescueError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    if (isRescueSchemaMissing(error)) {
      return NextResponse.json({ error: "Rescue requests are not available yet." }, { status: 503 });
    }
    console.error("Rescue opt-in failed", error);
    return NextResponse.json({ error: "Could not save that request." }, { status: 503 });
  }
}
