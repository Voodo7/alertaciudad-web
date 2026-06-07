import { prisma } from "@/lib/prisma";
import { json, preflight } from "@/lib/api";

export const dynamic = "force-dynamic";

// DIAGNÓSTICO TEMPORAL — no expone secretos (solo host, sin usuario/clave).
export async function GET() {
  const raw = process.env.DATABASE_URL;
  let host: string | null = null;
  let protocol: string | null = null;
  let hasQuotes = false;
  if (raw) {
    hasQuotes = raw.startsWith('"') || raw.endsWith('"');
    try {
      const u = new URL(raw.replace(/^"|"$/g, ""));
      host = u.hostname;
      protocol = u.protocol;
    } catch {
      host = "URL_INVALIDA";
    }
  }

  let dbTest: string;
  try {
    const n = await prisma.categoria.count();
    dbTest = `OK (categorias=${n})`;
  } catch (e) {
    dbTest = (e instanceof Error ? e.message : String(e)).split("\n").slice(0, 3).join(" | ");
  }

  return json({
    databaseUrlPresente: Boolean(raw),
    databaseUrlConComillas: hasQuotes,
    host,
    protocol,
    sessionSecretPresente: Boolean(process.env.SESSION_SECRET),
    nodeEnv: process.env.NODE_ENV,
    vercelRegion: process.env.VERCEL_REGION ?? null,
    dbTest,
  });
}

export function OPTIONS() {
  return preflight();
}
