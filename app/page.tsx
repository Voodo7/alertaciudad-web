import { redirect } from "next/navigation";
import { getSessionAdmin } from "@/lib/auth";

export default async function Home() {
  const admin = await getSessionAdmin();
  redirect(admin ? "/dashboard" : "/login");
}
