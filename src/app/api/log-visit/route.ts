import { NextRequest, NextResponse } from "next/server";
import { getOrCreateSessionId } from "@backend/session";
import { logPageVisit } from "@backend/logging";

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { path, referrer } = body || {};
  if (!path || typeof path !== "string") {
    return NextResponse.json({ error: "Missing path" }, { status: 400 });
  }

  try {
    const sessionId = await getOrCreateSessionId();
    const userAgent = req.headers.get("user-agent") || undefined;

    await logPageVisit({
      path,
      sessionId,
      userAgent,
      referrer: typeof referrer === "string" ? referrer : undefined,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Failed to log page visit:", err);
    // Never let logging failures surface as a broken experience.
    return NextResponse.json({ ok: false });
  }
}