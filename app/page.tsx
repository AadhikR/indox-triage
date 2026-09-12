import Link from "next/link";

const inboxRows = [
  { sender: "Maya Chen", subject: "Re: Revised launch proposal", time: "9:42 AM", tone: "urgent" },
  { sender: "Omar Rahman", subject: "Security review questions", time: "8:17 AM", tone: "response" },
  { sender: "Product Weekly", subject: "Five launches worth watching", time: "Yesterday", tone: "fyi" },
];

export default function Home() {
  return (
    <main className="landing-shell landing-v2">
      <nav className="landing-nav" aria-label="Primary navigation">
        <Link className="brand" href="/">
          <span className="brand-mark">IT</span>
          <span>Inbox Triage</span>
        </Link>
        <span className="nav-context">AI that works inside Gmail</span>
        <div className="landing-nav-actions">
          <Link className="button button-secondary" href="/dashboard">View demo</Link>
          <Link className="button button-dark" href="/login">Sign in</Link>
        </div>
      </nav>

      <section className="landing-hero">
        <div className="hero-orb hero-orb-one" />
        <div className="hero-orb hero-orb-two" />
        <div className="landing-hero-copy">
          <span className="announcement-pill"><span /> Gmail-native attention agent</span>
          <h1>Your inbox.<br /><em>Now it knows what matters.</em></h1>
          <p>
            Inbox Triage understands the entire conversation, detects what needs you,
            and prepares the next move—without making you leave Gmail.
          </p>
          <div className="landing-hero-actions">
            <Link className="button button-primary button-large" href="/login">
              Try Inbox Triage <span aria-hidden="true">→</span>
            </Link>
            <Link className="product-link" href="/gmail-addon">See how it works <span aria-hidden="true">›</span></Link>
          </div>
          <div className="trust-row" aria-label="Product safeguards">
            <span><i>✓</i> Current thread only</span>
            <span><i>✓</i> You approve every reply</span>
            <span><i>✓</i> No inbox scraping</span>
          </div>
        </div>

        <div className="product-stage" aria-label="Inbox Triage running inside Gmail">
          <div className="product-window">
            <div className="product-window-bar">
              <div className="window-dots"><span /><span /><span /></div>
              <div className="gmail-wordmark"><span className="mail-glyph">M</span> Gmail</div>
              <div className="window-search">Search mail</div>
              <div className="window-avatar">AR</div>
            </div>
            <div className="product-body">
              <div className="mail-rail">
                <button type="button">＋ Compose</button>
                <span className="mail-rail-active">▰ <b>Inbox</b><small>31</small></span>
                <span>☆ Starred</span>
                <span>◷ Snoozed</span>
                <span>➤ Sent</span>
              </div>
              <div className="inbox-preview">
                <div className="inbox-toolbar"><span>☰</span><strong>Primary</strong><span>↻</span></div>
                {inboxRows.map((email, index) => (
                  <div className={index === 0 ? "inbox-row inbox-row-selected" : "inbox-row"} key={email.subject}>
                    <span className={`attention-pin attention-pin-${email.tone}`} />
                    <span>☆</span>
                    <strong>{email.sender}</strong>
                    <p>{email.subject}</p>
                    <time>{email.time}</time>
                  </div>
                ))}
                <div className="open-email">
                  <span className="open-email-back">←</span>
                  <div>
                    <strong>Re: Revised launch proposal</strong>
                    <p>Hi Aadhik, can you approve the final pricing before tomorrow at 10 AM?</p>
                  </div>
                </div>
              </div>
              <aside className="gmail-agent-panel">
                <div className="agent-panel-head">
                  <span className="brand-mark">IT</span>
                  <div><strong>Inbox Triage</strong><small>8 messages understood</small></div>
                  <span className="panel-close">×</span>
                </div>
                <div className="priority-badge"><span /> Urgent</div>
                <h2>Your approval is blocking tomorrow’s launch.</h2>
                <p>Maya needs the final pricing approved before 10 AM tomorrow.</p>
                <div className="agent-fact"><span>Why this matters</span><strong>You committed to deciding in this thread.</strong></div>
                <div className="agent-fact"><span>Detected deadline</span><strong className="deadline-text">Tomorrow · 10:00 AM</strong></div>
                <button className="draft-button" type="button">Draft reply <span>→</span></button>
                <small className="approval-note">Opens an editable Gmail draft. Never auto-sends.</small>
              </aside>
            </div>
          </div>
          <div className="floating-signal floating-signal-left"><span>✓</span><div><strong>Thread understood</strong><small>8 messages · 2 commitments</small></div></div>
          <div className="floating-signal floating-signal-right"><span>✦</span><div><strong>Reply ready</strong><small>Waiting for your approval</small></div></div>
        </div>
      </section>

      <section className="value-section">
        <div className="section-heading">
          <p className="eyebrow">Built for the moment of decision</p>
          <h2>Less inbox. More clarity.</h2>
        </div>
        <div className="value-grid">
          <article className="value-card value-card-dark">
            <span className="value-index">01</span>
            <div className="mini-priorities"><span className="mini-urgent">Urgent</span><span>Needs response</span><span>FYI</span><span>Can wait</span></div>
            <div><h3>Attention, not anxiety.</h3><p>Four consequence-based levels replace the endless unread count.</p></div>
          </article>
          <article className="value-card value-card-blue">
            <span className="value-index">02</span>
            <div className="thread-visual"><span>Message 1</span><i /><span>Message 4</span><i /><strong>Context</strong></div>
            <div><h3>The whole thread matters.</h3><p>Deadlines, decisions, and promises survive long conversations.</p></div>
          </article>
          <article className="value-card value-card-light">
            <span className="value-index">03</span>
            <div className="reply-visual"><span>Draft reply</span><p>Thanks Maya — I’ve reviewed the final pricing…</p><button type="button">Review in Gmail</button></div>
            <div><h3>Action without autopilot.</h3><p>AI prepares the reply. You stay in control of every word and every send.</p></div>
          </article>
        </div>
      </section>

      <section className="landing-cta">
        <span className="brand-mark">IT</span>
        <h2>Your most important email<br />should feel impossible to miss.</h2>
        <Link className="button button-primary button-large" href="/login">Bring clarity to Gmail <span>→</span></Link>
      </section>
    </main>
  );
}
