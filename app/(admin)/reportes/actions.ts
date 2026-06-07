"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  type ActionResult,
  toActionError,
  requireString,
} from "@/lib/actions-helpers";
import { notificarCambioEstado } from "@/lib/notificaciones";

function num(v: string | undefined): number | null {
  if (v == null || v.trim() === "") return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
}

export async function crearReporte(
  data: Record<string, string>
): Promise<ActionResult> {
  const titulo = requireString(data, "titulo", "Título");
  if ("error" in titulo) return { ok: false, error: titulo.error };
  const descripcion = requireString(data, "descripcion", "Descripción");
  if ("error" in descripcion) return { ok: false, error: descripcion.error };

  const categoriaId = num(data.categoriaId);
  const usuarioId = num(data.usuarioId);
  const estadoId = num(data.estadoId);
  const zonaId = num(data.zonaId);

  if (!categoriaId) return { ok: false, error: "Selecciona una categoría." };
  if (!usuarioId) return { ok: false, error: "Selecciona un usuario." };
  if (!estadoId) return { ok: false, error: "Selecciona un estado." };

  try {
    const reporte = await prisma.reporte.create({
      data: {
        titulo: titulo.value,
        descripcion: descripcion.value,
        fotoUrl: data.fotoUrl?.trim() || null,
        lat: num(data.lat),
        lng: num(data.lng),
        categoriaId,
        zonaId: zonaId ?? null,
        estadoId,
        usuarioId,
      },
    });
    await prisma.historialReporte.create({
      data: { reporteId: reporte.id, estadoId, comentario: "Reporte creado" },
    });
    revalidatePath("/reportes");
    revalidatePath("/dashboard");
    return { ok: true };
  } catch (e) {
    return toActionError(e);
  }
}

export async function actualizarReporte(
  id: number,
  data: Record<string, string>
): Promise<ActionResult> {
  const titulo = requireString(data, "titulo", "Título");
  if ("error" in titulo) return { ok: false, error: titulo.error };
  const descripcion = requireString(data, "descripcion", "Descripción");
  if ("error" in descripcion) return { ok: false, error: descripcion.error };

  const categoriaId = num(data.categoriaId);
  const usuarioId = num(data.usuarioId);
  const estadoId = num(data.estadoId);
  const zonaId = num(data.zonaId);

  if (!categoriaId) return { ok: false, error: "Selecciona una categoría." };
  if (!usuarioId) return { ok: false, error: "Selecciona un usuario." };
  if (!estadoId) return { ok: false, error: "Selecciona un estado." };

  try {
    const actual = await prisma.reporte.findUnique({
      where: { id },
      select: { estadoId: true },
    });
    if (!actual) return { ok: false, error: "El reporte no existe." };

    await prisma.reporte.update({
      where: { id },
      data: {
        titulo: titulo.value,
        descripcion: descripcion.value,
        fotoUrl: data.fotoUrl?.trim() || null,
        lat: num(data.lat),
        lng: num(data.lng),
        categoriaId,
        zonaId: zonaId ?? null,
        estadoId,
        usuarioId,
      },
    });

    // Si el estado cambió, registrar en el historial y notificar al usuario.
    if (actual.estadoId !== estadoId) {
      await prisma.historialReporte.create({
        data: {
          reporteId: id,
          estadoId,
          comentario: "Estado actualizado desde el portal",
        },
      });
      const est = await prisma.estadoReporte.findUnique({
        where: { id: estadoId },
        select: { nombre: true },
      });
      await notificarCambioEstado({
        usuarioId,
        reporteId: id,
        reporteTitulo: titulo.value,
        estadoNombre: est?.nombre ?? "actualizado",
        comentario: "Estado actualizado desde el portal",
      });
    }

    revalidatePath("/reportes");
    revalidatePath(`/reportes/${id}`);
    revalidatePath("/dashboard");
    return { ok: true };
  } catch (e) {
    return toActionError(e);
  }
}

export async function eliminarReporte(id: number): Promise<ActionResult> {
  try {
    await prisma.reporte.delete({ where: { id } });
    revalidatePath("/reportes");
    revalidatePath("/dashboard");
    return { ok: true };
  } catch (e) {
    return toActionError(e);
  }
}

/** Cambio rápido de estado (uso admin): actualiza y registra historial. */
export async function cambiarEstadoReporte(
  id: number,
  estadoId: number,
  comentario: string
): Promise<ActionResult> {
  if (!estadoId) return { ok: false, error: "Selecciona un estado." };
  try {
    await prisma.$transaction([
      prisma.reporte.update({ where: { id }, data: { estadoId } }),
      prisma.historialReporte.create({
        data: { reporteId: id, estadoId, comentario: comentario?.trim() || null },
      }),
    ]);

    // Notificar al usuario dueño del reporte (Firestore -> app móvil).
    const rep = await prisma.reporte.findUnique({
      where: { id },
      select: {
        usuarioId: true,
        titulo: true,
        estado: { select: { nombre: true } },
      },
    });
    if (rep) {
      await notificarCambioEstado({
        usuarioId: rep.usuarioId,
        reporteId: id,
        reporteTitulo: rep.titulo,
        estadoNombre: rep.estado.nombre,
        comentario,
      });
    }

    revalidatePath("/reportes");
    revalidatePath(`/reportes/${id}`);
    revalidatePath("/dashboard");
    return { ok: true };
  } catch (e) {
    return toActionError(e);
  }
}
