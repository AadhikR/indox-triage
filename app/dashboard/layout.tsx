import { redirect } from "next/navigation";
import { AuthStateProvider, type AppUser } from "@/components/auth-state";
import { auth0, auth0Configured } from "@/lib/auth0";

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  let user: AppUser = {
    name: "Demo User",
    email: "demo@inboxtriage.local",
    isDemo: true,
  };

  if (auth0Configured && auth0) {
    const session = await auth0.getSession();

    if (!session) {
      redirect("/auth/login?returnTo=/dashboard");
    }

    user = {
      name: session.user.name ?? session.user.nickname ?? "Inbox Triage user",
      email: session.user.email ?? "Authenticated with Auth0",
      picture: session.user.picture,
      isDemo: false,
    };
  }

  return <AuthStateProvider user={user}>{children}</AuthStateProvider>;
}
