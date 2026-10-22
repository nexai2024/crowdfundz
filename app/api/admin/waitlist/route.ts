import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/current-user";
import { sameOriginOrForbid } from "@/lib/http";
import { isPlatformAdmin } from "@/lib/platform-admin";
import { promoteWaitlistEntry, reviewWaitlistEntry, WaitlistError } from "@/lib/waitlist";

export async function POST(request: Request) {
  const origin = sameOriginOrForbid(request);
  if (origin) return origin;

  const user = await getSessionUser();
  if (!user || !isPlatformAdmin(user.email)) {
    return NextResponse.json({ error: "Admin access is required." }, { status: 403 });
  }

  try {
    const body = (await request.json()) as { id?: string; action?: string };
    if (!body.id || (body.action !== "approve" && body.action !== "reject" && body.action !== "promote")) {
      return NextResponse.json({ error: "Choose an entry and an action." }, { status: 400 });
    }

    const entry =
      body.action === "promote"
        ? await promoteWaitlistEntry(body.id)
        : await reviewWaitlistEntry(body.id, body.action);

    return NextResponse.json({
      id: entry.id,
      status: entry.status,
    });
  } catch (error) {
    if (error instanceof WaitlistError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.status });
    }
    console.error("Waitlist admin action failed", error);
    return NextResponse.json({ error: "Could not update that entry." }, { status: 500 });
  }
}
