import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ photoId: string }> }
) {
  const { photoId } = await params;
  await adminDb.collection("photos").doc(photoId).update({
    votes: FieldValue.increment(1),
  });
  return NextResponse.json({ success: true });
}
