import { DatabaseZap } from "lucide-react";

export function DbError({ detail }: { detail?: string }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-xl border border-dashed bg-card p-10 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
        <DatabaseZap className="h-6 w-6" />
      </div>
      <h2 className="text-lg font-semibold">No se pudo conectar a la base de datos</h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        Verifica que <code className="font-mono">DATABASE_URL</code> en el archivo
        <code className="font-mono"> .env</code> apunte a tu base PostgreSQL (Neon)
        y que hayas ejecutado las migraciones y el seed:
      </p>
      <pre className="mt-4 rounded-lg bg-muted px-4 py-3 text-left text-xs">
        npx prisma migrate dev --name init{"\n"}npx prisma db seed
      </pre>
      {detail && (
        <p className="mt-3 max-w-md break-words text-xs text-muted-foreground/70">
          {detail}
        </p>
      )}
    </div>
  );
}
