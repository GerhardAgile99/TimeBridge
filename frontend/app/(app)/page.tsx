import { AIHeroCard } from "@/components/dashboard/AIHeroCard";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { ProductivityChart } from "@/components/dashboard/ProductivityChart";
import { RecentDrafts } from "@/components/dashboard/RecentDrafts";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { Clock, FileText, FolderOpen, Zap } from "lucide-react";
import { getStats, getWeeklyData } from "@/lib/api/reports";
import { getDrafts } from "@/lib/api/drafts";
import { getEvents } from "@/lib/api/events";
import { ApiDraft, ApiRawEvent, ApiStats } from "@/lib/api/types";

export default async function DashboardPage() {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  let stats: ApiStats | null = null;
  let weeklyData: { day: string; hours: number }[] = [];
  let recentDrafts: ApiDraft[] = [];
  let recentEvents: ApiRawEvent[] = [];

  try {
    const [s, w, d, e] = await Promise.allSettled([
      getStats(),
      getWeeklyData(),
      getDrafts("pending"),
      getEvents(8),
    ]);
    if (s.status === "fulfilled") stats = s.value;
    if (w.status === "fulfilled") weeklyData = w.value.data;
    if (d.status === "fulfilled") recentDrafts = d.value.data.slice(0, 4);
    if (e.status === "fulfilled") recentEvents = e.value.data.slice(0, 4);
  } catch {
    // backend offline — show zeros
  }

  const hoursLogged = stats ? `${stats.hours_logged_this_week}h` : "0h";
  const pendingCount = stats?.pending_drafts ?? 0;
  const activeProjects = stats?.active_projects ?? 0;
  const eventsToday = stats?.events_today ?? 0;

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-[#F8FAFC]">Dashboard</h1>
        <p className="text-[#94A3B8] text-sm mt-1">{today}</p>
      </div>

      <AIHeroCard
        detectedMinutes={stats?.today_detected_minutes ?? 0}
        avgConfidence={stats?.today_avg_confidence ?? null}
      />

      <div className="grid grid-cols-4 gap-4">
        <MetricCard icon={Clock} label="Hours Logged" value={hoursLogged} />
        <MetricCard icon={FileText} label="Pending Drafts" value={String(pendingCount)} />
        <MetricCard icon={FolderOpen} label="Active Projects" value={String(activeProjects)} />
        <MetricCard icon={Zap} label="Events Today" value={String(eventsToday)} />
      </div>

      <ProductivityChart data={weeklyData} />

      <div className="grid grid-cols-2 gap-4">
        <RecentDrafts drafts={recentDrafts} />
        <RecentActivity activities={recentEvents} />
      </div>
    </div>
  );
}
