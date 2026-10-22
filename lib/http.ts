import { NextResponse } from "next/server";
import { isSameOriginRequest } from "@/lib/hosts";
import { assertCampaignOwner } from "@/lib/studio";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isEmailAddress(value: string) {
  return value.length <= 200 && EMAIL.test(value);
}

export function sameOriginOrForbid(request: Request) {
  if (isSameOriginRequest(request)) return null;
  return NextResponse.json({ error: "This action has to come from the app" }, { status: 403 });
}

export async function ownerMutation(request: Request, campaignId: string) {
  const origin = sameOriginOrForbid(request);
  if (origin) return origin;
  return assertCampaignOwner(campaignId);
}
