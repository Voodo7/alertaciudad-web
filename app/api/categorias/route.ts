import { prisma } from "@/lib/prisma";
import { json, apiError, preflight } from "@/lib/api";

export const dynamic = "force-dynamic";

// GET /api/categorias -> [{ id, nombre, icono }]
export async function GET() {
  try {
    const categorias = await prisma.categoria.findMany({
      orderBy: { id: "asc" },
      select: { id: true, nombre: true, icono: true },
    });
    return json(categorias);
  } catch (e) {
    console.error("GET /api/categorias", e);
    return apiError("No se pudo obtener las categorias", 500);
  }
}

export function OPTIONS() {
  return preflight();
}
