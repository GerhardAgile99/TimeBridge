import { cn } from "@/lib/utils";

interface MetricCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  change?: string;
  positive?: boolean;
  showCheck?: boolean;
  children?: React.ReactNode;
}

export function MetricCard({
  icon: Icon,
  label,
  value,
  change,
  positive,
  showCheck,
  children,
}: MetricCardProps) {
  return (
    <div className="bg-[#111827] rounded-2xl p-5 border border-white/[0.06] hover:border-white/[0.1] transition-colors">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-md bg-[#6366F1]/10 flex items-center justify-center">
          <Icon className="w-3.5 h-3.5 text-[#6366F1]" />
        </div>
        <span className="text-sm text-[#94A3B8] font-medium">{label}</span>
      </div>

      <div className="flex items-end justify-between">
        <div className="flex items-end gap-2">
          <span className="text-3xl font-bold text-[#F8FAFC] tracking-tight leading-none">
            {value}
          </span>
          {change && (
            <span
              className={cn(
                "text-sm font-semibold mb-0.5",
                positive ? "text-emerald-400" : "text-red-400"
              )}
            >
              {change}
            </span>
          )}
          {showCheck && (
            <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center mb-0.5">
              <span className="text-emerald-400 text-xs font-bold">✓</span>
            </div>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}
