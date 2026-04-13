import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

function requireAdmin(req: NextRequest) {
  return req.cookies.get("admin-auth")?.value === "granted";
}

export async function PUT(req: NextRequest) {
  if (!requireAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { playerId, playerName, teamId, teamName, games } = await req.json();
  await adminDb.collection("playerScores").doc(playerId).set({
    playerId, playerName, teamId, teamName, games,
  });
  return NextResponse.json({ success: true });
}
