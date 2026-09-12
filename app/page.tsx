import Link from "next/link";

const priorities = [
  { label: "Urgent", color: "#dc4b3e", count: 2 },
  { label: "Attention required", color: "#e79a2f", count: 4 },
  { label: "Moderate", color: "#4876c7", count: 7 },
  { label: "Take your time", color: "#7e8a96", count: 18 },
];

export default function Home() {
  return (
    <main className="landing-shell">
      <nav className="landing-nav" aria-label="Primary navigation">
        <Link className="brand" href="/">
          <span className="brand-mark">I</span>
          <span>Indox</span>
        </Link>
        <div className="landing-nav-actions">
          <Link className="button button-secondary" href="/dashboard">View demo</Link>
          <Link className="button button-dark" href="/login">Sign in</Link>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Your inbox, ranked by consequence</p>
          <h1>Know what needs you before it becomes urgent.</h1>
          <p className="hero-description">
            Indox reads the conversation behind each email, finds commitments and deadlines,
            and gives you the next action—not another pile of summaries.
          </p>
          <div className="hero-actions">
            <Link className="button button-primary" href="/login">
              Get started securely <span aria-hidden="true">→</span>
            </Link>
            <span className="privacy-note">Nothing is sent without your approval.</span>
          </div>
        </div>

        <div className="signal-card" aria-label="Inbox attention overview">
          <div className="signal-card-header">
            <span>Today’s attention</span>
            <span className="live-pill">Sample inbox</span>
          </div>
          <div className="priority-stack">
            {priorities.map((priority) => (
              <div className="priority-row" key={priority.label}>
                <span className="priority-dot" style={{ backgroundColor: priority.color }} />
                <span>{priority.label}</span>
                <strong>{priority.count}</strong>
              </div>
            ))}
          </div>
          <div className="signal-summary">
            <span className="signal-icon">!</span>
            <div>
              <strong>Proposal approval is due tomorrow</strong>
              <p>You promised a response in the existing thread.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="principles" aria-label="Product principles">
        <div><span>01</span><strong>Thread-aware</strong><p>Understands the history, not just the newest message.</p></div>
        <div><span>02</span><strong>Action-oriented</strong><p>Surfaces the decision, deadline, and next step.</p></div>
        <div><span>03</span><strong>Human-controlled</strong><p>Drafts actions while keeping approval with you.</p></div>
      </section>
    </main>
  );
}
