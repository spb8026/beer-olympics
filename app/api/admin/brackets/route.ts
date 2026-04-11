import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import type { Round } from "@/types";

function requireAdmin(req: NextRequest) {
  const cookie = req.cookies.get("admin-auth");
  return cookie?.value === "granted";
}

export async function POST(req: NextRequest) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { gameId, rounds } = (await req.json()) as {
    gameId: string;
    rounds: Round[];
  };

  await adminDb
    .collection("brackets")
    .doc(gameId)
    .set({
      gameId,
      generated: true,
      rounds,
      updatedAt: FieldValue.serverTimestamp(),
    });

  return NextResponse.json({ success: true });
}

export async function PATCH(req: NextRequest) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { gameId, rounds } = (await req.json()) as {
    gameId: string;
    rounds: Round[];
  };

  await adminDb
    .collection("brackets")
    .doc(gameId)
    .update({ rounds, updatedAt: FieldValue.serverTimestamp() });

  return NextResponse.json({ success: true });
}
