import React, { useMemo, useRef, useState } from "react";
import {
  Activity,
  AlertCircle,
  BarChart3,
  Bell,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  Clock3,
  Database,
  Filter,
  GitBranch,
  LayoutDashboard,
  Mail,
  MessageSquare,
  Search,
  Settings2,
  ShieldAlert,
  Sparkles,
  Target,
  Users,
  X,
} from "lucide-react";
import "./styles.css";

type Priority = "Critical" | "High" | "Medium" | "Low";
type Item = {
  id: number;
  title: string;
  tag: string;
  owner: string;
  priority: Priority;
  score: number;
  due: string;
  source: string;
  status: string;
  impact: string;
  age: string;
  jiraUrl?: string;
};
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";
const defaultItems: Item[] = [
  {
    id: 1,
    title: "INC-1001: Production API Timeout in Payment Service",
    tag: "INCIDENT",
    owner: "Priya Sharma",
    priority: "Critical",
    score: 9.8,
    due: "ASAP",
    source: "Incident feed",
    status: "In progress",
    impact: "Customer payments",
    age: "18m",
  },
  {
    id: 2,
    title: "Data Migration Q3 Customer Records",
    tag: "JIRA",
    owner: "Arjun Patel",
    priority: "Critical",
    score: 9.2,
    due: "Today · 5:00 PM",
    source: "Data team channel",
    status: "Blocked",
    impact: "12 customers",
    age: "42m",
  },
  {
    id: 3,
    title: "Security Audit Findings Review",
    tag: "TEAMS",
    owner: "Priya Sharma",
    priority: "High",
    score: 8.1,
    due: "Tomorrow · 10:00 AM",
    source: "Security-compliance",
    status: "Needs review",
    impact: "12 findings",
    age: "1h",
  },
  {
    id: 8,
    title: "INC-204: Payment reconciliation batch delay",
    tag: "INCIDENT",
    owner: "Vikram Roy",
    priority: "Critical",
    score: 8.9,
    due: "Today · 6:30 PM",
    source: "Incident feed",
    status: "Investigating",
    impact: "Finance operations",
    age: "52m",
  },
  {
    id: 9,
    title: "Teams: Release readiness checklist needs owners",
    tag: "TEAMS",
    owner: "Arjun Patel",
    priority: "High",
    score: 8.3,
    due: "Tomorrow · 2:00 PM",
    source: "#release-planning",
    status: "Needs response",
    impact: "September release",
    age: "1h",
  },
  {
    id: 10,
    title: "Email: Vendor renewal approval required",
    tag: "OUTLOOK",
    owner: "Finance Team",
    priority: "High",
    score: 7.8,
    due: "Today · 7:00 PM",
    source: "Finance inbox",
    status: "Awaiting approval",
    impact: "$180K renewal",
    age: "2h",
  },
  {
    id: 4,
    title: "Q4 Budget Approval Required",
    tag: "OUTLOOK",
    owner: "Finance Team",
    priority: "High",
    score: 7.9,
    due: "Today · 7:00 PM",
    source: "Email",
    status: "Awaiting approval",
    impact: "$2.4M budget",
    age: "2h",
  },
  {
    id: 5,
    title: "Implement caching layer for Redis",
    tag: "JIRA",
    owner: "Vikram Roy",
    priority: "Medium",
    score: 6.7,
    due: "Sep 20",
    source: "Engineering backlog",
    status: "Planned",
    impact: "Performance",
    age: "3h",
  },
  {
    id: 6,
    title: "Review API documentation updates",
    tag: "CONFLUENCE",
    owner: "Neha Kapoor",
    priority: "Medium",
    score: 5.8,
    due: "Sep 21",
    source: "Platform docs",
    status: "In review",
    impact: "Developer enablement",
    age: "4h",
  },
  {
    id: 7,
    title: "KAN-1",
    tag: "JIRA",
    owner: "Unassigned",
    priority: "Critical",
    score: 10,
    due: "No due date",
    source: "Jira · KAN",
    status: "Open",
    impact: "Pinned Jira ticket",
    age: "configured",
    jiraUrl:
      "https://debuggers-1.atlassian.net/jira/software/projects/KAN/boards/1?filter=&groupBy=none&selectedIssue=KAN-1",
  },
];
const members = [
  {
    name: "Priya Sharma",
    role: "Engineering Lead",
    utilization: 88,
    avatar: "PS",
    open: 4,
    risk: "High",
  },
  {
    name: "Arjun Patel",
    role: "Data Engineering",
    utilization: 78,
    avatar: "AP",
    open: 3,
    risk: "Medium",
  },
  {
    name: "Vikram Roy",
    role: "Platform Engineering",
    utilization: 65,
    avatar: "VR",
    open: 2,
    risk: "Low",
  },
  {
    name: "Neha Kapoor",
    role: "Documentation",
    utilization: 48,
    avatar: "NK",
    open: 2,
    risk: "Low",
  },
];
const sources = [
  ["Jira", 3, 30, <GitBranch size={15} />],
  ["Incident Feed", 2, 20, <AlertCircle size={15} />],
  ["Teams", 2, 20, <MessageSquare size={15} />],
  ["Outlook", 2, 20, <Mail size={15} />],
  ["Confluence", 1, 10, <Database size={15} />],
];
const risks = [
  [
    "Payment service incident",
    "Customer-facing API timeout",
    "Critical",
    "Priya Sharma",
  ],
  [
    "Q3 migration validation",
    "Customer records awaiting validation",
    "Critical",
    "Arjun Patel",
  ],
  [
    "Security audit findings",
    "Review required before tomorrow",
    "High",
    "Priya Sharma",
  ],
  [
    "Reconciliation batch delay",
    "Finance batch is 45 minutes behind SLA",
    "High",
    "Vikram Roy",
  ],
  [
    "Release readiness",
    "Two checklist items remain unconfirmed",
    "Medium",
    "Arjun Patel",
  ],
];

type Member = (typeof members)[number];
export default function ExecutiveApp() {
  const [items, setItems] = useState<Item[]>(defaultItems);
  const [tab, setTab] = useState<"personal" | "team" | "trace">("personal");
  const [query, setQuery] = useState("");
  const [insight, setInsight] = useState("critical");
  const [selected, setSelected] = useState<Item | null>(null);
  const [member, setMember] = useState<Member | null>(null);
  const [toast, setToast] = useState("");
  const [jiraLoading, setJiraLoading] = useState(false);
  const [jiraCreateLoading, setJiraCreateLoading] = useState(false);
  const [managerFocus, setManagerFocus] = useState<"priorities" | "members" | "today">("priorities");
  const [managerSummaryFilter, setManagerSummaryFilter] = useState<"all" | "critical" | "high" | "medium" | "low">("all");
  const managerPrioritiesRef = useRef<HTMLElement | null>(null);
  const teamMembersRef = useRef<HTMLElement | null>(null);
  const filtered = useMemo(
    () =>
      items.filter((item) =>
        `${item.title} ${item.owner} ${item.tag}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [query],
  );
  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
  };
  const focusManagerSection = (section: "priorities" | "members" | "today") => setManagerFocus(section);
  const switchTab = (nextTab: "personal" | "team" | "trace") => {
    setTab(nextTab);
    setSelected(null);
    setMember(null);
    setManagerFocus("priorities");
    setManagerSummaryFilter("all");
  };
  const importJira = async () => {
    setJiraLoading(true);
    try {
      const response = await fetch(`${API_BASE}/integrations/jira/import`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jira_url: "https://debuggers-1.atlassian.net",
          project_key: "KAN",
          max_results: 50,
        }),
      });
      if (!response.ok) throw new Error("Jira import failed");
      const payload = await response.json();
      const imported: Item[] = (payload.items || []).map(
        (entry: any, index: number) => {
          const score = Number(entry.priority?.score || 0) / 10;
          const priority: Priority =
            score >= 9 ? "Critical" : score >= 7.5 ? "High" : "Medium";
          return {
            id: Number(`${Date.now()}${index}`),
            title: `${entry.id}: ${entry.title}`,
            tag: "JIRA",
            owner: "Unassigned",
            priority,
            score,
            due: "No due date",
            source: "Jira · KAN",
            status: entry.status || "Open",
            impact: entry.priority?.rationale || "Imported from Jira",
            age: "just now",
          };
        },
      );
      setItems((current) => [
        ...imported,
        ...current.filter(
          (item) =>
            !imported.some((issue) => issue.title.startsWith(`${issue.id}:`)),
        ),
      ]);
      notify(
        imported.length
          ? `${imported.length} Jira issue${imported.length === 1 ? "" : "s"} added to My Priority`
          : "No public Jira issues found",
      );
    } catch {
      notify("Jira import failed. Check that the project is publicly visible.");
    } finally {
      setJiraLoading(false);
    }
  };
  const createJiraTickets = async () => {
    setJiraCreateLoading(true);
    try {
      const response = await fetch(`${API_BASE}/integrations/jira/issues`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jira_url: "https://debuggers-1.atlassian.net",
          project_key: "KAN",
          tickets: [
            {
              summary: "Fix payment timeout",
              description:
                "Investigate and resolve the payment service timeout affecting production transactions.",
              priority: "Highest",
            },
            {
              summary: "Add Redis caching metric",
              description:
                "Add observability metrics for Redis cache hit rate, misses, latency, and evictions.",
              priority: "High",
            },
          ],
        }),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || "Jira ticket creation failed");
      }
      const payload = await response.json();
      const created: Item[] = (payload.items || []).map(
        (ticket: any, index: number) => ({
          id: Number(`${Date.now()}${index}`),
          title: `${ticket.key}: ${ticket.summary}`,
          tag: "JIRA",
          owner: "Unassigned",
          priority: ticket.priority === "Highest" ? "Critical" : "High",
          score: ticket.priority === "Highest" ? 10 : 8.5,
          due: "No due date",
          source: "Jira · KAN",
          status: "Open",
          impact: "Created from priority action",
          age: "just now",
          jiraUrl: ticket.url,
        }),
      );
      setItems((current) => [...created, ...current]);
      notify(
        `${created.length} Jira ticket${created.length === 1 ? "" : "s"} created`,
      );
    } catch (error) {
      notify(
        error instanceof Error ? error.message : "Jira ticket creation failed",
      );
    } finally {
      setJiraCreateLoading(false);
    }
  };
  const critical = items.filter((item) => item.priority === "Critical");
  const high = items.filter((item) => item.priority === "High");
  const incidentTickets = critical.filter((item) => item.tag === "INCIDENT");
  const communicationHigh = high.filter((item) => item.tag === "OUTLOOK" || item.tag === "TEAMS");
  const today = items.filter(
    (item) => item.due.includes("Today") || item.due === "ASAP",
  );
  const rows =
    insight === "today"
      ? today
      : insight === "high"
        ? communicationHigh
        : insight === "score"
          ? items.slice(0, 4)
          : incidentTickets;
  const managerPriorityRows = items.slice().sort((left, right) => right.score - left.score);
  const visibleManagerRows = managerSummaryFilter === "all"
    ? managerPriorityRows
    : managerPriorityRows.filter((item) => item.priority.toLowerCase() === managerSummaryFilter);
  const avg = (
    items.reduce((sum, item) => sum + item.score, 0) / items.length
  ).toFixed(1);
  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">
            <Target size={19} />
          </div>
          <div>
            <div className="brand-title">NEXUS</div>
            <div className="brand-sub">Executive Work Intelligence</div>
          </div>
        </div>
        <div className="top-actions">
          <div className="search">
            <Search size={17} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search work, people, teams..."
            />
          </div>
          <button
            className="icon-btn"
            onClick={() => notify("No new priority alerts")}
            title="Notifications"
          >
            <Bell size={18} />
            <span className="notif-dot" />
          </button>
          <button
            className="icon-btn"
            onClick={() => notify("Dashboard settings opened")}
            title="Settings"
          >
            <Settings2 size={18} />
          </button>
          <div className="profile">
            <div className="profile-avatar">PS</div>
            <div className="profile-text">
              <b>Priya Sharma</b>
              <span>Engineering · Platform</span>
            </div>
            <ChevronDown size={15} />
          </div>
        </div>
      </header>
      <main className="content">
        {" "}
        <div className="page-heading">
          <div>
            <div className="eyebrow">
              <Sparkles size={14} /> PRIORITY OPERATIONS
            </div>
            <h1>Work Priority Dashboard</h1>
            <p>
              One view of what needs attention, why it matters, and what happens
              next.
            </p>
          </div>
          <div className="heading-actions">
            <button className="secondary-btn">
              <CalendarClock size={16} /> Today <ChevronDown size={14} />
            </button>
          </div>
        </div>
        <nav className="tabs">
          <button
            className={tab === "personal" ? "active" : ""}
            onClick={() => switchTab("personal")}
          >
            <LayoutDashboard size={16} /> My Priority
          </button>
          <button
            className={tab === "team" ? "active" : ""}
            onClick={() => switchTab("team")}
          >
            <Users size={16} /> Manager View
          </button>
          <button
            className={tab === "trace" ? "active" : ""}
            onClick={() => switchTab("trace")}
          >
            <BarChart3 size={16} /> Actions &amp; Traceability
          </button>
        </nav>
        {tab === "trace" ? (
          <Traceability rows={filtered} onSelect={setSelected} />
        ) : (
          <>
            <section className="kpis">
              <Kpi
                icon={<AlertCircle />}
                label={tab === "team" ? "Team Members" : "Critical Items"}
                value={tab === "team" ? members.length : incidentTickets.length}
                sub={
                  tab === "team"
                    ? "Review workload and capacity"
                    : "Require immediate attention"
                }
                tone="red"
                onClick={() => tab === "team" ? focusManagerSection("members") : setInsight("critical")}
              />
              <Kpi
                icon={<ShieldAlert />}
                label={tab === "team" ? "Top Team Priorities" : "High Priority"}
                value={tab === "team" ? managerPriorityRows.length : communicationHigh.length}
                sub={tab === "team" ? "Ranked by urgency and impact" : "Require attention today"}
                tone="amber"
                onClick={() => tab === "team" ? focusManagerSection("priorities") : setInsight("high")}
              />
              <Kpi
                icon={<Clock3 />}
                label="Today's Actions"
                value={today.length}
                sub="Due today or ASAP"
                tone="blue"
                onClick={() => tab === "team" ? focusManagerSection("today") : setInsight("today")}
              />
              <Kpi
                icon={<BarChart3 />}
                label="Avg Priority Score"
                value={`${avg}/10`}
                sub="Confidence in ranking"
                tone="green"
                onClick={() => tab === "team" ? focusManagerSection("priorities") : setInsight("score")}
              />
            </section>
            {tab === "personal" ? (
              <InsightPanel
                rows={rows}
                onSelect={setSelected}
                description={
                  insight === "high"
                      ? "Top signals with owner, deadline, status, and impact."
                    : insight === "critical"
                      ? "High-impact work with owner, deadline, status, and impact."
                      : undefined
                }
                title={
                  insight === "today"
                    ? "Actions due today"
                    : insight === "high"
                      ? "High-priority delivery signals"
                      : insight === "score"
                        ? "Portfolio priority health"
                        : "Critical work requiring immediate attention"
                }
              />
            ) : (
              <>
                <div className={`manager-view-stack focus-${managerFocus}`}>
                <section className="panel manager-priority-panel" ref={managerPrioritiesRef}>
                  <div className="panel-head">
                    <div>
                      <h2>Top Team Priorities</h2>
                      <span>This week, ranked by urgency and impact</span>
                    </div>
                    <span className="mini-total">{items.length} items</span>
                  </div>
                  <div className="priority-summary-grid">
                    <button type="button" aria-pressed={managerSummaryFilter === "all"} className={`priority-summary-card all-summary ${managerSummaryFilter === "all" ? "summary-selected" : ""}`} onClick={() => setManagerSummaryFilter("all")}>
                      <span>All</span>
                      <strong>{managerPriorityRows.length}</strong>
                      <small>All team priorities</small>
                    </button>
                    <button type="button" aria-pressed={managerSummaryFilter === "critical"} className={`priority-summary-card critical-summary ${managerSummaryFilter === "critical" ? "summary-selected" : ""}`} onClick={() => setManagerSummaryFilter("critical")}>
                      <span>Critical</span>
                      <strong>{critical.length}</strong>
                      <small>Immediate attention</small>
                    </button>
                    <button type="button" aria-pressed={managerSummaryFilter === "high"} className={`priority-summary-card high-summary ${managerSummaryFilter === "high" ? "summary-selected" : ""}`} onClick={() => setManagerSummaryFilter("high")}>
                      <span>High Priority</span>
                      <strong>{high.length}</strong>
                      <small>Needs attention</small>
                    </button>
                    <button type="button" aria-pressed={managerSummaryFilter === "medium"} className={`priority-summary-card medium-summary ${managerSummaryFilter === "medium" ? "summary-selected" : ""}`} onClick={() => setManagerSummaryFilter("medium")}>
                      <span>Medium</span>
                      <strong>{items.filter((item) => item.priority === "Medium").length}</strong>
                      <small>Planned delivery work</small>
                    </button>
                    <button type="button" aria-pressed={managerSummaryFilter === "low"} className={`priority-summary-card low-summary ${managerSummaryFilter === "low" ? "summary-selected" : ""}`} onClick={() => setManagerSummaryFilter("low")}>
                      <span>Low</span>
                      <strong>{items.filter((item) => item.priority === "Low").length}</strong>
                      <small>Lower urgency</small>
                    </button>
                  </div>
                  {visibleManagerRows
                    .slice(0, 5)
                    .map((item, index) => (
                      <button className="priority-row" key={item.id} onClick={() => setSelected(item)}>
                        <span className="priority-rank">{String(index + 1).padStart(2, "0")}</span>
                        <span className={`priority-marker ${item.priority.toLowerCase()}`} />
                        <span className="priority-copy">
                          <b>{item.title}</b>
                          <small>{item.owner} · {item.source}</small>
                        </span>
                        <strong>{item.score}</strong>
                        <ChevronDown size={15} />
                      </button>
                    ))}
                </section>
                <section className="panel manager-today-panel">
                  <div className="panel-head">
                    <div>
                      <h2>Today's Actions</h2>
                      <span>Work requiring attention today</span>
                    </div>
                    <span className="mini-total">{today.length} items</span>
                  </div>
                  {today.map((item, index) => (
                    <button className="priority-row" key={item.id} onClick={() => setSelected(item)}>
                      <span className="priority-rank">{String(index + 1).padStart(2, "0")}</span>
                      <span className={`priority-marker ${item.priority.toLowerCase()}`} />
                      <span className="priority-copy">
                        <b>{item.title}</b>
                        <small>{item.owner} · {item.due}</small>
                      </span>
                      <strong>{item.score}</strong>
                      <ChevronDown size={15} />
                    </button>
                  ))}
                </section>
                <section className="panel team-members-panel" ref={teamMembersRef}>
                  <div className="panel-head">
                    <div>
                      <h2>Team Member Dashboard</h2>
                      <span>Click an employee to review their workload</span>
                    </div>
                    <span className="mini-total">{members.length} people</span>
                  </div>
                  {members.map((person) => (
                    <button
                      className="team-row"
                      key={person.name}
                      onClick={() => setMember(person)}
                    >
                      <div className="team-avatar">{person.avatar}</div>
                      <div className="team-info">
                        <b>{person.name}</b>
                        <span>{person.role}</span>
                      </div>
                      <div className="open-work">
                        <b>{person.open}</b>
                        <span>open</span>
                      </div>
                      <div className="util">
                        <div className="util-label">
                          <span>Workload</span>
                          <b>{person.utilization}%</b>
                        </div>
                        <div className="bar">
                          <i style={{ width: `${person.utilization}%` }} />
                        </div>
                      </div>
                      <span
                        className={`risk-chip ${person.risk.toLowerCase()}`}
                      >
                        {person.risk}
                      </span>
                      <ChevronDown size={15} />
                    </button>
                  ))}
                </section>
                </div>
                <div className="manager-insight-grid">
                  <SourceDistribution />
                  <TeamRisks />
                </div>
              </>
            )}
          </>
        )}
      </main>
      {selected && (
        <DetailDrawer
          item={selected}
          onClose={() => setSelected(null)}
          onComplete={() => {
            setSelected(null);
            notify("Action marked complete");
          }}
        />
      )}{" "}
      {member && (
        <MemberDrawer person={member} onClose={() => setMember(null)} />
      )}{" "}
      {toast && (
        <div className="toast">
          <CheckCircle2 size={17} />
          {toast}
        </div>
      )}
      <footer>
        Priority signals are explainable and traceable · Sources: Incident Feed,
        Jira, Teams, Outlook, Confluence
      </footer>
    </div>
  );
}
function Kpi({
  icon,
  label,
  value,
  sub,
  tone,
  onClick,
}: {
  icon: JSX.Element;
  label: string;
  value: string | number;
  sub: string;
  tone: string;
  onClick: () => void;
}) {
  return (
    <button className={`kpi ${tone}`} onClick={onClick}>
      <div className="kpi-icon">{icon}</div>
      <div className="kpi-copy">
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{sub}</small>
      </div>
    </button>
  );
}
function InsightPanel({
  title,
  rows,
  onSelect,
  description,
}: {
  title: string;
  rows: Item[];
  onSelect: (item: Item) => void;
  description?: string;
}) {
  return (
    <section className="panel insight-panel">
      <div className="insight-head">
        <div>
          <span className="eyebrow">PRIORITY REVIEW</span>
          <h2>{title}</h2>
          <p>{description || `${rows.length} items are currently active. Review the highest-impact signals and confirm ownership or mitigation.`}</p>
        </div>
        <div className="insight-count">
          {rows.length}
          <span>items</span>
        </div>
      </div>
      <div className="insight-list">
        {rows.map((item) => (
          <button
            className="insight-row"
            key={item.id}
            onClick={() => onSelect(item)}
          >
            <div className={`insight-dot ${item.priority.toLowerCase()}`} />
            <div>
              <b>{item.title}</b>
              <span>
                Owner: {item.owner} · Source: {item.source} · {item.age} ago
              </span>
            </div>
            <strong>{item.score}</strong>
            <ChevronDown size={15} />
          </button>
        ))}
      </div>
    </section>
  );
}
function SourceDistribution() {
  return (
    <section className="panel">
      <div className="panel-head">
        <div>
          <h2>Work Distribution by Sources</h2>
          <span>Where the team's active work is coming from</span>
        </div>
        <span className="mini-total">10 items</span>
      </div>
      <div className="source-content">
        {sources.map(([name, count, percent, icon]) => (
          <div className="source-row" key={String(name)}>
            <div className="source-icon">{icon}</div>
            <div className="source-name">
              <b>{name}</b>
              <span>{count} active items</span>
            </div>
            <div className="source-bar">
              <i style={{ width: `${percent}%` }} />
            </div>
            <strong>{percent}%</strong>
          </div>
        ))}
      </div>
    </section>
  );
}
function TeamRisks() {
  return (
    <section className="panel">
      <div className="panel-head">
        <div>
          <h2>Team Risks &amp; Blockers</h2>
          <span>Signals that may affect delivery</span>
        </div>
        <span className="mini-total danger">5 open</span>
      </div>
      <div className="risk-list">
        {risks.map(([title, detail, level, owner]) => (
          <div className="risk-row" key={title}>
            <div className={`risk-marker ${String(level).toLowerCase()}`} />
            <div className="risk-main">
              <b>{title}</b>
              <span>{detail}</span>
              <small>Owner · {owner}</small>
            </div>
            <span className={`risk-chip ${String(level).toLowerCase()}`}>
              {level}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
function Traceability({
  rows,
  onSelect,
}: {
  rows: Item[];
  onSelect: (item: Item) => void;
}) {
  return (
    <section className="trace-grid">
      <section className="panel">
        <div className="panel-head">
          <div>
            <h2>Action Items &amp; Traceability</h2>
            <span>Every priority can be traced back to its source signal.</span>
          </div>
          <button className="filter-btn">
            <Filter size={15} /> All Sources <ChevronDown size={14} />
          </button>
        </div>
        {rows.map((item) => (
          <button
            className="trace-row"
            key={item.id}
            onClick={() => onSelect(item)}
          >
            <div className={`trace-status ${item.priority.toLowerCase()}`} />
            <div className="trace-main">
              <b>{item.title}</b>
              <span>
                Source: {item.source} · Owner: {item.owner}
              </span>
            </div>
            <div className="trace-confidence">
              <span>Confidence</span>
              <b>{Math.round(item.score * 9.8)}%</b>
            </div>
            <div className="trace-action">{item.due}</div>
          </button>
        ))}
      </section>
      <section className="panel audit">
        <div className="panel-head">
          <div>
            <h2>Audit Trail</h2>
            <span>Recent priority decisions</span>
          </div>
        </div>
        {[
          "Priority ranking updated",
          "Data signal received",
          "Team workload recalculated",
          "New action created",
        ].map((text, index) => (
          <div className="audit-row" key={text}>
            <time>{`09:${45 - index * 3} AM`}</time>
            <div>
              <b>{text}</b>
              <span>Priority decision recorded in the activity log</span>
            </div>
          </div>
        ))}
      </section>
    </section>
  );
}
function DetailDrawer({
  item,
  onClose,
  onComplete,
}: {
  item: Item;
  onClose: () => void;
  onComplete: () => void;
}) {
  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <aside className="drawer" onClick={(event) => event.stopPropagation()}>
        <div className="drawer-head">
          <div>
            <span className={`tag ${item.tag.toLowerCase()}`}>{item.tag}</span>
            <h2>{item.title}</h2>
          </div>
          <button className="icon-btn drawer-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="drawer-score">
          <div>
            <span>Priority score</span>
            <strong>{item.score}/10</strong>
          </div>
          <b className={`priority-pill ${item.priority.toLowerCase()}`}>
            {item.priority}
          </b>
        </div>
        <div className="detail-grid">
          <Detail label="Owner" value={item.owner} />
          <Detail label="Due" value={item.due} />
          <Detail label="Status" value={item.status} />
          <Detail label="Business impact" value={item.impact} />
        </div>
        <div className="why">
          <h3>Why this is prioritized</h3>
          <p>
            The ranking combines business impact, urgency, dependency signals,
            and source confidence. This item has a strong customer or delivery
            consequence and a time-sensitive due signal.
          </p>
        </div>
        <div className="source-box">
          <CircleHelp size={17} />
          <div>
            <b>Traceable source</b>
            <span>
              {item.source} · Signal received {item.age} ago
            </span>
            {item.jiraUrl && (
              <a href={item.jiraUrl} target="_blank" rel="noreferrer">
                Open KAN-1 in Jira
              </a>
            )}
          </div>
        </div>
        <div className="drawer-actions">
          <button className="secondary-btn" onClick={onClose}>
            Keep open
          </button>
          <button className="primary-btn" onClick={onComplete}>
            <CheckCircle2 size={16} /> Mark complete
          </button>
        </div>
      </aside>
    </div>
  );
}
function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span>{label}</span>
      <b>{value}</b>
    </div>
  );
}
function MemberDrawer({
  person,
  onClose,
}: {
  person: Member;
  onClose: () => void;
}) {
  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <aside className="drawer" onClick={(event) => event.stopPropagation()}>
        <div className="drawer-head">
          <div>
            <div className="team-avatar drawer-avatar">{person.avatar}</div>
            <h2>{person.name}</h2>
            <span className="member-role">{person.role}</span>
          </div>
          <button className="icon-btn drawer-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="member-summary">
          <div>
            <span>Open work</span>
            <strong>{person.open}</strong>
          </div>
          <div>
            <span>Utilization</span>
            <strong>{person.utilization}%</strong>
          </div>
          <div>
            <span>Risk</span>
            <strong>{person.risk}</strong>
          </div>
        </div>
        <div className="why">
          <h3>Workload overview</h3>
          <p>
            {person.name} currently has {person.open} open priority items and is
            operating at {person.utilization}% workload utilization.
          </p>
        </div>
      </aside>
    </div>
  );
}
