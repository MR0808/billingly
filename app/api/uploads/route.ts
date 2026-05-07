import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { success: false, error: "Uploads not implemented in Phase 1" },
    { status: 501 }
  );
}

