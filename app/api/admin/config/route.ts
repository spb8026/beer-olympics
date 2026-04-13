import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { Timestamp } from "firebase-admin/firestore";

function requireAdmin(req: NextRequest) {
  return req.cookies.get("admin-auth")?.value === "granted";
}

export async function PATCH(req: NextRequest) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  // JSON serializes Date objects as ISO strings — convert back to a Firestore Timestamp
  if (body.eventDate) {
    body.eventDate = Timestamp.fromDate(new Date(body.eventDate));
  }

  await adminDb.collection("config").doc("site").update(body);
  return NextResponse.json({ success: true });
}
