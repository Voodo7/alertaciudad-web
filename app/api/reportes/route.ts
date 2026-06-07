import { prisma } from "@/lib/prisma";
import {
  json,
  apiError,
  preflight,
  serializeReporte,
  reporteInclude,
} from "@/lib/api";

export const dynamic = "force-dynamic";

// GET /api/reportes?usuarioId= -> lista de reportes (del usuario si se indica)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const usuarioIdParam = searchParams.get("usuarioId");

    const where = usuarioIdParam
      ? { usuarioId: Number(usuarioIdParam) }
      : undefined;

    if (usuarioIdParam && Number.isNaN(Number(usuarioIdParam))) {
      return apiError("usuarioId invalido", 400);
    }

    const reportes = await prisma.reporte.findMany({
      where,
      orderBy: { creadoEn: "desc" },
      include: reporteInclude,
    });

    return json(reportes.map(serializeReporte));
  } catch (e) {
    console.error("GET /api/reportes", e);
    return apiError("No se pudo obtener los reportes", 500);
  }
}

// POST /api/reportes -> crea un reporte (estado inicial "Pendiente")
// body: { titulo, descripcion, fotoUrl, lat, lng, idCategoria, idZona, idUsuario }
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) return apiError("Body JSON invalido", 400);

    const {
      titulo,
      descripcion,
      fotoUrl,
      lat,
      lng,
      idCategoria,
      idZona,
      idUsuario,
    } = body as Record<string, unknown>;

    if (!titulo || typeof titulo !== "string") {
      return apiError("El campo 'titulo' es obligatorio", 400);
    }
    if (!descripcion || typeof descripcion !== "string") {
      return apiError("El campo 'descripcion' es obligatorio", 400);
    }
    if (idCategoria == null) {
      return apiError("El campo 'idCategoria' es obligatorio", 400);
    }
    if (idUsuario == null) {
      return apiError("El campo 'idUsuario' es obligatorio", 400);
    }

    // Estado inicial: Pendiente
    const pendiente = await prisma.estadoReporte.findUnique({
      where: { nombre: "Pendiente" },
    });
    if (!pendiente) {
      return apiError(
        "No existe el estado 'Pendiente'. Ejecuta el seed de la base de datos.",
        500
      );
    }

    const reporte = await prisma.reporte.create({
      data: {
        titulo,
        descripcion,
        fotoUrl: (fotoUrl as string) ?? null,
        lat: lat != null ? Number(lat) : null,
        lng: lng != null ? Number(lng) : null,
        categoriaId: Number(idCategoria),
        zonaId: idZona != null ? Number(idZona) : null,
        estadoId: pendiente.id,
        usuarioId: Number(idUsuario),
      },
      include: reporteInclude,
    });

    // Registro inicial en el historial
    await prisma.historialReporte.create({
      data: {
        reporteId: reporte.id,
        estadoId: pendiente.id,
        comentario: "Reporte creado",
      },
    });

    return json(serializeReporte(reporte), { status: 201 });
  } catch (e) {
    console.error("POST /api/reportes", e);
    return apiError("No se pudo crear el reporte", 500);
  }
}

export function OPTIONS() {
  return preflight();
}
