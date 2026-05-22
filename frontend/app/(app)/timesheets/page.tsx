"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, CheckCircle, Clock, Zap } from "lucide-react";
import { getDrafts, approveDraft, rejectDraft } from "@/lib/api/drafts";
import { ApiDraft } from "@/lib/api/types";
import { minutesToDuration } from "@/lib/utils/time";

function getWeekBounds(offset: number) {
  const now = new Date();
  const day = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1) + offset * 7);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return {
    start: monday,
    end: sunday,
    label: `${fmt(monday)} – ${fmt(sunday)}, ${sunday.getFullYear()}`,
  };
}

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function groupByDay(drafts: ApiDraft[], start: Date, end: Date) {
  const inRange = drafts.filter((d) => {
    const t = new Date(d.created_at).getTime();
    return t >= start.getTime() && t <= end.getTime();
  });
  const map = new Map<string, { dayLabel: string; date: Date; items: ApiDraft[] }>();
  for (const d of inRange) {
    const dt = new Date(d.created_at);
    const key = dt.toDateString();
    if (!map.has(key)) {
      map.set(key, {
        dayLabel: `${DAY_NAMES[dt.getDay()]}, ${dt.toLocaleDateString("en-US", { month: "long", day: "numeric" })}`,
        date: dt,
        items: [],
      });
    }
    map.get(key)!.items.push(d);
  }
  return Array.from(map.values()).sort((a, b) => b.date.getTime() - a.date.getTime());
}

export default function TimesheetsPage() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [drafts, setDrafts] = useState<ApiDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<Set<string>>(new Set());

  const { start, end, label } = getWeekBounds(weekOffset);

  const load = useCallback(() => {
    setLoading(true);
    getDrafts()
      .then((res) => setDrafts(res.data))
      .catch(() => setDrafts([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const days = groupByDay(drafts, start, end);
  const weekDrafts = days.flatMap((d) => d.items);
  const pending = weekDrafts.filter((d) => d.status === "pending");
  const approved = weekDrafts.filter((d) => d.status === "approved");
  const totalMinutes = weekDrafts.reduce((s, d) => s + d.duration_minutes, 0);

  async function doApprove(id: string) {
    setActing((p) => new Set([...p, id]));
    try {
      await approveDraft(id);
      setDrafts((p) => p.map((d) => (d.id === id ? { ...d, status: "approved" as const } : d)));
    } finally {
      setActing((p) => { const s = new Set(p); s.delete(id); return s; });
    }
  }

  async function doReject(id: string) {
    setActing((p) => new Set([...p, id]));
    try {
      await rejectDraft(id);
      setDrafts((p) => p.map((d) => (d.id === id ? { ...d, status: "rejected" as const } : d)));
    } finally {
      setActing((p) => { const s = new Set(p); s.delete(id); return s; });
    }
  }

  async function approveWeek() {
    for (const d of pending) await doApprove(d.id);
  }

  return (
    <div className="space-y-6 max-w-[900px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#F8FAFC]">Timesheets</h1>
          <p className="text-[#94A3B8] text-sm mt-1">{label}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setWeekOffset((w) => w - 1)}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/[0.12] text-[#94A3B8] hover:text-[#F8FAFC] hover:border-white/20 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setWeekOffset(0)}
              disabled={weekOffset === 0}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-white/[0.12] text-[#94A3B8] hover:text-[#F8FAFC] hover:border-white/20 disabled:opacity-40 transition-colors"
            >
              This week
            </button>
            <button
              onClick={() => setWeekOffset((w) => w + 1)}
              disabled={weekOffset >= 0}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/[0.12] text-[#94A3B8] hover:text-[#F8FAFC] hover:border-white/20 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          {pending.length > 0 && (
            <button
              onClick={approveWeek}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Approve All ({pending.length})
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total This Week", value: minutesToDuration(totalMinutes), icon: Clock, color: "text-[#6366F1]" },
          { label: "Pending Approval", value: String(pending.length), icon: Zap, color: "text-amber-400" },
          { label: "Approved", value: String(approved.length), icon: CheckCircle, color: "text-emerald-400" },
        ].map(({ label: lbl, value, icon: Icon, color }) => (
          <div key={lbl} className="bg-[#111827] rounded-xl p-4 border border-white/[0.06]">
            <div className="flex items-center gap-2 mb-2">
              <Icon className={`w-4 h-4 ${color}`} />
              <span className="text-xs text-[#94A3B8]">{lbl}</span>
            </div>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Day groups */}
      {loading ? (
        <div className="text-center py-16 text-[#94A3B8]">Loading...</div>
      ) : days.length === 0 ? (
        <div className="bg-[#111827] rounded-xl p-12 border border-white/[0.06] text-center">
          <Clock className="w-10 h-10 text-[#334155] mx-auto mb-3" />
          <p className="font-medium text-[#F8FAFC]">No activity this week</p>
          <p className="text-sm text-[#94A3B8] mt-1">Push code to GitHub to see tracked work appear here</p>
        </div>
      ) : (
        <div className="space-y-8">
          {days.map(({ dayLabel, items }) => {
            const dayMinutes = items.reduce((s, d) => s + d.duration_minutes, 0);
            return (
              <div key={dayLabel}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-[#64748B] uppercase tracking-widest">
                    {dayLabel}
                  </span>
                  <span className="text-xs font-medium text-[#94A3B8]">
                    {minutesToDuration(dayMinutes)}
                  </span>
                </div>
                <div className="space-y-2">
                  {items.map((draft) => (
                    <div
                      key={draft.id}
                      className="flex items-center gap-4 bg-[#111827] rounded-xl px-4 py-3.5 border border-white/[0.06] hover:border-white/[0.1] transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#F8FAFC] truncate">{draft.task}</p>
                        <p className="text-xs text-[#64748B] mt-0.5">
                          {new Date(draft.created_at).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          {draft.notes && (
                            <span className="ml-2 text-[#94A3B8]">{draft.notes}</span>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-sm font-mono text-[#94A3B8] w-14 text-right">
                          {minutesToDuration(draft.duration_minutes)}
                        </span>
                        {draft.status === "pending" ? (
                          <div className="flex items-center gap-2">
                            <button
                              disabled={acting.has(draft.id)}
                              onClick={() => doApprove(draft.id)}
                              className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/40 border border-emerald-500/30 text-emerald-400 text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                            >
                              Approve
                            </button>
                            <button
                              disabled={acting.has(draft.id)}
                              onClick={() => doReject(draft.id)}
                              className="px-3 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.12] text-[#94A3B8] text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                              draft.status === "approved"
                                ? "bg-emerald-400/10 text-emerald-400"
                                : "bg-red-400/10 text-red-400"
                            }`}
                          >
                            {draft.status === "approved" ? "Approved ✓" : "Rejected"}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
