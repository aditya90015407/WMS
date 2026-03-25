"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { redirect, usePathname, useRouter } from "next/navigation";
import AppNavbar from "@/components/app-navbar";
import AppSidebar from "@/components/app-sidebar";
import { useSession } from "next-auth/react";

type AppLayoutProps = {
  children: ReactNode;
};

export default function AppLayout({ children }: AppLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();

  // useEffect(() => {
  //   const navEntry = performance.getEntriesByType(
  //     "navigation",
  //   )[0] as PerformanceNavigationTiming | undefined;

  //   if (navEntry?.type === "reload" && pathname !== "/Home") {
  //     router.replace("/Home");
  //   }
  // }, [pathname, router]);

  // const { data: session } = useSession();
  // if (!session) redirect("/sign-in")

  return (
    <div className="min-w-6xl min-h-screen bg-slate-50">
      <AppNavbar />
      <div className="flex min-h-[calc(100vh-4rem)]">
        <AppSidebar />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
