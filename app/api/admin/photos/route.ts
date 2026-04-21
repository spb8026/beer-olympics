import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { cloudinary } from "@/lib/cloudinary";

function requireAdmin(req: NextRequest) {
  return req.cookies.get("admin-auth")?.value === "granted";
}

export async function GET(req: NextRequest) {
  if (!requireAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const snap = await adminDb.collection("photos").orderBy("createdAt", "desc").get();
  const photos = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return NextResponse.json(photos);
}

export async function DELETE(req: NextRequest) {
  if (!requireAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  const docRef = adminDb.collection("photos").doc(id);
  const snap = await docRef.get();
  if (snap.exists) {
    const { publicId } = snap.data() as { publicId: string };
    if (publicId) await cloudinary.uploader.destroy(publicId);
  }

  await docRef.delete();
  return NextResponse.json({ success: true });
}
