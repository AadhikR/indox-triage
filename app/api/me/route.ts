import { NextResponse } from "next/server";
import { auth0, auth0Configured } from "@/lib/auth0";

export async function GET() {
  if (!auth0Configured || !auth0) {
    return NextResponse.json({
      authenticated: false,
      mode: "demo",
      user: { name: "Demo User", email: "demo@inboxtriage.local" },
    });
  }

  const session = await auth0.getSession();

  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    mode: "auth0",
    user: {
      name: session.user.name,
      email: session.user.email,
      picture: session.user.picture,
    },
  });
}
