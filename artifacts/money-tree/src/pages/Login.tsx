import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";

export default function Login() {
  const { signIn } = useAuth();
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError("Please fill in all fields"); return; }
    setLoading(true);
    setError("");
    const { error: authError } = await signIn(email, password);
    if (authError) {
      setError("Invalid email or password. Please try again.");
      setLoading(false);
    } else {
      navigate("/tree");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🌳</div>
          <h1 className="text-3xl font-bold text-[#035c37]">Money Tree</h1>
          <p className="text-[#546E7A] mt-1">Your savings, growing</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-[#E8E8E8] p-8">
          <h2 className="text-xl font-semibold text-[#035c37] mb-6">Welcome back</h2>

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

            <div className="text-right">
              <Link to="/forgot-password" className="text-sm text-[#035c37] hover:underline">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#035c37] hover:bg-[#035c37] text-white font-semibold rounded-xl transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="text-center text-sm text-[#546E7A] mt-6">
            Don't have an account?{" "}
            <Link to="/signup" className="text-[#035c37] font-medium hover:underline">
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
