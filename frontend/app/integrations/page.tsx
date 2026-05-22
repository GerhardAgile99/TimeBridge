import { Check, ExternalLink, RefreshCw } from "lucide-react";

const integrations = [
  {
    id: "slack",
    name: "Slack",
    description: "Detect work from messages, threads, and channel activity",
    connected: true,
    lastSync: "2 mins ago",
    eventsToday: 24,
    color: "#4A154B",
    initial: "S",
  },
  {
    id: "github",
    name: "GitHub",
    description: "Track commits, pull requests, reviews, and issues",
    connected: true,
    lastSync: "5 mins ago",
    eventsToday: 12,
    color: "#24292E",
    initial: "G",
  },
  {
    id: "jira",
    name: "Jira",
    description: "Sync sprint tickets, status updates, and comments",
    connected: true,
    lastSync: "10 mins ago",
    eventsToday: 8,
    color: "#0052CC",
    initial: "J",
  },
  {
    id: "calendar",
    name: "Google Calendar",
    description: "Log meetings, 1:1s, and scheduled focus blocks",
    connected: false,
    lastSync: null,
    eventsToday: 0,
    color: "#EA4335",
    initial: "G",
  },
  {
    id: "notion",
    name: "Notion",
    description: "Capture docs, meeting notes, and task updates",
    connected: false,
    lastSync: null,
    eventsToday: 0,
    color: "#1F1F1F",
    initial: "N",
  },
  {
    id: "vscode",
    name: "VS Code",
    description: "Track active coding sessions and file edits",
    connected: false,
    lastSync: null,
    eventsToday: 0,
    color: "#007ACC",
    initial: "V",
  },
];

export default function IntegrationsPage() {
  return (
    <div className="space-y-6 max-w-[900px] mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-[#F8FAFC]">Integrations</h1>
        <p className="text-[#94A3B8] text-sm mt-1">
          Connect your tools to let the AI detect work automatically
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {integrations.map((integration) => (
          <div
            key={integration.id}
            className="bg-[#111827] rounded-2xl p-5 border border-white/[0.06] hover:border-white/[0.1] transition-all"
          >
            <div className="flex items-start gap-4">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
                style={{ backgroundColor: integration.color }}
              >
                {integration.initial}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-semibold text-[#F8FAFC]">{integration.name}</p>
                  <button
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      integration.connected
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
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
                <p className="text-xs text-[#94A3B8] mb-3">{integration.description}</p>

                {integration.connected && (
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
                      <RefreshCw className="w-3 h-3" />
                      {integration.lastSync}
                    </div>
                    <div className="text-xs text-[#94A3B8]">
                      <span className="text-[#F8FAFC] font-medium">{integration.eventsToday}</span> events today
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
