"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ChartDataPoint {
  day: string;
  hours: number;
}

interface TooltipProps {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1E293B] border border-white/10 rounded-lg px-3 py-2 text-sm shadow-xl">
        <p className="text-[#94A3B8]">{label}</p>
        <p className="text-[#F8FAFC] font-semibold">{payload[0].value} hrs</p>
      </div>
    );
  }
  return null;
}

export function ProductivityChart({ data }: { data: ChartDataPoint[] }) {
  return (
    <div className="bg-[#111827] rounded-2xl p-6 border border-white/[0.06]">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-semibold text-[#94A3B8] uppercase tracking-wide">
          Productivity Trend
        </h3>
        <span className="text-xs text-[#94A3B8] bg-white/[0.04] px-3 py-1 rounded-full">
          This Week
        </span>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366F1" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#6366F1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="day"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#94A3B8", fontSize: 11 }}
            dy={8}
          />
          <YAxis hide />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="hours"
            stroke="#6366F1"
            strokeWidth={2.5}
            fill="url(#colorValue)"
            dot={false}
            activeDot={{ r: 4, fill: "#6366F1", strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
