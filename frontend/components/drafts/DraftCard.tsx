"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ActivitySource } from "@/lib/mock-data";
import { GitBranch, Check, Edit2, X, Save, MessageSquare, Calendar, ExternalLink, ArrowUpRight } from "lucide-react";

const sourceIcons: Record<ActivitySource, React.ComponentType<{ className?: string }>> = {
  github: GitBranch,
  slack: MessageSquare,
  calendar: Calendar,
  jira: ExternalLink,
};

const sourceColors: Record<ActivitySource, string> = {
  github: "#94A3B8",
  slack: "#7C3AED",
  jira: "#3B82F6",
  calendar: "#94A3B8",
};

export interface DraftCardData {
  id: string;
  project: string;
  task: string;
  duration: string;
  duration_minutes: number;
  confidence: number;
  sources: string[];
  status: "pending" | "approved" | "rejected";
}

interface DraftCardProps {
  draft: DraftCardData;
  index?: number;
  onApprove?: (id: string) => Promise<void>;
  onReject?: (id: string) => Promise<void>;
  onEdit?: (id: string, changes: { task: string; duration_minutes: number }) => Promise<void>;
}

export function DraftCard({ draft, index = 0, onApprove, onReject, onEdit }: DraftCardProps) {
  const [cardStatus, setCardStatus] = useState<"pending" | "approved" | "rejected">("pending");
  const [editing, setEditing] = useState(false);
  const [editTask, setEditTask] = useState(draft.task);
  const [editMinutes, setEditMinutes] = useState(draft.duration_minutes);
  const [busy, setBusy] = useState(false);

  if (cardStatus !== "pending") return null;

  const handleApprove = async () => {
    setCardStatus("approved");
    if (onApprove) {
      setBusy(true);
      try { await onApprove(draft.id); } catch { setCardStatus("pending"); } finally { setBusy(false); }
    }
  };

  const handleReject = async () => {
    setCardStatus("rejected");
    if (onReject) {
      setBusy(true);
      try { await onReject(draft.id); } catch { setCardStatus("pending"); } finally { setBusy(false); }
    }
  };

  const handleEditSave = async () => {
    if (!onEdit) { setEditing(false); return; }
    setBusy(true);
    try {
      await onEdit(draft.id, { task: editTask.trim() || draft.task, duration_minutes: editMinutes });
      setEditing(false);
    } catch {
      // stay in edit mode on error
    } finally {
      setBusy(false);
    }
  };

  const handleEditCancel = () => {
    setEditTask(draft.task);
    setEditMinutes(draft.duration_minutes);
    setEditing(false);
  };

  const validSources = draft.sources.filter((s): s is ActivitySource =>
    ["slack", "github", "jira", "calendar"].includes(s)
  );

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.97, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05 }}
      className="bg-[#111827] rounded-2xl p-5 border border-white/[0.06] hover:border-white/[0.1] transition-all flex flex-col gap-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#24292E] rounded-lg flex items-center justify-center">
            <GitBranch className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-semibold text-[#F8FAFC]">{draft.project}</span>
        </div>
        <span className="text-sm font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-md">
          {draft.confidence}%
        </span>
      </div>

      {editing ? (
        /* ── Edit mode ── */
        <div className="flex flex-col gap-3">
          <div>
            <label className="text-xs text-[#94A3B8] mb-1 block">Task description</label>
            <textarea
              value={editTask}
              onChange={(e) => setEditTask(e.target.value)}
              rows={3}
              className="w-full bg-[#1E293B] text-[#F8FAFC] text-sm rounded-lg px-3 py-2 border border-white/[0.08] focus:outline-none focus:border-[#6366F1]/50 resize-none"
            />
          </div>
          <div>
            <label className="text-xs text-[#94A3B8] mb-1 block">Duration (minutes)</label>
            <input
              type="number"
              min={1}
              max={480}
              value={editMinutes}
              onChange={(e) => setEditMinutes(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full bg-[#1E293B] text-[#F8FAFC] text-sm rounded-lg px-3 py-2 border border-white/[0.08] focus:outline-none focus:border-[#6366F1]/50"
            />
          </div>
        </div>
      ) : (
        /* ── View mode ── */
        <p className="text-sm text-[#94A3B8] leading-relaxed flex-1">{draft.task}</p>
      )}

      {/* Footer row: sources + duration */}
      {!editing && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            {validSources.map((src) => {
              const Icon = sourceIcons[src];
              return (
                <span
                  key={src}
                  className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded"
                  style={{ color: sourceColors[src], backgroundColor: `${sourceColors[src]}15` }}
                >
                  <Icon className="w-3 h-3" />
                  {src.charAt(0).toUpperCase() + src.slice(1)}
                </span>
              );
            })}
          </div>
          <span className="text-sm font-semibold text-[#F8FAFC]">{draft.duration}</span>
        </div>
      )}

      {/* Actions */}
      {editing ? (
        <div className="flex gap-2">
          <button
            onClick={handleEditSave}
            disabled={busy}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-[#6366F1]/10 hover:bg-[#6366F1]/20 text-[#6366F1] text-sm font-semibold transition-colors disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            Save
          </button>
          <button
            onClick={handleEditCancel}
            disabled={busy}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-[#94A3B8] hover:text-[#F8FAFC] text-sm font-medium transition-colors disabled:opacity-50"
          >
            <X className="w-3.5 h-3.5" />
            Cancel
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            onClick={handleApprove}
            disabled={busy}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-sm font-semibold transition-colors disabled:opacity-50"
          >
            <Check className="w-3.5 h-3.5" />
            Approve
          </button>
          <button
            onClick={() => setEditing(true)}
            disabled={busy}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-[#94A3B8] hover:text-[#F8FAFC] text-sm font-medium transition-colors disabled:opacity-50"
          >
            <Edit2 className="w-3.5 h-3.5" />
            Edit
          </button>
          <button
            onClick={handleReject}
            disabled={busy}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-semibold transition-colors disabled:opacity-50"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            Reject
          </button>
        </div>
      )}
    </motion.div>
  );
}
