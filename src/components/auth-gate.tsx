"use client";

import { AuthScreen } from "@/components/auth-screen";
import { useWatched } from "@/context/watched-context";
import type { ReactNode } from "react";

export function AuthGate({ children }: { children: ReactNode }) {
  const { ready, user } = useWatched();
  if (!ready) return <div className="min-h-full flex-1" />;
  if (!user) return <AuthScreen />;
  return children;
}
