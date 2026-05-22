"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const waveHeights = [
  25, 60, 40, 80, 35, 70, 50, 90, 30, 65, 45, 85, 20, 75, 55, 95, 30, 50,
  40, 70, 25, 85, 45, 60, 35, 90, 55, 40, 70, 30, 60, 80, 35, 55, 75, 45,
  90, 25, 65, 50,
];

export function AIHeroCard() {
  return (
    <div className="relative rounded-2xl overflow-hidden p-6 bg-gradient-to-r from-[#4338CA] via-[#5B5BD6] to-[#7C3AED]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(139,92,246,0.3),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(67,56,202,0.4),transparent_60%)]" />

      <div className="relative flex items-center gap-6">
        {/* Left info */}
        <div className="shrink-0">
          <p className="text-indigo-200 text-sm font-medium mb-1">AI detected</p>
          <h2 className="text-5xl font-bold text-white tracking-tight leading-none">
            6h 42m
          </h2>
          <p className="text-indigo-200 text-sm mt-2 flex items-center gap-2">
            of productive work today
            <span className="inline-flex items-center bg-white/20 text-white text-xs px-2 py-0.5 rounded-full font-medium">
              92% confidence
            </span>
          </p>
        </div>

        {/* Waveform */}
        <div className="flex-1 flex items-center gap-[3px] h-16 px-2">
          {waveHeights.map((height, i) => (
            <motion.div
              key={i}
              className="flex-1 rounded-full bg-white/25"
              animate={{ scaleY: [1, 0.3, 1.4, 0.5, 1] }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                delay: i * 0.06,
                ease: "easeInOut",
              }}
              style={{ height: `${height}%`, transformOrigin: "center" }}
            />
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-2.5 shrink-0">
          <button className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-white text-[#4338CA] font-semibold text-sm hover:bg-white/90 transition-colors shadow-lg">
            Approve All
          </button>
          <Link
            href="/drafts"
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl border border-white/30 text-white font-medium text-sm hover:bg-white/10 transition-colors"
          >
            Review Drafts
          </Link>
        </div>
      </div>
    </div>
  );
}
