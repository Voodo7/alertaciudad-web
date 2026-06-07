"use server";

import { redirect } from "next/navigation";
import {
  verifyCredentials,
  createSession,
  destroySession,
} from "@/lib/auth";

export async function loginAction(
  _prev: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string }> {
  const correo = String(formData.get("correo") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!correo || !password) {
    return { error: "Ingresa tu correo y contraseña." };
  }

  let admin;
  try {
    admin = await verifyCredentials(correo, password);
  } catch (e) {
    console.error("loginAction", e);
    return {
      error:
        "No se pudo conectar con la base de datos. Verifica DATABASE_URL en .env.",
    };
  }

  if (!admin) {
    return { error: "Credenciales incorrectas." };
  }

  await createSession(admin.id);
  redirect("/dashboard");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}
