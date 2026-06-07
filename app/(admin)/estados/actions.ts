"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  type ActionResult,
  toActionError,
  requireString,
} from "@/lib/actions-helpers";

export async function crearEstado(
  data: Record<string, string>
): Promise<ActionResult> {
  const nombre = requireString(data, "nombre", "Nombre");
  if ("error" in nombre) return { ok: false, error: nombre.error };
  try {
    await prisma.estadoReporte.create({ data: { nombre: nombre.value } });
    revalidatePath("/estados");
    return { ok: true };
  } catch (e) {
    return toActionError(e);
  }
}

export async function actualizarEstado(
  id: number,
  data: Record<string, string>
): Promise<ActionResult> {
  const nombre = requireString(data, "nombre", "Nombre");
  if ("error" in nombre) return { ok: false, error: nombre.error };
  try {
    await prisma.estadoReporte.update({
      where: { id },
      data: { nombre: nombre.value },
    });
    revalidatePath("/estados");
    return { ok: true };
  } catch (e) {
    return toActionError(e);
  }
}

export async function eliminarEstado(id: number): Promise<ActionResult> {
  try {
    await prisma.estadoReporte.delete({ where: { id } });
    revalidatePath("/estados");
    return { ok: true };
  } catch (e) {
    return toActionError(e);
  }
}
