import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

function requireAdmin(req: NextRequest) {
  return req.cookies.get("admin-auth")?.value === "granted";
}

export async function GET(req: NextRequest) {
  if (!requireAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const snap = await adminDb.collection("payments").get();
  const records: Record<string, boolean> = {};
  snap.docs.forEach((d) => {
    records[d.id] = (d.data() as { paid: boolean }).paid ?? false;
  });
  return NextResponse.json(records);
}

export async function PATCH(req: NextRequest) {
  if (!requireAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { teamId, paid } = await req.json();
  if (!teamId || typeof paid !== "boolean") {
    return NextResponse.json({ error: "teamId and paid required" }, { status: 400 });
  }
  await adminDb.collection("payments").doc(teamId).set({
    paid,
    updatedAt: FieldValue.serverTimestamp(),
  });
  return NextResponse.json({ success: true });
}
