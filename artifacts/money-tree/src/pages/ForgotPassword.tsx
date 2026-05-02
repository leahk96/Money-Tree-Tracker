import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";

export default function ForgotPassword() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { setError("Please enter your email"); return; }
    setLoading(true);
    await resetPassword(email);
    setLoading(false);
    setSent(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7] px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🌳</div>
          <h1 className="text-3xl font-bold text-[#1a4a1a]">Money Tree</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-[#e8f0e8] p-8">
          {sent ? (
            <div className="text-center">
              <div className="text-4xl mb-4">📬</div>
              <h2 className="text-xl font-semibold text-[#1a4a1a] mb-2">Check your inbox</h2>
              <p className="text-[#5a7a5a] text-sm">
                We've sent a password reset link to your email. Check your inbox (and spam folder).
              </p>
              <Link to="/login" className="mt-6 inline-block text-[#228B22] font-medium hover:underline text-sm">
                Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-[#1a4a1a] mb-2">Reset your password</h2>
              <p className="text-[#5a7a5a] text-sm mb-6">
                Enter your email and we'll send you a reset link.
              </p>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
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

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[#228B22] hover:bg-[#1a6b1a] text-white font-semibold rounded-xl transition disabled:opacity-60"
                >
                  {loading ? "Sending..." : "Send reset link"}
                </button>
              </form>

              <p className="text-center text-sm text-[#5a7a5a] mt-6">
                <Link to="/login" className="text-[#228B22] font-medium hover:underline">
                  Back to sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
