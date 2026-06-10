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

// POST /api/categorias -> crea una categoria  body: { nombre, icono? }
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) return apiError("Body JSON invalido", 400);

    const { nombre, icono } = body as { nombre?: string; icono?: string };
    if (!nombre || typeof nombre !== "string" || !nombre.trim()) {
      return apiError("El campo 'nombre' es obligatorio", 400);
    }

    const categoria = await prisma.categoria.create({
      data: { nombre: nombre.trim(), icono: icono?.trim() || null },
      select: { id: true, nombre: true, icono: true },
    });
    return json(categoria, { status: 201 });
  } catch (e) {
    if ((e as { code?: string }).code === "P2002") {
      return apiError("Ya existe una categoria con ese nombre", 409);
    }
    console.error("POST /api/categorias", e);
    return apiError("No se pudo crear la categoria", 500);
  }
}

export function OPTIONS() {
  return preflight();
}
