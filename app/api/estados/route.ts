import { prisma } from "@/lib/prisma";
import { json, apiError, preflight } from "@/lib/api";

export const dynamic = "force-dynamic";

// GET /api/estados -> [{ id, nombre }]
export async function GET() {
  try {
    const estados = await prisma.estadoReporte.findMany({
      orderBy: { id: "asc" },
      select: { id: true, nombre: true },
    });
    return json(estados);
  } catch (e) {
    console.error("GET /api/estados", e);
    return apiError("No se pudo obtener los estados", 500);
  }
}

export function OPTIONS() {
  return preflight();
}
