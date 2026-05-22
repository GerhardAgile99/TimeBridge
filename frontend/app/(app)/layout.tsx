"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/user-context";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (loaded && !user) router.replace("/login");
  }, [loaded, user, router]);

  if (!loaded || !user) return null;

  return (
    <TooltipProvider>
      <div className="flex h-full">
        <Sidebar />
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <Topbar />
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
