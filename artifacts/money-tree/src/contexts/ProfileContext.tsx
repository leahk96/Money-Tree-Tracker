import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Profile } from "@/lib/types";
import { useAuth } from "./AuthContext";

interface ProfileContextType {
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>;
  hasCompletedOnboarding: boolean;
  isPremium: boolean;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  // Track which user ID we last fetched for — guards the window between
  // user becoming non-null and the fetchProfile effect running.
  const [loadedForUserId, setLoadedForUserId] = useState<string | null | undefined>(undefined);

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      setLoadedForUserId(null);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();
    setProfile(data ?? null);
    setLoading(false);
    setLoadedForUserId(user.id);
  }, [user]);

  useEffect(() => {
    if (!authLoading) {
      fetchProfile();
    }
  }, [fetchProfile, authLoading]);

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error("Not authenticated") };
    const { error } = await supabase
      .from("profiles")
      .upsert({ ...updates, user_id: user.id }, { onConflict: "user_id" });
    if (!error) await fetchProfile();
    return { error };
  };

  // isLoading stays true until we've finished fetching for the current user.
  // This prevents ProtectedRoute from briefly seeing profile=null between
  // auth setting user and the fetchProfile effect firing.
  const isLoading = authLoading || loading || (!!user && loadedForUserId !== user.id);
  const hasCompletedOnboarding = !!profile?.onboarding_completed;
  const isPremium = !!profile?.is_premium;

  return (
    <ProfileContext.Provider value={{
      profile,
      loading: isLoading,
      refreshProfile: fetchProfile,
      updateProfile,
      hasCompletedOnboarding,
      isPremium,
    }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used within ProfileProvider");
  return ctx;
}
