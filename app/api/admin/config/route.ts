import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

function requireAdmin(req: NextRequest) {
  return req.cookies.get("admin-auth")?.value === "granted";
}

export async function PATCH(req: NextRequest) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  await adminDb.collection("config").doc("site").update(body);
  return NextResponse.json({ success: true });
}
