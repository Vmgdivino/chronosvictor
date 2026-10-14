import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";
import { Readable } from "node:stream";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const VOICE = "pt-PT-DuarteNeural";

function spokenText(value: string | null) {
  return (value ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&/g, " e ")
    .replace(/[<>]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 400);
}

function readAudio(stream: Readable) {
  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on("data", (chunk: Buffer | Uint8Array) => chunks.push(Buffer.from(chunk)));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
  });
}

async function duarte(text: string) {
  const tts = new MsEdgeTTS({ connectionTimeoutMs: 12000, synthesisTimeoutMs: 20000 });
  try {
    await tts.setMetadata(VOICE, OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3);
    const { audioStream } = tts.toStream(text, { rate: "-4%", pitch: "-2%" });
    const audio = await readAudio(audioStream);
    return audio.length > 500 ? audio : null;
  } finally {
    tts.close();
  }
}

async function googleVoice(text: string) {
  const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=pt-PT&q=${encodeURIComponent(text)}`;
  const response = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0" },
    signal: AbortSignal.timeout(12000),
  });
  if (!response.ok) return null;
  const type = response.headers.get("content-type") ?? "";
  if (!type.includes("audio")) return null;
  const audio = Buffer.from(await response.arrayBuffer());
  return audio.length > 500 ? audio : null;
}

export async function GET(request: Request) {
  const text = spokenText(new URL(request.url).searchParams.get("q"));
  if (text.length < 2) return new NextResponse(null, { status: 400 });
  try {
    const audio = (await duarte(text).catch(() => null)) ?? (await googleVoice(text));
    if (!audio) return new NextResponse(null, { status: 502 });
    return new NextResponse(new Uint8Array(audio), {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return new NextResponse(null, { status: 502 });
  }
}
