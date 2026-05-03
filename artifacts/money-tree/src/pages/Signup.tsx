import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

export default function Signup() {
  const { signUp } = useAuth();
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !confirm) { setError("Please fill in all fields"); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters"); return; }
    if (password !== confirm) { setError("Passwords don't match"); return; }
    setLoading(true);
    setError("");

    const { error: authError } = await signUp(email, password);
    if (authError) {
      setError((authError as Error).message || "Something went wrong. Please try again.");
      setLoading(false);
      return;
    }

    // Check if the user was auto-confirmed (no email confirmation required)
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      // Auto-confirmed — go straight to onboarding
      navigate("/onboarding");
    } else {
      // Email confirmation required — show waiting screen
      setAwaitingConfirmation(true);
      setLoading(false);
    }
  };

  if (awaitingConfirmation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] px-4">
        <div className="w-full max-w-md text-center">
          <div className="text-6xl mb-4">📬</div>
          <h2 className="text-2xl font-bold text-[#035c37]">Check your email</h2>
          <p className="text-[#546E7A] mt-3 text-base leading-relaxed">
            We've sent a confirmation link to <strong>{email}</strong>. Click it to activate your account, then come back here to sign in.
          </p>
          <div className="mt-6 p-4 bg-[#F5F5F5] border border-[#e2f9f0] rounded-xl text-sm text-[#035c37] text-left space-y-1">
            <p className="font-semibold mb-2">💡 Tip: skip email confirmation</p>
            <p>If you control this Supabase project, go to <strong>Authentication → Settings</strong> and turn off <strong>Enable email confirmations</strong> for instant sign-up.</p>
          </div>
          <Link to="/login" className="mt-6 inline-block text-[#035c37] font-medium hover:underline text-sm">
            Back to sign in →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🌳</div>
          <h1 className="text-3xl font-bold text-[#035c37]">Money Tree</h1>
          <p className="text-[#546E7A] mt-1">Start growing your savings today</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-[#E8E8E8] p-8">
          <h2 className="text-xl font-semibold text-[#035c37] mb-6">Create your account</h2>

          {error && (
            <div className="mb-4 p-3 bg-[#fde8ed] border border-[#ee4266] rounded-lg text-[#c23354] text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#035c37] mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl border border-[#D0D0D0] bg-[#FAFAFA] focus:outline-none focus:ring-2 focus:ring-[#035c37] focus:border-transparent text-[#035c37] placeholder-[#9E9E9E] transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#035c37] mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-[#D0D0D0] bg-[#FAFAFA] focus:outline-none focus:ring-2 focus:ring-[#035c37] focus:border-transparent text-[#035c37] placeholder-[#9E9E9E] transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#035c37] mb-1.5">Confirm password</label>
              <input
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-[#D0D0D0] bg-[#FAFAFA] focus:outline-none focus:ring-2 focus:ring-[#035c37] focus:border-transparent text-[#035c37] placeholder-[#9E9E9E] transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#035c37] hover:bg-[#035c37] text-white font-semibold rounded-xl transition disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="text-center text-sm text-[#546E7A] mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-[#035c37] font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
