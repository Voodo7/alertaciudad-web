"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { type ActionResult, toActionError } from "@/lib/actions-helpers";

function parseIds(data: Record<string, string>) {
  const reporteId = Number(data.reporteId);
  const estadoId = Number(data.estadoId);
  if (!reporteId || Number.isNaN(reporteId))
    return { error: "Selecciona un reporte válido." as string };
  if (!estadoId || Number.isNaN(estadoId))
    return { error: "Selecciona un estado válido." as string };
  return { reporteId, estadoId };
}

export async function crearHistorial(
  data: Record<string, string>
): Promise<ActionResult> {
  const parsed = parseIds(data);
  if ("error" in parsed) return { ok: false, error: parsed.error };
  try {
    await prisma.historialReporte.create({
      data: {
        reporteId: parsed.reporteId,
        estadoId: parsed.estadoId,
        comentario: data.comentario?.trim() || null,
      },
    });
    revalidatePath("/historial");
    return { ok: true };
  } catch (e) {
    return toActionError(e);
  }
}

export async function actualizarHistorial(
  id: number,
  data: Record<string, string>
): Promise<ActionResult> {
  const parsed = parseIds(data);
  if ("error" in parsed) return { ok: false, error: parsed.error };
  try {
    await prisma.historialReporte.update({
      where: { id },
      data: {
        reporteId: parsed.reporteId,
        estadoId: parsed.estadoId,
        comentario: data.comentario?.trim() || null,
      },
    });
    revalidatePath("/historial");
    return { ok: true };
  } catch (e) {
    return toActionError(e);
  }
}

export async function eliminarHistorial(id: number): Promise<ActionResult> {
  try {
    await prisma.historialReporte.delete({ where: { id } });
    revalidatePath("/historial");
    return { ok: true };
  } catch (e) {
    return toActionError(e);
  }
}
