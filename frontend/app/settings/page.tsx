import { Check, ExternalLink } from "lucide-react";

const integrations = [
  {
    id: "slack",
    name: "Slack",
    description: "Detect work from messages and channels",
    connected: true,
    color: "#4A154B",
    initial: "S",
  },
  {
    id: "github",
    name: "GitHub",
    description: "Track commits, PRs, and code reviews",
    connected: true,
    color: "#24292E",
    initial: "G",
  },
  {
    id: "jira",
    name: "Jira",
    description: "Sync tickets, sprints, and updates",
    connected: true,
    color: "#0052CC",
    initial: "J",
  },
  {
    id: "calendar",
    name: "Google Calendar",
    description: "Log meetings and scheduled events",
    connected: false,
    color: "#EA4335",
    initial: "G",
  },
  {
    id: "notion",
    name: "Notion",
    description: "Capture docs, notes, and tasks",
    connected: false,
    color: "#000000",
    initial: "N",
  },
];

const settingSections = [
  {
    title: "AI Preferences",
    items: [
      { label: "Auto-draft work logs", description: "AI creates drafts automatically from activity", enabled: true },
      { label: "Confidence threshold", description: "Only show drafts above 80% confidence", enabled: true },
      { label: "Smart suggestions", description: "AI learns from your edits to improve accuracy", enabled: true },
    ],
  },
  {
    title: "Work Hours",
    items: [
      { label: "Track weekends", description: "Include Saturday and Sunday in activity detection", enabled: false },
      { label: "Focus time blocks", description: "Mark recurring deep work windows", enabled: true },
    ],
  },
  {
    title: "Notifications",
    items: [
      { label: "Daily summary", description: "Receive end-of-day work summary via Slack", enabled: true },
      { label: "Weekly report", description: "Automated weekly productivity report every Friday", enabled: true },
      { label: "Draft alerts", description: "Notify when new drafts are ready for approval", enabled: false },
    ],
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-8 max-w-[900px] mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-[#F8FAFC]">Settings</h1>
        <p className="text-[#94A3B8] text-sm mt-1">Manage integrations, AI preferences, and notifications</p>
      </div>

      {/* Integrations */}
      <section>
        <h2 className="text-sm font-semibold text-[#94A3B8] uppercase tracking-wide mb-4">
          Integrations
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {integrations.map((integration) => (
            <div
              key={integration.id}
              className="flex items-center gap-4 bg-[#111827] rounded-xl p-4 border border-white/[0.06] hover:border-white/[0.1] transition-colors"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
                style={{ backgroundColor: integration.color }}
              >
                {integration.initial}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#F8FAFC]">{integration.name}</p>
                <p className="text-xs text-[#94A3B8] truncate">{integration.description}</p>
              </div>
              <button
                className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  integration.connected
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "bg-[#6366F1]/10 text-[#6366F1] border border-[#6366F1]/20 hover:bg-[#6366F1]/20"
                }`}
              >
                {integration.connected ? (
                  <>
                    <Check className="w-3 h-3" />
                    Connected
                  </>
                ) : (
                  <>
                    <ExternalLink className="w-3 h-3" />
                    Connect
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Settings sections */}
      {settingSections.map((section) => (
        <section key={section.title}>
          <h2 className="text-sm font-semibold text-[#94A3B8] uppercase tracking-wide mb-4">
            {section.title}
          </h2>
          <div className="bg-[#111827] rounded-2xl border border-white/[0.06] overflow-hidden">
            {section.items.map((item, i) => (
              <div
                key={item.label}
                className={`flex items-center justify-between p-5 ${
                  i < section.items.length - 1 ? "border-b border-white/[0.06]" : ""
                }`}
              >
                <div>
                  <p className="text-sm font-medium text-[#F8FAFC]">{item.label}</p>
                  <p className="text-xs text-[#94A3B8] mt-0.5">{item.description}</p>
                </div>
                <button
                  className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
                    item.enabled ? "bg-[#6366F1]" : "bg-white/[0.1]"
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                      item.enabled ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
