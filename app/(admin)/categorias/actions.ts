"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  type ActionResult,
  toActionError,
  requireString,
} from "@/lib/actions-helpers";

export async function crearCategoria(
  data: Record<string, string>
): Promise<ActionResult> {
  const nombre = requireString(data, "nombre", "Nombre");
  if ("error" in nombre) return { ok: false, error: nombre.error };
  try {
    await prisma.categoria.create({
      data: { nombre: nombre.value, icono: data.icono?.trim() || null },
    });
    revalidatePath("/categorias");
    return { ok: true };
  } catch (e) {
    return toActionError(e);
  }
}

export async function actualizarCategoria(
  id: number,
  data: Record<string, string>
): Promise<ActionResult> {
  const nombre = requireString(data, "nombre", "Nombre");
  if ("error" in nombre) return { ok: false, error: nombre.error };
  try {
    await prisma.categoria.update({
      where: { id },
      data: { nombre: nombre.value, icono: data.icono?.trim() || null },
    });
    revalidatePath("/categorias");
    return { ok: true };
  } catch (e) {
    return toActionError(e);
  }
}

export async function eliminarCategoria(id: number): Promise<ActionResult> {
  try {
    await prisma.categoria.delete({ where: { id } });
    revalidatePath("/categorias");
    return { ok: true };
  } catch (e) {
    return toActionError(e);
  }
}
