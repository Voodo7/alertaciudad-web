import { redirect } from "next/navigation";
import { getSessionAdmin } from "@/lib/auth";
import { AdminShell } from "@/components/admin/admin-shell";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getSessionAdmin().catch(() => null);
  if (!admin) redirect("/login");

  return <AdminShell admin={admin}>{children}</AdminShell>;
}
