"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  type ActionResult,
  toActionError,
  requireString,
} from "@/lib/actions-helpers";

export async function crearZona(
  data: Record<string, string>
): Promise<ActionResult> {
  const nombre = requireString(data, "nombre", "Nombre");
  if ("error" in nombre) return { ok: false, error: nombre.error };
  try {
    await prisma.zona.create({ data: { nombre: nombre.value } });
    revalidatePath("/zonas");
    return { ok: true };
  } catch (e) {
    return toActionError(e);
  }
}

export async function actualizarZona(
  id: number,
  data: Record<string, string>
): Promise<ActionResult> {
  const nombre = requireString(data, "nombre", "Nombre");
  if ("error" in nombre) return { ok: false, error: nombre.error };
  try {
    await prisma.zona.update({ where: { id }, data: { nombre: nombre.value } });
    revalidatePath("/zonas");
    return { ok: true };
  } catch (e) {
    return toActionError(e);
  }
}

export async function eliminarZona(id: number): Promise<ActionResult> {
  try {
    await prisma.zona.delete({ where: { id } });
    revalidatePath("/zonas");
    return { ok: true };
  } catch (e) {
    return toActionError(e);
  }
}
