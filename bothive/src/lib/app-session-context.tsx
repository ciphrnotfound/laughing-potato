"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { supabase } from "@/lib/supabase";

interface SessionProfile {
  id?: string;
  email?: string;
  fullName?: string;
  avatarUrl?: string;
}

interface SessionState {
  isAuthenticated: boolean;
  profile: SessionProfile | null;
  loading: boolean;
}

const AppSessionContext = createContext<SessionState | undefined>(undefined);

interface AppSessionProviderProps {
  children: ReactNode;
}

export function AppSessionProvider({ children }: AppSessionProviderProps) {
  const [profile, setProfile] = useState<SessionProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const resolveSession = async () => {
      setLoading(true);
      const { data: sessionResult } = await supabase.auth.getSession();
      const session = sessionResult?.session ?? null;

      if (!isMounted) {
        return;
      }

      if (session?.user) {
        const { user } = session;
        setProfile({
          id: user.id,
          email: user.email ?? undefined,
          fullName: user.user_metadata?.full_name ?? undefined,
          avatarUrl: user.user_metadata?.avatar_url ?? undefined,
        });
      } else {
        setProfile(null);
      }

      setLoading(false);
    };

    void resolveSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!isMounted) {
        return;
      }

      if (newSession?.user) {
        const { user } = newSession;
        setProfile({
          id: user.id,
          email: user.email ?? undefined,
          fullName: user.user_metadata?.full_name ?? undefined,
          avatarUrl: user.user_metadata?.avatar_url ?? undefined,
        });
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<SessionState>(
    () => ({
      isAuthenticated: Boolean(profile?.id),
      profile,
      loading,
    }),
    [profile, loading]
  );

  return <AppSessionContext.Provider value={value}>{children}</AppSessionContext.Provider>;
}

export function useAppSession() {
  const context = useContext(AppSessionContext);
  if (context === undefined) {
    throw new Error("useAppSession must be used within an AppSessionProvider");
  }
  return context;
}
