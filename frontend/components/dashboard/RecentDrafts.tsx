import { Draft } from "@/lib/mock-data";
import { GitBranch, ExternalLink } from "lucide-react";
import Link from "next/link";

const sourceIcons = {
  github: GitBranch,
  jira: ExternalLink,
  slack: ExternalLink,
  calendar: ExternalLink,
};

export function RecentDrafts({ drafts }: { drafts: Draft[] }) {
  return (
    <div className="bg-[#111827] rounded-2xl p-5 border border-white/[0.06]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-[#F8FAFC]">AI Draft Approval</h3>
        <span className="text-xs text-[#94A3B8] font-mono bg-white/[0.04] px-2 py-0.5 rounded">
          #0F172A
        </span>
      </div>
      <div className="space-y-3">
        {drafts.map((draft) => (
          <div key={draft.id} className="flex items-center gap-3 py-2 border-b border-white/[0.04] last:border-0">
            <div className="w-7 h-7 bg-[#24292E] rounded-lg flex items-center justify-center shrink-0">
              <GitBranch className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-[#F8FAFC] truncate">{draft.project}</p>
              <p className="text-xs text-[#94A3B8] truncate">{draft.task}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {draft.sources.slice(0, 2).map((src) => {
                const Icon = sourceIcons[src];
                return (
                  <div key={src} className="w-4 h-4 text-[#6366F1]">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                );
              })}
              <span className="text-xs font-bold text-emerald-400">{draft.confidence}%</span>
            </div>
          </div>
        ))}
      </div>
      <Link
        href="/drafts"
        className="block mt-4 text-center text-xs text-[#6366F1] hover:text-[#8B5CF6] transition-colors font-medium"
      >
        View all drafts →
      </Link>
    </div>
  );
}
