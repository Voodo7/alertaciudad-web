"use client";

import * as React from "react";
import { Sidebar, MobileSidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { ToastProvider } from "@/components/ui/toast";

export function AdminShell({
  admin,
  children,
}: {
  admin: { nombre: string; correo: string };
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar admin={admin} onMenu={() => setMobileOpen(true)} />
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl animate-fade-in">{children}</div>
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
