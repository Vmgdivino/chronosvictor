import { franchises } from "@/lib/franchises";
import { BlobNotFoundError, BlobPreconditionFailedError, get, put } from "@vercel/blob";

const PATH = "ranking/board.json";

const allowedIds = new Set(franchises.flatMap((franchise) => franchise.movies.map((movie) => movie.id)));

export type BoardAccount = {
  name: string;
  watched: string[];
};

type Board = {
  users: Record<string, BoardAccount>;
};

function emptyBoard(): Board {
  return { users: {} };
}

function accountKey(value: string) {
  return value.trim().replace(/\s+/g, " ").toLocaleLowerCase();
}

export function sanitizeAccounts(input: unknown): BoardAccount[] {
  if (!Array.isArray(input)) return [];
  const rows: BoardAccount[] = [];
  for (const item of input) {
    if (!item || typeof item !== "object") continue;
    const record = item as { name?: unknown; watched?: unknown };
    if (typeof record.name !== "string") continue;
    const name = record.name.trim().replace(/\s+/g, " ");
    if (name.length < 3 || name.length > 40) continue;
    const watched = Array.isArray(record.watched)
      ? [...new Set(record.watched.filter((id): id is string => typeof id === "string" && allowedIds.has(id)))]
      : [];
    rows.push({ name, watched });
  }
  return rows.slice(0, 500);
}

async function readBoard(): Promise<{ board: Board; etag: string | null }> {
  const result = await get(PATH, { access: "private", useCache: false });
  if (!result || result.statusCode !== 200) {
    return { board: emptyBoard(), etag: result?.blob.etag ?? null };
  }
  try {
    const parsed = JSON.parse(await new Response(result.stream).text()) as Board;
    if (!parsed?.users || typeof parsed.users !== "object") {
      return { board: emptyBoard(), etag: result.blob.etag };
    }
    return { board: parsed, etag: result.blob.etag };
  } catch {
    return { board: emptyBoard(), etag: result.blob.etag };
  }
}

export async function listBoard(): Promise<BoardAccount[]> {
  try {
    const { board } = await readBoard();
    return Object.values(board.users);
  } catch (error) {
    if (error instanceof BlobNotFoundError) return [];
    throw error;
  }
}

export async function mergeBoard(accounts: BoardAccount[]): Promise<BoardAccount[]> {
  if (!accounts.length) return listBoard();
  for (let attempt = 0; attempt < 5; attempt += 1) {
    let board = emptyBoard();
    let etag: string | null = null;
    try {
      const current = await readBoard();
      board = current.board;
      etag = current.etag;
    } catch (error) {
      if (!(error instanceof BlobNotFoundError)) throw error;
    }
    for (const account of accounts) {
      board.users[accountKey(account.name)] = account;
    }
    try {
      await put(PATH, JSON.stringify(board), {
        access: "private",
        addRandomSuffix: false,
        allowOverwrite: true,
        ...(etag ? { ifMatch: etag } : {}),
        contentType: "application/json",
      });
      return Object.values(board.users);
    } catch (error) {
      if (error instanceof BlobPreconditionFailedError) continue;
      throw error;
    }
  }
  throw new Error("Não foi possível gravar o ranking.");
}
