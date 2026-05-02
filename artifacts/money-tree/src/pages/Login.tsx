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
    <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7] px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🌳</div>
          <h1 className="text-3xl font-bold text-[#1a4a1a]">Money Tree</h1>
          <p className="text-[#5a7a5a] mt-1">Your savings, growing</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-[#e8f0e8] p-8">
          <h2 className="text-xl font-semibold text-[#1a4a1a] mb-6">Welcome back</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#2d5a2d] mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl border border-[#d0e4d0] bg-[#f8fbf8] focus:outline-none focus:ring-2 focus:ring-[#228B22] focus:border-transparent text-[#1a4a1a] placeholder-[#9ab89a] transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2d5a2d] mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-[#d0e4d0] bg-[#f8fbf8] focus:outline-none focus:ring-2 focus:ring-[#228B22] focus:border-transparent text-[#1a4a1a] placeholder-[#9ab89a] transition"
              />
            </div>

            <div className="text-right">
              <Link to="/forgot-password" className="text-sm text-[#228B22] hover:underline">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#228B22] hover:bg-[#1a6b1a] text-white font-semibold rounded-xl transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="text-center text-sm text-[#5a7a5a] mt-6">
            Don't have an account?{" "}
            <Link to="/signup" className="text-[#228B22] font-medium hover:underline">
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
