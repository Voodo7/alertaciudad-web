import { redirect } from "next/navigation";
import { getSessionAdmin } from "@/lib/auth";
import { LoginForm } from "./login-form";
import { ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const admin = await getSessionAdmin().catch(() => null);
  if (admin) redirect("/dashboard");

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4">
      {/* Fondo decorativo */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-secondary/20 blur-3xl" />
      </div>

      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/30">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">AlertaCiudad</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Portal administrativo
          </p>
        </div>

        <div className="rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
          <LoginForm />
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Demo: admin@alertaciudad.pe · contraseña{" "}
          <span className="font-mono">cambia_esto</span>
        </p>
      </div>
    </div>
  );
}
