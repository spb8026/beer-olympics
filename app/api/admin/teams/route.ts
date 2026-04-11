import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

function requireAdmin(req: NextRequest) {
  return req.cookies.get("admin-auth")?.value === "granted";
}

export async function DELETE(req: NextRequest) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { teamId } = await req.json();
  await adminDb.collection("teams").doc(teamId).delete();
  return NextResponse.json({ success: true });
}
