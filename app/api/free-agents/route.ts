import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req: NextRequest) {
  const { name } = await req.json();
  if (!name?.trim()) {
    return NextResponse.json({ error: "Name required" }, { status: 400 });
  }
  const ref = await adminDb.collection("freeAgents").add({
    name: name.trim(),
    assignedTeamId: null,
    createdAt: FieldValue.serverTimestamp(),
  });
  return NextResponse.json({ id: ref.id });
}
