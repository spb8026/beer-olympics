import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req: NextRequest) {
  const { teamName, theme, players } = await req.json();
  if (!teamName?.trim() || !theme?.trim() || !Array.isArray(players) || players.length < 2) {
    return NextResponse.json({ error: "Invalid team data" }, { status: 400 });
  }
  const ref = await adminDb.collection("teams").add({
    teamName: teamName.trim(),
    theme: theme.trim(),
    players: players.map((p: string) => p.trim()).filter(Boolean),
    createdAt: FieldValue.serverTimestamp(),
  });
  return NextResponse.json({ id: ref.id });
}
