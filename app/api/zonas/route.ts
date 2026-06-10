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

// POST /api/zonas -> crea una zona  body: { nombre }
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) return apiError("Body JSON invalido", 400);

    const { nombre } = body as { nombre?: string };
    if (!nombre || typeof nombre !== "string" || !nombre.trim()) {
      return apiError("El campo 'nombre' es obligatorio", 400);
    }

    const zona = await prisma.zona.create({
      data: { nombre: nombre.trim() },
      select: { id: true, nombre: true },
    });
    return json(zona, { status: 201 });
  } catch (e) {
    if ((e as { code?: string }).code === "P2002") {
      return apiError("Ya existe una zona con ese nombre", 409);
    }
    console.error("POST /api/zonas", e);
    return apiError("No se pudo crear la zona", 500);
  }
}

export function OPTIONS() {
  return preflight();
}
