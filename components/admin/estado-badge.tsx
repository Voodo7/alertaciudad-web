import { cn } from "@/lib/utils";
import { estadoColor } from "@/lib/estados";

export function EstadoBadge({ nombre }: { nombre: string }) {
  const c = estadoColor(nombre);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        c.bg,
        c.text
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", c.dot)} />
      {nombre}
    </span>
  );
}
