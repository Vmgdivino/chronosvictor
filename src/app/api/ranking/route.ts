import { listBoard, mergeBoard, sanitizeAccounts } from "@/lib/ranking-board";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json({ accounts: await listBoard() });
  } catch {
    return NextResponse.json({ accounts: [] }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { accounts?: unknown } | null;
  const accounts = sanitizeAccounts(body?.accounts);
  try {
    const saved = accounts.length ? await mergeBoard(accounts) : await listBoard();
    return NextResponse.json({ accounts: saved });
  } catch {
    return NextResponse.json({ accounts: [] }, { status: 503 });
  }
}
