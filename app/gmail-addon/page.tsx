import Link from "next/link";

const steps = [
  "Create a project in Google Apps Script.",
  "Enable the appsscript.json manifest in Project Settings.",
  "Add the Inbox Triage manifest and Code.gs from the repository.",
  "Create a Google Workspace Add-on test deployment.",
  "Open an email in Gmail and select the Inbox Triage sidebar icon.",
];

export default function GmailAddonPage() {
  return (
    <main className="addon-setup-shell">
      <nav className="addon-setup-nav">
        <Link className="brand" href="/">
          <span className="brand-mark">IT</span>
          <span>Inbox Triage</span>
        </Link>
        <Link className="button button-secondary" href="/dashboard">Back to dashboard</Link>
      </nav>

      <section className="addon-setup-grid">
        <div>
          <p className="eyebrow">Gmail-native agent</p>
          <h1>Put Inbox Triage where the email already lives.</h1>
          <p className="addon-lede">
            The Workspace Add-on opens in Gmail’s right panel and receives temporary,
            scoped access to the thread currently on screen.
          </p>
          <div className="scope-note">
            <strong>Current-thread access only</strong>
            <span>The add-on does not need to scrape or modify Gmail’s interface.</span>
          </div>
        </div>

        <section className="installation-card">
          <span className="installation-label">Test installation</span>
          <ol>
            {steps.map((step, index) => (
              <li key={step}><span>{String(index + 1).padStart(2, "0")}</span><p>{step}</p></li>
            ))}
          </ol>
          <a className="button button-primary button-full" href="https://script.google.com/" target="_blank" rel="noreferrer">
            Open Google Apps Script <span aria-hidden="true">↗</span>
          </a>
          <p className="installation-footnote">The exact source files are in the repository’s <code>gmail-addon</code> folder.</p>
        </section>
      </section>
    </main>
  );
}
