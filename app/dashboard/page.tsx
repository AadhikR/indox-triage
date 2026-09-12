"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Priority = "Urgent" | "Attention required" | "Moderate" | "Take your time";

type EmailItem = {
  id: number;
  sender: string;
  initials: string;
  subject: string;
  summary: string;
  reason: string;
  action: string;
  deadline: string;
  time: string;
  priority: Priority;
};

const emails: EmailItem[] = [
  { id: 1, sender: "Maya Chen", initials: "MC", subject: "Re: Revised launch proposal", summary: "Maya is waiting for approval on the revised proposal before the Friday launch window closes.", reason: "You committed to replying by tomorrow, and the launch depends on your approval.", action: "Review the final pricing section and approve or request changes.", deadline: "Tomorrow, 10:00 AM", time: "9:42 AM", priority: "Urgent" },
  { id: 2, sender: "Omar Rahman", initials: "OR", subject: "Security review questions", summary: "Three security questions remain unanswered before the vendor review can proceed.", reason: "Omar has followed up twice and is blocked on your response.", action: "Answer the three highlighted questions or delegate them to engineering.", deadline: "Thursday", time: "8:17 AM", priority: "Attention required" },
  { id: 3, sender: "Leila Haddad", initials: "LH", subject: "Ideas for next week’s workshop", summary: "Leila shared a draft agenda and asked for optional feedback before next week.", reason: "Useful to review, but no work is blocked and there is no immediate deadline.", action: "Review when planning next week’s calendar.", deadline: "Next Monday", time: "Yesterday", priority: "Moderate" },
  { id: 4, sender: "Product Weekly", initials: "PW", subject: "Five product launches worth watching", summary: "A weekly newsletter covering product launches and industry news.", reason: "No response or decision is required.", action: "Read whenever you have spare time.", deadline: "None", time: "Yesterday", priority: "Take your time" },
];

const filters: Array<"All" | Priority> = ["All", "Urgent", "Attention required", "Moderate", "Take your time"];

const priorityClass = (priority: Priority) => `priority-${priority.toLowerCase().replaceAll(" ", "-")}`;

export default function Dashboard() {
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const [selectedId, setSelectedId] = useState(emails[0].id);
  const visibleEmails = useMemo(() => filter === "All" ? emails : emails.filter((email) => email.priority === filter), [filter]);
  const selected = emails.find((email) => email.id === selectedId) ?? emails[0];

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <Link className="brand brand-light" href="/"><span className="brand-mark">I</span><span>Indox</span></Link>
        <nav className="sidebar-nav" aria-label="Workspace navigation">
          <button className="nav-item nav-item-active" type="button"><span className="nav-glyph">▣</span> Triage</button>
          <button className="nav-item" type="button"><span className="nav-glyph">✓</span> Handled</button>
          <button className="nav-item" type="button"><span className="nav-glyph">⌁</span> Commitments</button>
        </nav>
        <div className="sidebar-bottom">
          <div className="connection-card"><span className="connection-dot" /><div><strong>Demo inbox</strong><span>Connection comes in Part 3</span></div></div>
          <div className="user-chip"><span className="avatar avatar-user">AK</span><div><strong>Aadhi</strong><span>Hackathon workspace</span></div></div>
        </div>
      </aside>

      <section className="workspace">
        <header className="workspace-header">
          <div><p className="eyebrow">Friday, September 12</p><h1>Your attention, clarified.</h1></div>
          <div className="header-actions"><button className="icon-button" aria-label="Search inbox" type="button">⌕</button><button className="button button-dark" type="button">Analyze inbox</button></div>
        </header>

        <div className="attention-banner">
          <div><span className="banner-number">2</span><div><strong>items need you today</strong><p>One deadline and one blocked teammate.</p></div></div>
          <span className="banner-time">Last analyzed just now</span>
        </div>

        <div className="filter-row" role="group" aria-label="Filter by attention level">
          {filters.map((item) => (
            <button className={filter === item ? "filter-button filter-button-active" : "filter-button"} key={item} onClick={() => setFilter(item)} type="button">
              {item}<span>{item === "All" ? emails.length : emails.filter((email) => email.priority === item).length}</span>
            </button>
          ))}
        </div>

        <div className="triage-grid">
          <section className="email-list" aria-label="Prioritized messages">
            {visibleEmails.map((email) => (
              <button className={selected.id === email.id ? "email-card email-card-selected" : "email-card"} key={email.id} onClick={() => setSelectedId(email.id)} type="button">
                <span className={`priority-rail ${priorityClass(email.priority)}`} />
                <span className="avatar">{email.initials}</span>
                <span className="email-card-content">
                  <span className="email-meta"><strong>{email.sender}</strong><span>{email.time}</span></span>
                  <span className="email-subject">{email.subject}</span>
                  <span className="email-summary">{email.summary}</span>
                  <span className="priority-label">{email.priority}</span>
                </span>
              </button>
            ))}
          </section>

          <aside className="insight-panel" aria-label="Selected email analysis">
            <div className="insight-header"><span className={`large-priority ${priorityClass(selected.priority)}`}>{selected.priority}</span><button className="icon-button icon-button-small" aria-label="More actions" type="button">•••</button></div>
            <p className="insight-kicker">Why this matters</p>
            <h2>{selected.subject}</h2>
            <p className="insight-summary">{selected.summary}</p>
            <div className="insight-section"><span>Reason for priority</span><p>{selected.reason}</p></div>
            <div className="insight-section"><span>Recommended next action</span><p>{selected.action}</p></div>
            <div className="deadline-row"><span>Detected deadline</span><strong>{selected.deadline}</strong></div>
            <button className="button button-primary button-full" type="button">Prepare a reply <span aria-hidden="true">→</span></button>
            <button className="text-button" type="button">Mark as handled</button>
          </aside>
        </div>
      </section>
    </main>
  );
}
