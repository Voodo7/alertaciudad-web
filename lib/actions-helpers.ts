import { Prisma } from "@prisma/client";

export type ActionResult = { ok: boolean; error?: string };

/** Traduce errores comunes de Prisma a mensajes legibles en español. */
export function toActionError(e: unknown): ActionResult {
  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    if (e.code === "P2002") {
      return { ok: false, error: "Ya existe un registro con ese valor único." };
    }
    if (e.code === "P2003") {
      return {
        ok: false,
        error:
          "No se puede eliminar: tiene registros relacionados que dependen de él.",
      };
    }
    if (e.code === "P2025") {
      return { ok: false, error: "El registro no existe." };
    }
  }
  console.error("Action error", e);
  return { ok: false, error: "Ocurrió un error inesperado." };
}

export function requireString(
  data: Record<string, string>,
  key: string,
  label: string
): { value: string } | { error: string } {
  const v = (data[key] ?? "").trim();
  if (!v) return { error: `"${label}" es obligatorio.` };
  return { value: v };
}
