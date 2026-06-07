import { prisma } from "@/lib/prisma";
import { json, apiError, preflight } from "@/lib/api";

export const dynamic = "force-dynamic";

// GET /api/zonas -> [{ id, nombre }]
export async function GET() {
  try {
    const zonas = await prisma.zona.findMany({
      orderBy: { id: "asc" },
      select: { id: true, nombre: true },
    });
    return json(zonas);
  } catch (e) {
    console.error("GET /api/zonas", e);
    return apiError("No se pudo obtener las zonas", 500);
  }
}

export function OPTIONS() {
  return preflight();
}
