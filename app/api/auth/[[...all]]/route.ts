import { auth } from "@/lib/auth";
import { betaWaitlistEnabled } from "@/lib/beta-gate";
import { toNextJsHandler } from "better-auth/next-js";

const handlers = toNextJsHandler(auth.handler);

export const GET = handlers.GET;

export async function POST(request: Request) {
  if (betaWaitlistEnabled() && new URL(request.url).pathname.includes("/sign-up")) {
    return Response.json({ error: "waitlist only" }, { status: 403 });
  }
  return handlers.POST(request);
}
