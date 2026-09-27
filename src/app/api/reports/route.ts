import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getReportData } from "@/lib/attempts";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const data = await getReportData(Number(session.user.id));
  return NextResponse.json(data);
}
