"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

interface SessionProfile {
  id?: string;
  email?: string;
  fullName?: string;
  avatarUrl?: string;
  role?: string;
  onboardingCompleted?: boolean;
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
  const lastLinkedToken = useRef<string | null>(null);

  const syncBackendSession = useCallback(async (session: Session | null) => {
    const accessToken = session?.access_token ?? null;

    if (!accessToken || lastLinkedToken.current === accessToken) {
      return;
    }

    try {
      const response = await fetch("/api/auth/link-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken }),
      });

      if (response.ok) {
        lastLinkedToken.current = accessToken;
      } else {
        console.warn("Failed to sync backend session", await response.json().catch(() => ({})));
      }
    } catch (error) {
      console.error("Backend session sync error", error);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const resolveSession = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();

      if (!isMounted) return;

      if (session?.user) {
        const { user } = session;

        // 🚀 Optimistic Hydration: Set basic info immediately
        setProfile({
          id: user.id,
          email: user.email ?? undefined,
          fullName: user.user_metadata?.full_name ?? undefined,
          avatarUrl: user.user_metadata?.avatar_url ?? undefined,
          role: undefined,
          onboardingCompleted: true, // Optimistically assume true
        });
        setLoading(false);

        try {
          // Fetch real profile data in background
          const { data, error } = await supabase
            .from('user_profiles')
            .select('role, onboarding_completed')
            .eq('user_id', user.id)
            .single();

          if (isMounted && !error && data) {
            setProfile(prev => ({
              ...prev!,
              role: data.role,
              onboardingCompleted: data.onboarding_completed,
            }));
          }
        } catch (err) {
          console.error('Error fetching profile:', err);
        }
        void syncBackendSession(session);
      } else {
        setProfile(null);
        setLoading(false);
      }
    };

    void resolveSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (!isMounted) return;

      if (newSession?.user) {
        const { user } = newSession;

        setProfile({
          id: user.id,
          email: user.email ?? undefined,
          fullName: user.user_metadata?.full_name ?? undefined,
          avatarUrl: user.user_metadata?.avatar_url ?? undefined,
          role: undefined,
          onboardingCompleted: true,
        });
        setLoading(false);

        try {
          const { data, error } = await supabase
            .from('user_profiles')
            .select('role, onboarding_completed')
            .eq('user_id', user.id)
            .single();

          if (isMounted && !error && data) {
            setProfile(prev => ({
              ...prev!,
              role: data.role,
              onboardingCompleted: data.onboarding_completed,
            }));
          }
        } catch (err) {
          console.error('Error fetching profile:', err);
        }
        void syncBackendSession(newSession);
      } else {
        setProfile(null);
        lastLinkedToken.current = null;
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [syncBackendSession]);

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
