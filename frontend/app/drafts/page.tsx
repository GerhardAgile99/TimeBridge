"use client";

import { useState, useEffect, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { DraftCard, DraftCardData } from "@/components/drafts/DraftCard";
import { drafts as mockDrafts } from "@/lib/mock-data";
import { getDrafts, approveDraft, rejectDraft, approveAllDrafts } from "@/lib/api/drafts";
import { minutesToDuration } from "@/lib/utils/time";
import { Search, Filter, CheckCheck } from "lucide-react";

function toCardData(d: import("@/lib/api/types").ApiDraft): DraftCardData {
  return {
    id: d.id,
    project: d.metadata?.project_name as string ?? "Work",
    task: d.task,
    duration: minutesToDuration(d.duration_minutes),
    confidence: d.confidence_score,
    sources: d.sources ?? [],
    status: d.status,
  };
}

const mockCardDrafts: DraftCardData[] = mockDrafts.map((d) => ({
  id: d.id,
  project: d.project,
  task: d.task,
  duration: d.duration,
  confidence: d.confidence,
  sources: d.sources,
  status: d.status,
}));

export default function DraftsPage() {
  const [drafts, setDrafts] = useState<DraftCardData[]>(mockCardDrafts);
  const [isLive, setIsLive] = useState(false);
  const [search, setSearch] = useState("");

  const loadDrafts = useCallback(async () => {
    try {
      const res = await getDrafts("pending");
      if (res.data.length > 0) {
        setDrafts(res.data.map(toCardData));
        setIsLive(true);
      }
    } catch {
      // backend offline — keep mock
    }
  }, []);

  useEffect(() => {
    loadDrafts();
  }, [loadDrafts]);

  const handleApprove = async (id: string) => {
    if (isLive) await approveDraft(id);
    setDrafts((prev) => prev.filter((d) => d.id !== id));
  };

  const handleReject = async (id: string) => {
    if (isLive) await rejectDraft(id);
    setDrafts((prev) => prev.filter((d) => d.id !== id));
  };

  const handleApproveAll = async () => {
    if (isLive) {
      await approveAllDrafts().catch(() => null);
    }
    setDrafts([]);
  };

  const visible = search
    ? drafts.filter(
        (d) =>
          d.task.toLowerCase().includes(search.toLowerCase()) ||
          d.project.toLowerCase().includes(search.toLowerCase())
      )
    : drafts;

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#F8FAFC]">
            AI Drafts{" "}
            <span className="text-[#94A3B8] font-normal">·</span>{" "}
            <span className="text-[#94A3B8] font-normal text-xl">{drafts.length} pending</span>
          </h1>
          <p className="text-[#94A3B8] text-sm mt-1">Review and approve AI-generated work logs</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-[#1E293B] text-[#F8FAFC] placeholder:text-[#94A3B8] text-sm rounded-lg pl-9 pr-4 py-2 border border-white/[0.06] focus:outline-none focus:border-[#6366F1]/50 w-48 transition-colors"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1E293B] text-[#94A3B8] border border-white/[0.08] text-sm hover:text-[#F8FAFC] transition-colors">
            <Filter className="w-3.5 h-3.5" />
            Filter
          </button>
          <button
            onClick={handleApproveAll}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-sm font-medium hover:bg-emerald-500/20 transition-colors"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Approve All
          </button>
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-[#94A3B8] uppercase tracking-wide mb-4">
          Approval
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <AnimatePresence>
            {visible.map((draft, i) => (
              <DraftCard
                key={draft.id}
                draft={draft}
                index={i}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            ))}
          </AnimatePresence>
        </div>
        {visible.length === 0 && (
          <div className="text-center py-20 text-[#94A3B8]">
            <p className="text-lg font-medium text-[#F8FAFC]">All caught up</p>
            <p className="text-sm mt-1">No pending drafts to review</p>
          </div>
        )}
      </div>
    </div>
  );
}
