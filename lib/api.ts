import { NextResponse } from "next/server";

// Cabeceras CORS para los endpoints consumidos por la app movil Android.
export const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,PATCH,PUT,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export function json(data: unknown, init?: ResponseInit) {
  return NextResponse.json(data, {
    ...init,
    headers: { ...corsHeaders, ...(init?.headers ?? {}) },
  });
}

export function apiError(message: string, status = 400, extra?: Record<string, unknown>) {
  return json({ error: message, ...extra }, { status });
}

// Respuesta a la peticion preflight OPTIONS.
export function preflight() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

// ---- Serializadores: forma JSON exacta que espera la app movil ----

type ReporteConRelaciones = {
  id: number;
  titulo: string;
  descripcion: string;
  fotoUrl: string | null;
  lat: number | null;
  lng: number | null;
  usuarioId: number;
  creadoEn: Date;
  categoria: { id: number; nombre: string } | null;
  zona: { id: number; nombre: string } | null;
  estado: { id: number; nombre: string } | null;
};

export function serializeReporte(r: ReporteConRelaciones) {
  return {
    id: r.id,
    titulo: r.titulo,
    descripcion: r.descripcion,
    fotoUrl: r.fotoUrl,
    lat: r.lat,
    lng: r.lng,
    categoria: r.categoria
      ? { id: r.categoria.id, nombre: r.categoria.nombre }
      : null,
    zona: r.zona ? { id: r.zona.id, nombre: r.zona.nombre } : null,
    estado: r.estado ? { id: r.estado.id, nombre: r.estado.nombre } : null,
    usuarioId: r.usuarioId,
    creadoEn: r.creadoEn,
  };
}

// Inclusion estandar de Prisma para devolver un reporte completo.
export const reporteInclude = {
  categoria: { select: { id: true, nombre: true } },
  zona: { select: { id: true, nombre: true } },
  estado: { select: { id: true, nombre: true } },
} as const;
