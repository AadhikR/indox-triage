import { Auth0Client } from "@auth0/nextjs-auth0/server";

const requiredAuth0Variables = [
  process.env.AUTH0_DOMAIN,
  process.env.AUTH0_CLIENT_ID,
  process.env.AUTH0_CLIENT_SECRET,
  process.env.AUTH0_SECRET,
];

export const auth0Configured = requiredAuth0Variables.every(Boolean);

// Keeping this lazy at the module boundary lets the public demo build run without
// placeholder credentials. As soon as all Auth0 values exist, the real SDK owns
// the session and /auth/* routes.
export const auth0 = auth0Configured ? new Auth0Client() : null;
