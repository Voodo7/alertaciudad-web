import { verifyCredentials, createJwt } from "@/lib/auth";
import { json, apiError, preflight } from "@/lib/api";

export const dynamic = "force-dynamic";

// POST /api/admin/login  body: { correo, password }
// Valida contra la tabla Administrador (compara el hash) y devuelve un JWT.
// CORS habilitado. NUNCA expone el passwordHash.
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) return apiError("Body JSON invalido", 400);

    const { correo, password } = body as { correo?: string; password?: string };
    if (!correo || !password) {
      return apiError("Los campos 'correo' y 'password' son obligatorios", 400);
    }

    // verifyCredentials compara el hash (bcrypt) y nunca devuelve el passwordHash.
    const admin = await verifyCredentials(correo, password);
    if (!admin) {
      return apiError("Credenciales incorrectas", 401);
    }

    const token = createJwt({ sub: admin.id, correo: admin.correo, rol: "admin" });

    return json({
      token,
      admin: { id: admin.id, nombre: admin.nombre, correo: admin.correo },
    });
  } catch (e) {
    console.error("POST /api/admin/login", e);
    return apiError("No se pudo iniciar sesion", 500);
  }
}

export function OPTIONS() {
  return preflight();
}
