import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req: NextRequest) {
  const { teamName, theme, players } = await req.json();
  if (!teamName?.trim() || !theme?.trim() || !Array.isArray(players)) {
    return NextResponse.json({ error: "Invalid team data" }, { status: 400 });
  }

  const trimmed = players.map((p: string) => p.trim()).filter(Boolean).slice(0, 4);
  if (trimmed.length < 2) {
    return NextResponse.json({ error: "At least 2 players required" }, { status: 400 });
  }

  const ref = await adminDb.collection("teams").add({
    teamName: teamName.trim(),
    theme: theme.trim(),
    players: trimmed,
    createdAt: FieldValue.serverTimestamp(),
  });
  return NextResponse.json({ id: ref.id });
}
