"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import {
  type ActionResult,
  toActionError,
  requireString,
} from "@/lib/actions-helpers";

export async function crearAdministrador(
  data: Record<string, string>
): Promise<ActionResult> {
  const nombre = requireString(data, "nombre", "Nombre");
  if ("error" in nombre) return { ok: false, error: nombre.error };
  const correo = requireString(data, "correo", "Correo");
  if ("error" in correo) return { ok: false, error: correo.error };
  const password = (data.password ?? "").trim();
  if (password.length < 6) {
    return { ok: false, error: "La contraseña debe tener al menos 6 caracteres." };
  }
  try {
    await prisma.administrador.create({
      data: {
        nombre: nombre.value,
        correo: correo.value.toLowerCase(),
        passwordHash: await hashPassword(password),
      },
    });
    revalidatePath("/administradores");
    return { ok: true };
  } catch (e) {
    return toActionError(e);
  }
}

export async function actualizarAdministrador(
  id: number,
  data: Record<string, string>
): Promise<ActionResult> {
  const nombre = requireString(data, "nombre", "Nombre");
  if ("error" in nombre) return { ok: false, error: nombre.error };
  const correo = requireString(data, "correo", "Correo");
  if ("error" in correo) return { ok: false, error: correo.error };
  const password = (data.password ?? "").trim();
  if (password && password.length < 6) {
    return { ok: false, error: "La contraseña debe tener al menos 6 caracteres." };
  }
  try {
    await prisma.administrador.update({
      where: { id },
      data: {
        nombre: nombre.value,
        correo: correo.value.toLowerCase(),
        // Solo actualiza la contraseña si se ingresó una nueva.
        ...(password ? { passwordHash: await hashPassword(password) } : {}),
      },
    });
    revalidatePath("/administradores");
    return { ok: true };
  } catch (e) {
    return toActionError(e);
  }
}

export async function eliminarAdministrador(id: number): Promise<ActionResult> {
  try {
    const total = await prisma.administrador.count();
    if (total <= 1) {
      return {
        ok: false,
        error: "No puedes eliminar al último administrador del sistema.",
      };
    }
    await prisma.administrador.delete({ where: { id } });
    revalidatePath("/administradores");
    return { ok: true };
  } catch (e) {
    return toActionError(e);
  }
}
