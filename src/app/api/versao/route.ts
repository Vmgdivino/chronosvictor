import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function GET() {
  const id = process.env.VERCEL_DEPLOYMENT_ID || process.env.VERCEL_GIT_COMMIT_SHA || "local";
  return NextResponse.json({ id }, { headers: { "Cache-Control": "no-store, max-age=0" } });
}
