import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

function requireAdmin(req: NextRequest) {
  return req.cookies.get("admin-auth")?.value === "granted";
}

// PUT replaces the entire scores document for a team
export async function PUT(req: NextRequest) {
  if (!requireAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { teamId, teamName, games, bonus } = await req.json();
  await adminDb.collection("scores").doc(teamId).set({ teamId, teamName, games, bonus });
  return NextResponse.json({ success: true });
}
