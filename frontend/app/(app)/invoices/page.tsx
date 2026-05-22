"use client";

import { useState, useEffect, useRef } from "react";
import { FileText, Printer, ChevronDown } from "lucide-react";
import { getDrafts } from "@/lib/api/drafts";
import { getProjects } from "@/lib/api/projects";
import { ApiDraft, ApiProject } from "@/lib/api/types";
import { minutesToDuration } from "@/lib/utils/time";

function getMonthBounds(monthOffset: number) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  const end = new Date(now.getFullYear(), now.getMonth() + monthOffset + 1, 0, 23, 59, 59, 999);
  const label = start.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  return { start, end, label };
}

function nextInvoiceNumber(): string {
  const key = "flowtrack_invoice_seq";
  const n = parseInt(localStorage.getItem(key) ?? "0", 10) + 1;
  localStorage.setItem(key, String(n));
  return `INV-${String(n).padStart(3, "0")}`;
}

export default function InvoicesPage() {
  const [drafts, setDrafts] = useState<ApiDraft[]>([]);
  const [projects, setProjects] = useState<ApiProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [monthOffset, setMonthOffset] = useState(0);
  const [rate, setRate] = useState<number>(150);
  const [invoiceNumber] = useState(() => {
    if (typeof window === "undefined") return "INV-001";
    const seq = parseInt(localStorage.getItem("flowtrack_invoice_seq") ?? "0", 10);
    return `INV-${String(seq + 1).padStart(3, "0")}`;
  });
  const [generated, setGenerated] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.allSettled([getDrafts("approved"), getProjects()]).then(([dRes, pRes]) => {
      if (dRes.status === "fulfilled") setDrafts(dRes.value.data);
      if (pRes.status === "fulfilled") setProjects(pRes.value.data);
      setLoading(false);
    });
  }, []);

  const { start, end, label: monthLabel } = getMonthBounds(monthOffset);

  const projectMap = new Map(projects.map((p) => [p.id, p]));

  const filtered = drafts.filter((d) => {
    const t = new Date(d.created_at).getTime();
    const inRange = t >= start.getTime() && t <= end.getTime();
    const inProject = selectedProject === "all" || d.project_id === selectedProject;
    return inRange && inProject;
  });

  const totalMinutes = filtered.reduce((s, d) => s + d.duration_minutes, 0);
  const totalHours = totalMinutes / 60;
  const subtotal = totalHours * rate;
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  function handlePrint() {
    if (!generated) {
      nextInvoiceNumber();
      setGenerated(true);
    }
    window.print();
  }

  const projectName =
    selectedProject === "all"
      ? "All Projects"
      : projectMap.get(selectedProject)?.name ?? "Unknown Project";

  return (
    <div className="space-y-6 max-w-[960px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between no-print">
        <div>
          <h1 className="text-2xl font-bold text-[#F8FAFC]">Invoices</h1>
          <p className="text-[#94A3B8] text-sm mt-1">Generate invoices from approved timesheet entries</p>
        </div>
        <button
          onClick={handlePrint}
          disabled={filtered.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-[#6366F1] hover:bg-[#5254cc] disabled:opacity-40 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Printer className="w-4 h-4" />
          Print / Save PDF
        </button>
      </div>

      {/* Filters bar */}
      <div className="flex flex-wrap items-end gap-4 bg-[#111827] rounded-xl p-4 border border-white/[0.06] no-print">
        {/* Project */}
        <div className="flex-1 min-w-[140px]">
          <label className="text-xs text-[#64748B] mb-1.5 block">Project</label>
          <div className="relative">
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full bg-[#0B1120] border border-white/[0.12] text-[#F8FAFC] text-sm rounded-lg px-3 py-2 appearance-none focus:outline-none focus:border-[#6366F1]/50"
            >
              <option value="all">All Projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#94A3B8] pointer-events-none" />
          </div>
        </div>

        {/* Period */}
        <div>
          <label className="text-xs text-[#64748B] mb-1.5 block">Period</label>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setMonthOffset((m) => m - 1)}
              className="w-8 h-9 flex items-center justify-center rounded-lg border border-white/[0.12] text-[#94A3B8] hover:text-[#F8FAFC] text-sm"
            >
              ‹
            </button>
            <span className="px-3 py-2 text-sm text-[#F8FAFC] font-medium bg-[#0B1120] border border-white/[0.12] rounded-lg min-w-[120px] text-center">
              {monthLabel}
            </span>
            <button
              onClick={() => setMonthOffset((m) => Math.min(m + 1, 0))}
              disabled={monthOffset >= 0}
              className="w-8 h-9 flex items-center justify-center rounded-lg border border-white/[0.12] text-[#94A3B8] hover:text-[#F8FAFC] disabled:opacity-40 text-sm"
            >
              ›
            </button>
          </div>
        </div>

        {/* Rate */}
        <div className="w-36">
          <label className="text-xs text-[#64748B] mb-1.5 block">Hourly Rate (USD)</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B] text-sm">$</span>
            <input
              type="number"
              min={1}
              value={rate}
              onChange={(e) => setRate(Math.max(1, Number(e.target.value)))}
              className="w-full bg-[#0B1120] border border-white/[0.12] text-[#F8FAFC] text-sm rounded-lg pl-6 pr-3 py-2 focus:outline-none focus:border-[#6366F1]/50"
            />
          </div>
        </div>

        {/* Summary pills */}
        <div className="flex items-center gap-3 ml-auto">
          <span className="text-xs text-[#94A3B8]">{filtered.length} entries · {totalHours.toFixed(2)}h</span>
          <span className="text-sm font-bold text-[#6366F1]">${subtotal.toFixed(2)}</span>
        </div>
      </div>

      {/* Invoice preview */}
      <div>
          {loading ? (
            <div className="bg-[#111827] rounded-xl border border-white/[0.06] p-12 text-center text-[#94A3B8]">
              Loading...
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-[#111827] rounded-xl border border-white/[0.06] p-12 text-center">
              <FileText className="w-10 h-10 text-[#334155] mx-auto mb-3" />
              <p className="font-medium text-[#F8FAFC]">No approved entries</p>
              <p className="text-sm text-[#94A3B8] mt-1">
                Approve timesheet entries first, then generate your invoice here
              </p>
            </div>
          ) : (
            <div
              ref={printRef}
              className="bg-white text-gray-900 rounded-xl shadow-xl overflow-hidden"
              id="invoice-print"
            >
              {/* Invoice header */}
              <div className="bg-[#6366F1] px-8 py-6 text-white">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">INVOICE</h2>
                    <p className="text-indigo-200 text-sm mt-0.5">{invoiceNumber}</p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-semibold text-lg">FlowTrack AI</p>
                    <p className="text-indigo-200">Freelance Software Development</p>
                  </div>
                </div>
              </div>

              {/* Invoice meta */}
              <div className="px-8 py-5 grid grid-cols-3 gap-6 border-b border-gray-100 bg-gray-50">
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Invoice Date</p>
                  <p className="text-sm font-medium text-gray-800">{today}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Period</p>
                  <p className="text-sm font-medium text-gray-800">{monthLabel}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Project</p>
                  <p className="text-sm font-medium text-gray-800">{projectName}</p>
                </div>
              </div>

              {/* Line items */}
              <div className="px-8 py-5">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider pb-3 w-auto">
                        Task
                      </th>
                      <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider pb-3 w-28">
                        Date
                      </th>
                      <th className="text-right text-xs font-semibold text-gray-400 uppercase tracking-wider pb-3 w-20">
                        Hours
                      </th>
                      <th className="text-right text-xs font-semibold text-gray-400 uppercase tracking-wider pb-3 w-24">
                        Rate
                      </th>
                      <th className="text-right text-xs font-semibold text-gray-400 uppercase tracking-wider pb-3 w-24">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filtered.map((d) => {
                      const hrs = d.duration_minutes / 60;
                      const amount = hrs * rate;
                      const dateStr = new Date(d.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      });
                      return (
                        <tr key={d.id}>
                          <td className="py-3 text-gray-700 pr-4">{d.task}</td>
                          <td className="py-3 text-gray-500 whitespace-nowrap">{dateStr}</td>
                          <td className="py-3 text-right text-gray-700 font-mono">{hrs.toFixed(2)}</td>
                          <td className="py-3 text-right text-gray-500">${rate.toFixed(2)}</td>
                          <td className="py-3 text-right text-gray-800 font-medium">${amount.toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="px-8 pb-8">
                <div className="ml-auto w-64 space-y-2 border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotal ({totalHours.toFixed(2)}h × ${rate})</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Tax (10%)</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-gray-900 border-t border-gray-200 pt-2">
                    <span>Total Due</span>
                    <span className="text-[#6366F1]">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 text-xs text-gray-400 text-center">
                Thank you for your business · Payment due within 30 days · Generated by FlowTrack AI
              </div>
            </div>
          )}
        </div>

      <style dangerouslySetInnerHTML={{ __html: "@media print { body > * { display: none !important; } #invoice-print { display: block !important; position: fixed; top: 0; left: 0; width: 100%; } .no-print { display: none !important; } }" }} />
    </div>
  );
}
