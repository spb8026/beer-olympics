import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

function requireAdmin(req: NextRequest) {
  return req.cookies.get("admin-auth")?.value === "granted";
}

/** Assign a free agent to a team and add their name to the team's players array */
export async function PATCH(req: NextRequest) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { agentId, teamId } = await req.json();

  const agentDoc = await adminDb.collection("freeAgents").doc(agentId).get();
  if (!agentDoc.exists) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  }
  const { name } = agentDoc.data() as { name: string };

  const batch = adminDb.batch();
  batch.update(adminDb.collection("freeAgents").doc(agentId), {
    assignedTeamId: teamId,
  });
  batch.update(adminDb.collection("teams").doc(teamId), {
    players: FieldValue.arrayUnion(name),
  });
  await batch.commit();

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { agentId } = await req.json();
  await adminDb.collection("freeAgents").doc(agentId).delete();
  return NextResponse.json({ success: true });
}
