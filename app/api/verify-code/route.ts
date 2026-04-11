import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export async function POST(req: NextRequest) {
  const { code } = await req.json();

  if (!code || typeof code !== "string") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const configDoc = await adminDb.collection("config").doc("site").get();
  if (!configDoc.exists) {
    return NextResponse.json({ error: "Site not configured" }, { status: 500 });
  }

  const { accessCode } = configDoc.data() as { accessCode: string };

  if (code.trim().toUpperCase() !== accessCode.trim().toUpperCase()) {
    return NextResponse.json({ error: "Invalid code" }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set("site-access", "verified", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  return response;
}
