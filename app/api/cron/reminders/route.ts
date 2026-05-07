import { NextResponse } from "next/server";
import { processDueReminders } from "@/lib/reminders/reminder-processing";

function extractCronToken(req: Request): string | null {
  const auth = req.headers.get("authorization");
  if (auth && auth.toLowerCase().startsWith("bearer ")) {
    return auth.slice(7).trim();
  }
  const header = req.headers.get("x-cron-secret");
  return header ? header.trim() : null;
}

export async function GET(request: Request) {
  const secretRaw = process.env.CRON_SECRET;
  const secret = secretRaw ? secretRaw.trim().replace(/^"+|"+$/g, "") : undefined;
  if (!secret) {
    return NextResponse.json(
      { success: false, error: "Missing CRON_SECRET" },
      { status: 500 }
    );
  }

  const token = extractCronToken(request);
  if (!token || token !== secret) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const result = await processDueReminders();
  return NextResponse.json({ success: true, data: result });
}

