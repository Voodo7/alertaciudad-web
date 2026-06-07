import crypto from "crypto";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const COOKIE_NAME = "ac_session";
const MAX_AGE = 60 * 60 * 8; // 8 horas

function getSecret(): string {
  return process.env.SESSION_SECRET || "dev-secret-inseguro-cambia-esto";
}

function sign(payload: string): string {
  const hmac = crypto.createHmac("sha256", getSecret());
  hmac.update(payload);
  return hmac.digest("base64url");
}

/** Crea un token firmado: base64url(json).firma */
function createToken(adminId: number): string {
  const body = {
    sub: adminId,
    exp: Date.now() + MAX_AGE * 1000,
  };
  const payload = Buffer.from(JSON.stringify(body)).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

function verifyToken(token: string | undefined): number | null {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const expected = sign(payload);
  // Comparacion en tiempo constante
  if (
    signature.length !== expected.length ||
    !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  ) {
    return null;
  }
  try {
    const body = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (typeof body.exp !== "number" || body.exp < Date.now()) return null;
    return typeof body.sub === "number" ? body.sub : null;
  } catch {
    return null;
  }
}

/** Verifica credenciales contra la tabla Administrador. */
export async function verifyCredentials(correo: string, password: string) {
  const admin = await prisma.administrador.findUnique({
    where: { correo: correo.trim().toLowerCase() },
  });
  if (!admin) return null;

  const stored = admin.passwordHash;
  let ok = false;
  if (stored.startsWith("$2")) {
    // Hash bcrypt
    ok = await bcrypt.compare(password, stored);
  } else {
    // Compatibilidad con el seed (passwordHash en texto plano "cambia_esto")
    ok = stored === password;
  }
  if (!ok) return null;
  return { id: admin.id, nombre: admin.nombre, correo: admin.correo };
}

export async function createSession(adminId: number) {
  const store = await cookies();
  store.set(COOKIE_NAME, createToken(adminId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroySession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

/** Devuelve el administrador autenticado o null. */
export async function getSessionAdmin() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  const adminId = verifyToken(token);
  if (!adminId) return null;
  const admin = await prisma.administrador.findUnique({
    where: { id: adminId },
    select: { id: true, nombre: true, correo: true },
  });
  return admin;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}
