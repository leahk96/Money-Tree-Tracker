import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";

export default function ResetPassword() {
  const [, navigate] = useLocation();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setSessionReady(true);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) { setError("Password must be at least 8 characters"); return; }
    if (password !== confirm) { setError("Passwords don't match"); return; }
    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setDone(true);
    setTimeout(() => navigate("/login"), 3000);
  };

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] px-4">
        <div className="w-full max-w-md text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-[#035c37]">Password updated</h2>
          <p className="text-[#546E7A] mt-3">Redirecting you to sign in…</p>
        </div>
      </div>
    );
  }

  if (!sessionReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] px-4">
        <div className="w-full max-w-md text-center">
          <div className="text-5xl mb-4">🌳</div>
          <p className="text-[#546E7A]">Verifying your reset link…</p>
          <div className="mt-4 flex justify-center">
            <div className="w-6 h-6 rounded-full border-2 border-[#035c37] border-t-transparent animate-spin" />
          </div>
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
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-[#E8E8E8] p-8">
          <h2 className="text-xl font-semibold text-[#035c37] mb-2">Set a new password</h2>
          <p className="text-[#546E7A] text-sm mb-6">Choose a new password for your account.</p>

          {error && (
            <div className="mb-4 p-3 bg-[#fde8ed] border border-[#ee4266] rounded-lg text-[#c23354] text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#035c37] mb-1.5">New password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                autoFocus
                className="w-full px-4 py-3 rounded-xl border border-[#D0D0D0] bg-[#FAFAFA] focus:outline-none focus:ring-2 focus:ring-[#035c37] focus:border-transparent text-[#035c37] placeholder-[#9E9E9E] transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#035c37] mb-1.5">Confirm new password</label>
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
              className="w-full py-3 bg-[#035c37] hover:bg-[#035c37] text-white font-semibold rounded-xl transition disabled:opacity-60"
            >
              {loading ? "Updating…" : "Set new password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
