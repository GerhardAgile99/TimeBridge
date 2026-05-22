"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Zap, ArrowRight } from "lucide-react";
import { useUser } from "@/lib/user-context";

export default function LoginPage() {
  const [name, setName] = useState("");
  const { user, loaded, setUser } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (loaded && user) router.replace("/");
  }, [loaded, user, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    setUser({ name: trimmed });
    router.replace("/");
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#6366F1]">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-xl text-[#F8FAFC]">
            FlowTrack <span className="text-[#6366F1]">AI</span>
          </span>
        </div>

        {/* Card */}
        <div className="bg-[#111827] border border-white/[0.06] rounded-2xl p-8">
          <h1 className="text-2xl font-bold text-[#F8FAFC] mb-2">Welcome</h1>
          <p className="text-[#94A3B8] text-sm mb-8">
            What should we call you? No password needed — the AI handles the rest.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#94A3B8] mb-2">
                Your name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex"
                autoFocus
                className="w-full bg-[#1E293B] text-[#F8FAFC] placeholder:text-[#475569] text-sm rounded-lg px-4 py-3 border border-white/[0.06] focus:outline-none focus:border-[#6366F1]/50 focus:ring-1 focus:ring-[#6366F1]/30 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={!name.trim()}
              className="w-full flex items-center justify-center gap-2 bg-[#6366F1] hover:bg-[#5558E3] disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium text-sm rounded-lg px-4 py-3 transition-colors"
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-[#475569] mt-6">
          AI detects your work automatically. You just approve.
        </p>
      </div>
    </div>
  );
}
