"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Activity,
  Sparkles,
  BarChart3,
  FolderOpen,
  Users,
  Settings,
  Zap,
  HelpCircle,
  Plug,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/activity", icon: Activity, label: "Activity" },
  { href: "/drafts", icon: Sparkles, label: "AI Drafts", badge: 7 },
  { href: "/reports", icon: BarChart3, label: "Reports" },
  { href: "/projects", icon: FolderOpen, label: "Projects" },
  { href: "/team", icon: Users, label: "Team" },
  { href: "/integrations", icon: Plug, label: "Integrations" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col w-[240px] h-screen bg-[#0B1120] border-r border-white/[0.06] shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 h-16 border-b border-white/[0.06]">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#6366F1]">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <span className="font-semibold text-[15px] text-[#F8FAFC]">
          FlowTrack <span className="text-[#6366F1]">AI</span>
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, icon: Icon, label, badge }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-[#6366F1]/10 text-[#6366F1]"
                  : "text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-white/[0.04]"
              )}
            >
              <span className="flex items-center gap-3">
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </span>
              {badge && (
                <span className="text-[11px] font-semibold bg-[#6366F1] text-white rounded-full px-1.5 py-0.5 leading-none">
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Help + User */}
      <div className="border-t border-white/[0.06]">
        <div className="px-3 py-2">
          <Link
            href="/help"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-white/[0.04] transition-colors"
          >
            <HelpCircle className="w-4 h-4 shrink-0" />
            Help Center
          </Link>
        </div>
        <div className="p-3 border-t border-white/[0.06]">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/[0.04] cursor-pointer transition-colors">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center text-xs font-semibold text-white shrink-0">
              JD
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-[#F8FAFC] truncate">Jordan Davis</div>
              <div className="text-xs text-[#94A3B8] truncate">jordan@flowtrack.ai</div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
