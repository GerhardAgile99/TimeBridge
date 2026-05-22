import { AIHeroCard } from "@/components/dashboard/AIHeroCard";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { ProductivityChart } from "@/components/dashboard/ProductivityChart";
import { RecentDrafts } from "@/components/dashboard/RecentDrafts";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { drafts as mockDrafts, chartData, activities as mockActivities } from "@/lib/mock-data";
import { Clock, FileText, FolderOpen, Target } from "lucide-react";
import { getStats } from "@/lib/api/reports";

export default async function DashboardPage() {
  let hoursLogged = "28.4h";
  let pendingCount = 7;

  try {
    const stats = await getStats();
    hoursLogged = `${stats.hours_logged_this_week}h`;
    pendingCount = stats.pending_drafts;
  } catch {
    // backend offline — keep mock values
  }

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-[#F8FAFC]">Dashboard</h1>
        <p className="text-[#94A3B8] text-sm mt-1">Wednesday, May 21, 2026</p>
      </div>

      <AIHeroCard />

      <div className="grid grid-cols-4 gap-4">
        <MetricCard icon={Clock} label="Hours Logged" value={hoursLogged} change="+12%" positive />
        <MetricCard icon={FileText} label="Pending Drafts" value={String(pendingCount)} />
        <MetricCard icon={FolderOpen} label="Active Projects" value="12" />
        <MetricCard icon={Target} label="Focus Score" value="87" showCheck />
      </div>

      <ProductivityChart data={chartData} />

      <div className="grid grid-cols-2 gap-4">
        <RecentDrafts drafts={mockDrafts.slice(0, 4)} />
        <RecentActivity activities={mockActivities.slice(0, 4)} />
      </div>
    </div>
  );
}
