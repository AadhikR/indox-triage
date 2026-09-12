"use client";

import { createContext, useContext } from "react";

export type AppUser = {
  name: string;
  email: string;
  picture?: string | null;
  isDemo: boolean;
};

const AuthStateContext = createContext<AppUser | null>(null);

export function AuthStateProvider({
  children,
  user,
}: Readonly<{ children: React.ReactNode; user: AppUser }>) {
  return <AuthStateContext.Provider value={user}>{children}</AuthStateContext.Provider>;
}

export function useAppUser() {
  const user = useContext(AuthStateContext);

  if (!user) {
    throw new Error("useAppUser must be used inside AuthStateProvider");
  }

  return user;
}
