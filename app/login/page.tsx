import Link from "next/link";
import { redirect } from "next/navigation";
import { auth0, auth0Configured } from "@/lib/auth0";

export default async function LoginPage() {
  if (auth0Configured && auth0) {
    const session = await auth0.getSession();

    if (session) {
      redirect("/dashboard");
    }
  }

  return (
    <main className="login-shell">
      <section className="login-card">
        <Link className="brand" href="/">
          <span className="brand-mark">I</span>
          <span>Indox</span>
        </Link>

        <div className="login-copy">
          <p className="eyebrow">Secure account access</p>
          <h1>Bring clarity to your inbox.</h1>
          <p>
            Sign in to connect your workspace. Gmail access is requested separately,
            so identity and mailbox permissions stay explicit.
          </p>
        </div>

        {auth0Configured ? (
          <>
            <a className="button button-primary button-full" href="/auth/login?returnTo=/dashboard">
              Continue with Auth0 <span aria-hidden="true">→</span>
            </a>
            <p className="login-footnote">Protected by Auth0 Universal Login.</p>
          </>
        ) : (
          <div className="setup-panel">
            <span className="setup-label">Developer preview</span>
            <p>
              Add the four Auth0 values from <code>.env.example</code> to <code>.env.local</code>
              to activate secure login.
            </p>
            <Link className="button button-primary button-full" href="/dashboard">
              Continue with sample inbox
            </Link>
          </div>
        )}

        <Link className="login-back" href="/">← Back to overview</Link>
      </section>

      <aside className="login-context" aria-label="Security approach">
        <span className="context-number">01</span>
        <h2>Your login is separate from your mailbox.</h2>
        <p>
          Auth0 establishes who you are. Gmail authorization later controls exactly
          which email data Indox can access.
        </p>
        <div className="context-divider" />
        <span className="context-number">02</span>
        <h2>You approve every outward action.</h2>
        <p>Indox can prepare a reply, but it cannot send one without your confirmation.</p>
      </aside>
    </main>
  );
}
