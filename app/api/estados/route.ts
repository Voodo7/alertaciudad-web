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

// POST /api/estados -> crea un estado de reporte  body: { nombre }
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) return apiError("Body JSON invalido", 400);

    const { nombre } = body as { nombre?: string };
    if (!nombre || typeof nombre !== "string" || !nombre.trim()) {
      return apiError("El campo 'nombre' es obligatorio", 400);
    }

    const estado = await prisma.estadoReporte.create({
      data: { nombre: nombre.trim() },
      select: { id: true, nombre: true },
    });
    return json(estado, { status: 201 });
  } catch (e) {
    if ((e as { code?: string }).code === "P2002") {
      return apiError("Ya existe un estado con ese nombre", 409);
    }
    console.error("POST /api/estados", e);
    return apiError("No se pudo crear el estado", 500);
  }
}

export function OPTIONS() {
  return preflight();
}
