"use client";

import { Search, Bell, Settings, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { checkHealth } from "@/lib/api/client";

export function Topbar() {
  const [isLive, setIsLive] = useState<boolean | null>(null);

  useEffect(() => {
    const check = async () => {
      const ok = await checkHealth();
      setIsLive(ok);
    };
    check();
    const interval = setInterval(check, 30_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 flex items-center gap-4 px-6 border-b border-white/[0.06] bg-[#0F172A] shrink-0">
      <div className="flex-1 max-w-lg">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Ask AI or search..."
            className="w-full bg-[#1E293B] text-[#F8FAFC] placeholder:text-[#94A3B8] text-sm rounded-lg pl-9 pr-4 py-2.5 border border-white/[0.06] focus:outline-none focus:border-[#6366F1]/50 focus:ring-1 focus:ring-[#6366F1]/30 transition-colors"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {isLive !== null && (
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
              isLive
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                : "bg-white/[0.04] text-[#94A3B8] border-white/[0.08]"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${isLive ? "bg-emerald-400 animate-pulse" : "bg-[#94A3B8]"}`}
            />
            {isLive ? "Live" : "Demo"}
          </div>
        )}

        <button className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/[0.06] transition-colors">
          <Settings className="w-4 h-4 text-[#94A3B8]" />
        </button>
        <button className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/[0.06] transition-colors relative">
          <Bell className="w-4 h-4 text-[#94A3B8]" />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-[#6366F1] rounded-full" />
        </button>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center text-white cursor-pointer ml-1">
          <UserRound className="w-4 h-4" />
        </div>
      </div>
    </header>
  );
}
