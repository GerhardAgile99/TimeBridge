import { projects as mockProjects } from "@/lib/mock-data";
import { Users, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { getProjects } from "@/lib/api/projects";
import type { Project } from "@/lib/mock-data";

const activityColors = {
  high: { text: "text-emerald-400", bg: "bg-emerald-400/10", label: "High" },
  medium: { text: "text-amber-400", bg: "bg-amber-400/10", label: "Medium" },
  low: { text: "text-[#94A3B8]", bg: "bg-white/[0.04]", label: "Low" },
};

const PROJECT_COLORS = ["#6366F1", "#8B5CF6", "#EC4899", "#F59E0B", "#10B981", "#06B6D4"];

async function loadProjects(): Promise<Project[]> {
  try {
    const res = await getProjects();
    if (res.data.length === 0) return mockProjects;
    return res.data.map((p, i) => ({
      id: p.id,
      name: p.name,
      totalHours: 0,
      contributors: 1,
      aiActivityLevel: "low" as const,
      recentWork: p.description ?? "No recent activity",
      color: p.color ?? PROJECT_COLORS[i % PROJECT_COLORS.length],
    }));
  } catch {
    return mockProjects;
  }
}

export default async function ProjectsPage() {
  const projects = await loadProjects();

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#F8FAFC]">Projects</h1>
          <p className="text-[#94A3B8] text-sm mt-1">
            {projects.length} active projects tracked by AI
          </p>
        </div>
        <button className="px-4 py-2 rounded-lg bg-[#6366F1] text-white text-sm font-medium hover:bg-[#5457e5] transition-colors">
          + New Project
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {projects.map((project) => {
          const activity = activityColors[project.aiActivityLevel];
          return (
            <div
              key={project.id}
              className="bg-[#111827] rounded-2xl p-5 border border-white/[0.06] hover:border-white/[0.1] transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
                  style={{ backgroundColor: project.color + "20", color: project.color }}
                >
                  {project.name.charAt(0)}
                </div>
                <span className={cn("text-xs font-medium px-2 py-1 rounded-full", activity.bg, activity.text)}>
                  {activity.label} AI activity
                </span>
              </div>

              <h3 className="text-sm font-semibold text-[#F8FAFC] mb-1 group-hover:text-white transition-colors">
                {project.name}
              </h3>
              <p className="text-xs text-[#94A3B8] mb-4 truncate">{project.recentWork}</p>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-[#94A3B8]" />
                  <span className="text-sm font-semibold text-[#F8FAFC]">{project.totalHours}h</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-[#94A3B8]" />
                  <span className="text-sm font-semibold text-[#F8FAFC]">{project.contributors}</span>
                  <span className="text-xs text-[#94A3B8]">members</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-white/[0.06]">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#94A3B8]">Progress this week</span>
                  <span className="text-xs font-medium" style={{ color: project.color }}>
                    {Math.round(project.totalHours * 0.15)}h
                  </span>
                </div>
                <div className="mt-2 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(100, (project.totalHours / 140) * 100)}%`,
                      backgroundColor: project.color,
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
