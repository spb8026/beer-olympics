import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import type { Round, PlayerGame, TeamPair } from "@/types";

function requireAdmin(req: NextRequest) {
  const cookie = req.cookies.get("admin-auth");
  return cookie?.value === "granted";
}

export async function POST(req: NextRequest) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { gameId } = body as { gameId: string };

  // Player-game format
  if (body.playerGames !== undefined) {
    const { playerGames, gameSize } = body as {
      playerGames: PlayerGame[];
      gameSize: number;
    };
    await adminDb.collection("brackets").doc(gameId).set({
      gameId,
      generated: true,
      rounds: [],
      playerGames,
      gameSize,
      updatedAt: FieldValue.serverTimestamp(),
    });
    return NextResponse.json({ success: true });
  }

  // Standard rounds format (with optional pairings for paired-round-robin)
  const { rounds, pairings } = body as { rounds: Round[]; pairings?: TeamPair[] };
  await adminDb.collection("brackets").doc(gameId).set({
    gameId,
    generated: true,
    rounds,
    ...(pairings !== undefined && { pairings }),
    updatedAt: FieldValue.serverTimestamp(),
  });

  return NextResponse.json({ success: true });
}

export async function PATCH(req: NextRequest) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { gameId } = body as { gameId: string };

  if (body.playerGames !== undefined) {
    const { playerGames } = body as { playerGames: PlayerGame[] };
    await adminDb
      .collection("brackets")
      .doc(gameId)
      .update({ playerGames, updatedAt: FieldValue.serverTimestamp() });
    return NextResponse.json({ success: true });
  }

  const { rounds, pairings } = body as { rounds: Round[]; pairings?: TeamPair[] };
  await adminDb
    .collection("brackets")
    .doc(gameId)
    .update({
      rounds,
      ...(pairings !== undefined && { pairings }),
      updatedAt: FieldValue.serverTimestamp(),
    });

  return NextResponse.json({ success: true });
}
