"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { weeklyBarData, projectChartData } from "@/lib/mock-data";
import { useEffect, useState } from "react";
import { getStats, getWeeklyData } from "@/lib/api/reports";

const PIE_COLORS = ["#6366F1", "#8B5CF6", "#EC4899", "#F59E0B", "#10B981"];

function CustomBarTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1E293B] border border-white/10 rounded-lg px-3 py-2 text-sm shadow-xl">
        <p className="text-[#94A3B8]">{label}</p>
        <p className="text-[#F8FAFC] font-semibold">{payload[0].value}h</p>
      </div>
    );
  }
  return null;
}

export default function ReportsPage() {
  const [totalHours, setTotalHours] = useState("39.6h");
  const [pendingDrafts, setPendingDrafts] = useState(48);
  const [barData, setBarData] = useState(weeklyBarData);
  const [pieData, setPieData] = useState(projectChartData);

  useEffect(() => {
    const load = async () => {
      try {
        const [stats, weekly] = await Promise.all([getStats(), getWeeklyData()]);
        setTotalHours(`${stats.hours_logged_this_week}h`);
        setPendingDrafts(stats.pending_drafts);

        if (weekly.data.length > 0) {
          setBarData(weekly.data);
        }

        if (stats.project_breakdown.length > 0) {
          const total = stats.project_breakdown.reduce((s, p) => s + p.total_minutes, 0) || 1;
          setPieData(
            stats.project_breakdown.slice(0, 5).map((p, i) => ({
              name: p.project_name ?? "Unknown",
              value: Math.round((p.total_minutes / total) * 100),
              color: PIE_COLORS[i % PIE_COLORS.length],
            }))
          );
        }
      } catch {
        // backend offline — keep mock values
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-[#F8FAFC]">Reports</h1>
        <p className="text-[#94A3B8] text-sm mt-1">Weekly productivity analysis and insights</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[#111827] rounded-2xl p-5 border border-white/[0.06]">
          <p className="text-sm text-[#94A3B8] font-medium">Total This Week</p>
          <p className="text-4xl font-bold text-[#F8FAFC] mt-2">{totalHours}</p>
          <p className="text-sm text-emerald-400 mt-1 font-medium">+18% vs last week</p>
        </div>
        <div className="bg-[#111827] rounded-2xl p-5 border border-white/[0.06]">
          <p className="text-sm text-[#94A3B8] font-medium">AI Accuracy</p>
          <p className="text-4xl font-bold text-[#F8FAFC] mt-2">93%</p>
          <p className="text-sm text-[#94A3B8] mt-1">Confidence average</p>
        </div>
        <div className="bg-[#111827] rounded-2xl p-5 border border-white/[0.06]">
          <p className="text-sm text-[#94A3B8] font-medium">Pending Drafts</p>
          <p className="text-4xl font-bold text-[#F8FAFC] mt-2">{pendingDrafts}</p>
          <p className="text-sm text-[#94A3B8] mt-1">Awaiting review</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Weekly bar chart */}
        <div className="col-span-2 bg-[#111827] rounded-2xl p-6 border border-white/[0.06]">
          <h3 className="text-sm font-semibold text-[#94A3B8] uppercase tracking-wide mb-6">
            Hours by Day — This Week
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData} barSize={32}>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#94A3B8", fontSize: 12 }} />
              <YAxis hide />
              <Tooltip content={<CustomBarTooltip />} />
              <Bar dataKey="hours" fill="#6366F1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div className="bg-[#111827] rounded-2xl p-6 border border-white/[0.06]">
          <h3 className="text-sm font-semibold text-[#94A3B8] uppercase tracking-wide mb-6">
            Time by Project
          </h3>
          <div className="flex flex-col items-center">
            <PieChart width={160} height={160}>
              <Pie
                data={pieData}
                cx={75}
                cy={75}
                innerRadius={50}
                outerRadius={70}
                dataKey="value"
                strokeWidth={0}
              >
                {pieData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
            <div className="space-y-2 w-full mt-2">
              {pieData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-[#94A3B8]">{item.name}</span>
                  </div>
                  <span className="text-[#F8FAFC] font-medium">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AI Summary */}
      <div className="bg-[#111827] rounded-2xl p-6 border border-white/[0.06]">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-[#6366F1] animate-pulse" />
          <h3 className="text-sm font-semibold text-[#F8FAFC]">AI Weekly Summary</h3>
        </div>
        <p className="text-sm text-[#94A3B8] leading-relaxed">
          This week you spent <span className="text-[#F8FAFC] font-medium">21.5h</span> on Mobile App Redesign — primarily auth flow improvements and code review.
          You dedicated <span className="text-[#F8FAFC] font-medium">9.2h</span> to Customer Onboarding bug fixes, and <span className="text-[#F8FAFC] font-medium">4.8h</span> in team meetings.
          Your peak productivity window is <span className="text-[#F8FAFC] font-medium">Friday 09:00–14:00</span>.
          Consider protecting that block for deep focus work.
        </p>
      </div>
    </div>
  );
}
