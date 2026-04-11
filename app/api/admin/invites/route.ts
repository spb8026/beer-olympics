import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

function requireAdmin(req: NextRequest) {
  return req.cookies.get("admin-auth")?.value === "granted";
}

export async function POST(req: NextRequest) {
  if (!requireAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { name } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 400 });
  const ref = await adminDb.collection("invites").add({
    name: name.trim(),
    coming: false,
    createdAt: FieldValue.serverTimestamp(),
  });
  return NextResponse.json({ id: ref.id });
}

export async function PATCH(req: NextRequest) {
  if (!requireAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { inviteId, coming } = await req.json();
  await adminDb.collection("invites").doc(inviteId).update({ coming });
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  if (!requireAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { inviteId } = await req.json();
  await adminDb.collection("invites").doc(inviteId).delete();
  return NextResponse.json({ success: true });
}
