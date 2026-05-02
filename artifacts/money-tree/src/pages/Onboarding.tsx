import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/contexts/ProfileContext";
import { supabase } from "@/lib/supabase";
import { CURRENCY_SYMBOL } from "@/lib/currency";

const STEPS = [
  { id: 1, label: "Your goal" },
  { id: 2, label: "Your why" },
  { id: 3, label: "Ready!" },
];

export default function Onboarding() {
  const { user } = useAuth();
  const { updateProfile } = useProfile();
  const [, navigate] = useLocation();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [monthlyGoal, setMonthlyGoal] = useState("500");
  const [goalName, setGoalName] = useState("");
  const [goalPhoto, setGoalPhoto] = useState<File | null>(null);
  const [goalPhotoPreview, setGoalPhotoPreview] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("Photo must be under 5MB");
      return;
    }
    setGoalPhoto(file);
    setGoalPhotoPreview(URL.createObjectURL(file));
  };

  const handleStep1 = () => {
    const val = parseFloat(monthlyGoal);
    if (isNaN(val) || val <= 0) {
      setError("Please enter a valid savings goal");
      return;
    }
    setError("");
    setStep(2);
  };

  const handleStep2 = () => {
    setError("");
    setStep(3);
  };

  const handleFinish = async () => {
    if (!user) return;
    setLoading(true);
    setError("");

    let photoUrl: string | null = null;

    if (goalPhoto) {
      const ext = goalPhoto.name.split(".").pop();
      const path = `${user.id}/goal.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("goal-photos")
        .upload(path, goalPhoto, { upsert: true });

      if (!uploadError) {
        const { data } = supabase.storage.from("goal-photos").getPublicUrl(path);
        photoUrl = data.publicUrl;
      }
    }

    const { error: profileError } = await updateProfile({
      default_monthly_goal: parseFloat(monthlyGoal),
      goal_name: goalName || null,
      goal_photo_url: photoUrl,
      yearly_target: parseFloat(monthlyGoal) * 12,
      best_streak: 0,
    });

    if (profileError) {
      setError("Something went wrong saving your profile. Please try again.");
      setLoading(false);
      return;
    }

    const now = new Date();
    await supabase.from("months").upsert({
      user_id: user.id,
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      savings_goal: parseFloat(monthlyGoal),
    }, { onConflict: "user_id,year,month" });

    navigate("/budget");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFBF7] px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🌳</div>
          <h1 className="text-2xl font-bold text-[#1a4a1a]">Let's set up your Money Tree</h1>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                step === s.id
                  ? "bg-[#228B22] text-white"
                  : step > s.id
                    ? "bg-[#85BB65] text-white"
                    : "bg-[#e8f0e8] text-[#5a7a5a]"
              }`}>
                {step > s.id ? "✓" : s.id}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-12 h-0.5 ${step > s.id ? "bg-[#85BB65]" : "bg-[#e8f0e8]"}`} />
              )}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-[#e8f0e8] p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {step === 1 && (
            <div>
              <h2 className="text-xl font-semibold text-[#1a4a1a] mb-2">What's your monthly savings goal?</h2>
              <p className="text-[#5a7a5a] text-sm mb-6">
                This is how much you want to save each month. You can always change it later.
              </p>

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#228B22] font-semibold text-lg">
                  {CURRENCY_SYMBOL}
                </span>
                <input
                  type="number"
                  value={monthlyGoal}
                  onChange={e => setMonthlyGoal(e.target.value)}
                  className="w-full pl-9 pr-4 py-4 text-2xl font-bold rounded-xl border border-[#d0e4d0] bg-[#f8fbf8] focus:outline-none focus:ring-2 focus:ring-[#228B22] text-[#1a4a1a] transition"
                  placeholder="500"
                  min="1"
                  step="50"
                />
              </div>

              <div className="flex gap-2 mt-3">
                {[250, 500, 750, 1000].map(amount => (
                  <button
                    key={amount}
                    onClick={() => setMonthlyGoal(String(amount))}
                    className={`flex-1 py-1.5 text-sm rounded-lg border transition ${
                      monthlyGoal === String(amount)
                        ? "bg-[#228B22] text-white border-[#228B22]"
                        : "border-[#d0e4d0] text-[#2d5a2d] hover:border-[#228B22]"
                    }`}
                  >
                    {CURRENCY_SYMBOL}{amount}
                  </button>
                ))}
              </div>

              <button
                onClick={handleStep1}
                className="w-full mt-6 py-3 bg-[#228B22] hover:bg-[#1a6b1a] text-white font-semibold rounded-xl transition"
              >
                Continue
              </button>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-xl font-semibold text-[#1a4a1a] mb-2">What are you saving for?</h2>
              <p className="text-[#5a7a5a] text-sm mb-6">
                Give your goal a name and an optional photo. This shows on your Money Tree to keep you motivated.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#2d5a2d] mb-1.5">Goal name</label>
                  <input
                    type="text"
                    value={goalName}
                    onChange={e => setGoalName(e.target.value)}
                    placeholder="e.g. Bali 2026, House deposit, Emergency fund"
                    className="w-full px-4 py-3 rounded-xl border border-[#d0e4d0] bg-[#f8fbf8] focus:outline-none focus:ring-2 focus:ring-[#228B22] text-[#1a4a1a] placeholder-[#9ab89a] transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2d5a2d] mb-1.5">
                    Goal photo <span className="text-[#9ab89a] font-normal">(optional)</span>
                  </label>
                  {goalPhotoPreview ? (
                    <div className="relative">
                      <img
                        src={goalPhotoPreview}
                        alt="Goal preview"
                        className="w-full h-40 object-cover rounded-xl border border-[#d0e4d0]"
                      />
                      <button
                        onClick={() => { setGoalPhoto(null); setGoalPhotoPreview(null); }}
                        className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full flex items-center justify-center text-[#5a7a5a] hover:text-red-500 shadow-sm border border-[#e0e0e0] text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-32 rounded-xl border-2 border-dashed border-[#c0d8c0] bg-[#f8fbf8] cursor-pointer hover:border-[#228B22] hover:bg-[#f0f8f0] transition">
                      <span className="text-2xl mb-1">📷</span>
                      <span className="text-sm text-[#5a7a5a]">Click to upload a photo</span>
                      <span className="text-xs text-[#9ab89a]">JPG, PNG, max 5MB</span>
                      <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                    </label>
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 border border-[#d0e4d0] text-[#2d5a2d] font-medium rounded-xl hover:bg-[#f0f8f0] transition"
                >
                  Back
                </button>
                <button
                  onClick={handleStep2}
                  className="flex-1 py-3 bg-[#228B22] hover:bg-[#1a6b1a] text-white font-semibold rounded-xl transition"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center">
              <div className="text-5xl mb-4">🌱</div>
              <h2 className="text-xl font-semibold text-[#1a4a1a] mb-2">You're all set!</h2>
              <p className="text-[#5a7a5a] text-sm mb-6">
                Your monthly savings goal is{" "}
                <span className="font-semibold text-[#228B22]">{CURRENCY_SYMBOL}{monthlyGoal}</span>
                {goalName && (
                  <> and you're saving for <span className="font-semibold text-[#228B22]">{goalName}</span></>
                )}
                . Time to plant your Money Tree.
              </p>

              <div className="bg-[#f0f8f0] rounded-xl p-4 mb-6 text-left space-y-2">
                <div className="flex items-center gap-2 text-sm text-[#2d5a2d]">
                  <span className="text-green-500">✓</span> Track your income and expenses each month
                </div>
                <div className="flex items-center gap-2 text-sm text-[#2d5a2d]">
                  <span className="text-green-500">✓</span> Watch your tree grow when you hit your goal
                </div>
                <div className="flex items-center gap-2 text-sm text-[#2d5a2d]">
                  <span className="text-green-500">✓</span> Earn gold coins for great quarters
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 py-3 border border-[#d0e4d0] text-[#2d5a2d] font-medium rounded-xl hover:bg-[#f0f8f0] transition"
                >
                  Back
                </button>
                <button
                  onClick={handleFinish}
                  disabled={loading}
                  className="flex-1 py-3 bg-[#228B22] hover:bg-[#1a6b1a] text-white font-semibold rounded-xl transition disabled:opacity-60"
                >
                  {loading ? "Setting up..." : "Let's go!"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
