import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/current-user";
import { sameOriginOrForbid } from "@/lib/http";

export async function POST(req: Request) {
  const origin = sameOriginOrForbid(req);
  if (origin) return origin;
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, tagline, story, targetGoal } = body;

    if (!title || !tagline || !story) {
      return NextResponse.json({ error: "title, tagline, and story are required" }, { status: 400 });
    }

    const lengthScore = Math.min(100, Math.round((story.length / 500) * 100));
    const clarityScore = tagline.length > 20 && tagline.length < 120 ? 95 : 70;
    const goalScore = targetGoal && targetGoal <= 50000 ? 90 : 75;
    const overallScore = Math.round((lengthScore + clarityScore + goalScore) / 3);

    const suggestions = [];
    if (story.length < 300) {
      suggestions.push("Expand your manifesto story with a clear problem statement and founder background.");
    }
    if (!tagline.toLowerCase().includes("build") && !tagline.toLowerCase().includes("open")) {
      suggestions.push("Emphasize developer autonomy or build-in-public methodology in your tagline.");
    }
    if (suggestions.length === 0) {
      suggestions.push("Pitch structure looks strong and ready for backer conversion!");
    }

    return NextResponse.json({
      score: overallScore,
      analysis: {
        lengthScore,
        clarityScore,
        goalScore,
      },
      suggestions,
      refinedTagline: `${tagline} - Built in public with verified backer milestones.`,
    });
  } catch (error) {
    console.error("Pitch refiner error:", error);
    return NextResponse.json({ error: "Failed to analyze pitch" }, { status: 500 });
  }
}
