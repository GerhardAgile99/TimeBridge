# FlowTrack AI — Architecture Diagram

## Frontend Pages & Relationships

```mermaid
graph TD
    GH["☁ GitHub\n(push / PR / review)"]
    TUNNEL["Cloudflare Tunnel\nhttps://…trycloudflare.com"]
    WEBHOOK["POST /api/webhooks/github\n(HMAC verified)"]
    QUEUE["BullMQ Queue\n(Redis)"]
    WORKER["Event Worker\n(ts-node-dev)"]
    AI["Claude AI\nWorkAnalyzer.ts"]
    DB[(PostgreSQL\nraw_events · drafts\nwork_logs · projects)]

    GH -->|"X-GitHub-Event webhook"| TUNNEL
    TUNNEL --> WEBHOOK
    WEBHOOK -->|"normalizePayload()\nenqueue event"| QUEUE
    QUEUE --> WORKER
    WORKER -->|"analyzeWork()"| AI
    AI -->|"task · duration · confidence"| WORKER
    WORKER -->|"create draft"| DB

    subgraph FRONTEND ["Next.js 15 Frontend  (localhost:3000)"]
        DASH["/ Dashboard\n─────────────\nHours this week\nPending drafts\nActive projects\nEvents today\nWeekly chart\nRecent activity\nRecent drafts"]
        ACT["/activity Activity Feed\n─────────────\nAll raw events\nDraft task overlay\nLog this / + button"]
        DRAFTS["/drafts AI Drafts\n─────────────\nPending AI suggestions\nEdit task & duration\nApprove / Reject"]
        TS["/timesheets Timesheets\n─────────────\nWeekly grouped view\nApprove / Reject per entry\nApprove All button\nWeek navigation"]
        INV["/invoices Invoices\n─────────────\nFilter by project & month\nHourly rate input\nLine-item invoice preview\nPrint / Save PDF"]
        PROJ["/projects Projects\n─────────────\nProject list\nHours per project"]
        REP["/reports Reports\n─────────────\nWeekly bar chart\nProject breakdown\nStats"]
        TEAM["/team Team\n─────────────\nTeam member list\nActivity per member"]
        INT["/integrations Integrations\n─────────────\nGitHub webhook status\nSlack / Jira / Calendar"]
        SET["/settings Settings\n─────────────\nProfile\nWebhook secrets"]
    end

    DB -->|"GET /api/events"| ACT
    DB -->|"GET /api/drafts"| DRAFTS
    DB -->|"GET /api/drafts (all)"| TS
    DB -->|"GET /api/drafts?status=approved"| INV
    DB -->|"GET /api/projects"| INV
    DB -->|"GET /api/projects"| PROJ
    DB -->|"GET /api/stats\nGET /api/reports/weekly"| DASH
    DB -->|"GET /api/stats\nGET /api/reports/weekly"| REP

    DASH -->|"sidebar nav"| ACT
    DASH -->|"sidebar nav"| DRAFTS
    ACT -->|"events produce"| DRAFTS
    DRAFTS -->|"approve →\ncreates work_log"| TS
    TS -->|"approved entries →\nbillable line items"| INV
    INV -->|"grouped by"| PROJ
    INT -->|"configure GitHub\nwebhook URL"| GH
```

## Data Flow: GitHub Push → Invoice

```mermaid
sequenceDiagram
    participant Dev as Developer
    participant GH as GitHub
    participant CF as Cloudflare Tunnel
    participant API as Express API :4000
    participant Q as BullMQ / Redis
    participant W as Event Worker
    participant Claude as Claude AI
    participant PG as PostgreSQL

    Dev->>GH: git push origin master
    GH->>CF: POST /api/webhooks/github<br/>(X-Hub-Signature-256)
    CF->>API: forward request
    API->>API: verifySignature() + normalizePayload()
    API->>PG: INSERT raw_events
    API->>Q: enqueueEvent(eventId)
    API-->>GH: 202 Accepted

    Q->>W: job dequeued
    W->>Claude: analyzeWork(payload, context)
    Claude-->>W: {task, duration_minutes, confidence, project}
    W->>PG: INSERT drafts (status=pending)
    W->>PG: UPDATE raw_events.processed=true

    Note over PG: Draft now visible in UI

    Dev->>API: POST /api/drafts/:id/approve
    API->>PG: UPDATE drafts SET status=approved
    API->>PG: INSERT work_logs

    Note over PG: Entry appears in Timesheets

    Dev->>API: GET /api/drafts?status=approved
    API-->>Dev: approved entries with duration_minutes
    Note over Dev: Invoice generated client-side<br/>hours × rate = total
```

## Page Dependency Map

```
GitHub ──webhook──► Activity Feed ──generates──► AI Drafts
                                                      │
                                               approve / reject
                                                      │
                                                  Timesheets ──approve week──► Invoices
                                                      │                            │
                                                  work_logs                   project filter
                                                      │                            │
                                                   Reports ◄────────── Projects ◄─┘
                                                      │
                                                  Dashboard (summary of all above)
```

## Tech Stack Quick Reference

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind v4 |
| UI components | shadcn/ui, framer-motion, lucide-react, recharts |
| Backend API | Express 5, TypeScript, ts-node-dev |
| Job queue | BullMQ + Redis 7 |
| Database | PostgreSQL 16 |
| AI analysis | Anthropic Claude (claude-sonnet-4-6) |
| Webhook tunnel | Cloudflare Quick Tunnel (cloudflared.exe) |
| Source control | GitHub (webhook ID 628631078 on GerhardAgile99/TimeBridge) |
