import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/current-user";
import { isPlatformAdmin } from "@/lib/platform-admin";

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user || !isPlatformAdmin(user.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { rescueId, action, allocationId } = await req.json();

    if (action === "mark_reviewed") {
      await prisma.rescueOptIn.delete({ where: { id: rescueId } });
      return NextResponse.json({ ok: true });
    } else if (action === "release" || action === "refund") {
      await prisma.pledgeAllocation.update({
        where: { id: allocationId },
        data: { status: action === "release" ? "RELEASED" : "REFUNDED" }
      });
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Rescue admin error:", error);
    return NextResponse.json({ error: "Action failed" }, { status: 500 });
  }
}
