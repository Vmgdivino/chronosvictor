import https from "node:https";
import { franchises } from "@/lib/franchises";
import { NextResponse } from "next/server";

function postJson(url: string, body: unknown, timeoutMs: number) {
  const payload = Buffer.from(JSON.stringify(body));
  return new Promise<{ status: number; text: string }>((resolve, reject) => {
    const req = https.request(
      url,
      {
        method: "POST",
        family: 4,
        headers: {
          "Content-Type": "application/json",
          "Content-Length": payload.length,
          Accept: "application/json",
        },
        timeout: timeoutMs,
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (chunk: Buffer) => chunks.push(chunk));
        res.on("end", () => resolve({ status: res.statusCode ?? 0, text: Buffer.concat(chunks).toString("utf8") }));
      },
    );
    req.on("timeout", () => {
      req.destroy(new Error("timeout"));
    });
    req.on("error", reject);
    req.end(payload);
  });
}

export const dynamic = "force-dynamic";

type Turn = {
  role: "user" | "assistant";
  content: string;
};

function cleanName(value: unknown) {
  if (typeof value !== "string") return "amigo";
  const name = value.replace(/\s+/g, " ").trim().slice(0, 40);
  return name || "amigo";
}

function cleanTurns(value: unknown): Turn[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const record = item as { role?: unknown; content?: unknown };
      if (record.role !== "user" && record.role !== "assistant") return null;
      if (typeof record.content !== "string") return null;
      const content = record.content.replace(/\s+/g, " ").trim().slice(0, 600);
      if (!content) return null;
      return { role: record.role, content };
    })
    .filter((item): item is Turn => item !== null)
    .slice(-8);
}

function spoken(text: string) {
  const clean = text
    .replace(/[*_`#]/g, "")
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "")
    .replace(/:\)|:\(|:D|;\)/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 420);
  if (!clean) return "";
  if (/^(the user|we need to|let's |okay[,.])/i.test(clean)) {
    const lines = clean.split(/(?<=[.!?])\s+/).filter((line) => /[áàâãéêíóôõúç]/i.test(line));
    return lines.join(" ").slice(0, 420);
  }
  return clean;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    name?: unknown;
    title?: unknown;
    figure?: unknown;
    messages?: unknown;
  } | null;
  const messages = cleanTurns(body?.messages);
  if (!messages.some((item) => item.role === "user")) {
    return NextResponse.json({ reply: "Diz-me o que queres saber." }, { status: 400 });
  }

  const name = cleanName(body?.name);
  const figure = cleanName(body?.figure);
  const title = typeof body?.title === "string" ? body.title.replace(/\s+/g, " ").trim().slice(0, 120) : "";
  const catalog = franchises.map((franchise) => `${franchise.name}: ${franchise.movies.length} títulos`).join("; ");
  const system = [
    "És o assistente pessoal do ChronosVictor e falas como o Jarvis: pouco, com calma e um humor seco.",
    "Quando te apresentares, diz apenas que estás a postos e usa o nome da pessoa. Não enumeres qualidades nem digas que estás a imitar alguém.",
    `A pessoa ligada chama-se ${name}. Trata-a pelo nome.`,
    `A figura visível chama-se ${figure}.`,
    title ? `O título aberto é ${title}.` : "Não há um título aberto.",
    `Catálogo: ${catalog}.`,
    "Fala em português europeu, como quem está na sala, com frases naturais e bem ditas.",
    "No máximo duas frases curtas. Sem markdown, sem listas, sem emojis e sem explicar o raciocínio.",
    "Podes responder a qualquer assunto. Se não souberes, admite-o com simplicidade.",
    "Não digas que és um modelo. Não copies falas de filmes.",
  ].join(" ");

  const offline = "A ligação falhou. Tenta outra vez dentro de momentos.";

  async function askUpstream() {
    const upstream = await postJson(
      "https://text.pollinations.ai/openai",
      {
        model: "openai-fast",
        messages: [{ role: "system", content: system }, ...messages],
      },
      20000,
    );
    if (upstream.status < 200 || upstream.status >= 300) return "";
    const data = JSON.parse(upstream.text) as {
      choices?: { message?: { content?: string } }[];
    };
    return spoken(data.choices?.[0]?.message?.content ?? "");
  }

  try {
    const reply = (await askUpstream()) || (await askUpstream());
    if (!reply) return NextResponse.json({ reply: offline }, { status: 502 });
    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json({ reply: offline }, { status: 502 });
  }
}
