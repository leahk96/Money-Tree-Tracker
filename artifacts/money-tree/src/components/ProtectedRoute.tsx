import { ReactNode } from "react";
import { Redirect } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/contexts/ProfileContext";

interface ProtectedRouteProps {
  children: ReactNode;
  requireOnboarding?: boolean;
}

export function ProtectedRoute({ children, requireOnboarding = true }: ProtectedRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading, hasCompletedOnboarding } = useProfile();

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-[#035c37] border-t-transparent animate-spin" />
          <p className="text-[#035c37] font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  // Redirect to onboarding if: profile doesn't exist yet (brand-new user)
  // OR profile exists but onboarding was never finished
  if (requireOnboarding && !hasCompletedOnboarding) {
    return <Redirect to="/onboarding" />;
  }

  return <>{children}</>;
}
