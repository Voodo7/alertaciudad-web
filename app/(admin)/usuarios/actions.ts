"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  type ActionResult,
  toActionError,
  requireString,
} from "@/lib/actions-helpers";

export async function crearUsuario(
  data: Record<string, string>
): Promise<ActionResult> {
  const nombre = requireString(data, "nombre", "Nombre");
  if ("error" in nombre) return { ok: false, error: nombre.error };
  const correo = requireString(data, "correo", "Correo");
  if ("error" in correo) return { ok: false, error: correo.error };
  try {
    await prisma.usuario.create({
      data: {
        nombre: nombre.value,
        correo: correo.value.toLowerCase(),
        firebaseUid: data.firebaseUid?.trim() || null,
      },
    });
    revalidatePath("/usuarios");
    return { ok: true };
  } catch (e) {
    return toActionError(e);
  }
}

export async function actualizarUsuario(
  id: number,
  data: Record<string, string>
): Promise<ActionResult> {
  const nombre = requireString(data, "nombre", "Nombre");
  if ("error" in nombre) return { ok: false, error: nombre.error };
  const correo = requireString(data, "correo", "Correo");
  if ("error" in correo) return { ok: false, error: correo.error };
  try {
    await prisma.usuario.update({
      where: { id },
      data: {
        nombre: nombre.value,
        correo: correo.value.toLowerCase(),
        firebaseUid: data.firebaseUid?.trim() || null,
      },
    });
    revalidatePath("/usuarios");
    return { ok: true };
  } catch (e) {
    return toActionError(e);
  }
}

export async function eliminarUsuario(id: number): Promise<ActionResult> {
  try {
    await prisma.usuario.delete({ where: { id } });
    revalidatePath("/usuarios");
    return { ok: true };
  } catch (e) {
    return toActionError(e);
  }
}
