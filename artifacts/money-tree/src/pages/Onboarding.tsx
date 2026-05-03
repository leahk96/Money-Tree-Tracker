import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/contexts/ProfileContext";
import { supabase } from "@/lib/supabase";

const STEPS = [
  { id: 1, label: "Your why" },
  { id: 2, label: "Ready!" },
];

export default function Onboarding() {
  const { user } = useAuth();
  const { updateProfile } = useProfile();
  const [, navigate] = useLocation();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

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
    setError("");
    setStep(2);
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
      goal_name: goalName || null,
      goal_photo_url: photoUrl,
      best_streak: 0,
    });

    if (profileError) {
      setError("Something went wrong saving your profile. Please try again.");
      setLoading(false);
      return;
    }

    navigate("/budget");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFAFA] px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🌳</div>
          <h1 className="text-2xl font-bold text-[#104911]">Let's set up your Money Tree</h1>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                step === s.id
                  ? "bg-[#265a27] text-white"
                  : step > s.id
                    ? "bg-[#548c2f] text-white"
                    : "bg-[#E8E8E8] text-[#546E7A]"
              }`}>
                {step > s.id ? "✓" : s.id}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-12 h-0.5 ${step > s.id ? "bg-[#548c2f]" : "bg-[#E8E8E8]"}`} />
              )}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-[#E8E8E8] p-8">
          {error && (
            <div className="mb-4 p-3 bg-[#fef6e0] border border-[#f9a620] rounded-lg text-[#d4880a] text-sm">
              {error}
            </div>
          )}

          {step === 1 && (
            <div>
              <h2 className="text-xl font-semibold text-[#104911] mb-2">What are you saving for?</h2>
              <p className="text-[#546E7A] text-sm mb-6">
                Give your goal a name and an optional photo. This shows on your Money Tree to keep you motivated.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#265a27] mb-1.5">Goal name</label>
                  <input
                    type="text"
                    value={goalName}
                    onChange={e => setGoalName(e.target.value)}
                    placeholder="e.g. Bali 2026, House deposit, Emergency fund"
                    className="w-full px-4 py-3 rounded-xl border border-[#D0D0D0] bg-[#FAFAFA] focus:outline-none focus:ring-2 focus:ring-[#265a27] text-[#104911] placeholder-[#9E9E9E] transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#265a27] mb-1.5">
                    Goal photo <span className="text-[#9E9E9E] font-normal">(optional)</span>
                  </label>
                  {goalPhotoPreview ? (
                    <div className="relative">
                      <img
                        src={goalPhotoPreview}
                        alt="Goal preview"
                        className="w-full h-40 object-cover rounded-xl border border-[#D0D0D0]"
                      />
                      <button
                        onClick={() => { setGoalPhoto(null); setGoalPhotoPreview(null); }}
                        className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full flex items-center justify-center text-[#546E7A] hover:text-[#f9a620] shadow-sm border border-[#e0e0e0] text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-32 rounded-xl border-2 border-dashed border-[#D0D0D0] bg-[#FAFAFA] cursor-pointer hover:border-[#265a27] hover:bg-[#F5F5F5] transition">
                      <span className="text-2xl mb-1">📷</span>
                      <span className="text-sm text-[#546E7A]">Click to upload a photo</span>
                      <span className="text-xs text-[#9E9E9E]">JPG, PNG, max 5MB</span>
                      <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                    </label>
                  )}
                </div>
              </div>

              <button
                onClick={handleStep1}
                className="w-full mt-6 py-3 bg-[#265a27] hover:bg-[#104911] text-white font-semibold rounded-xl transition"
              >
                Continue
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="text-center">
              <div className="text-5xl mb-4">🌱</div>
              <h2 className="text-xl font-semibold text-[#104911] mb-2">You're all set!</h2>
              <p className="text-[#546E7A] text-sm mb-6">
                {goalName ? (
                  <>You're saving for <span className="font-semibold text-[#265a27]">{goalName}</span>. </>
                ) : null}
                Time to plant your Money Tree.
              </p>

              <div className="bg-[#F5F5F5] rounded-xl p-4 mb-6 text-left space-y-2">
                <div className="flex items-center gap-2 text-sm text-[#265a27]">
                  <span className="text-green-500">✓</span> Track your income and expenses each month
                </div>
                <div className="flex items-center gap-2 text-sm text-[#265a27]">
                  <span className="text-green-500">✓</span> Set a savings goal each month and watch your tree grow
                </div>
                <div className="flex items-center gap-2 text-sm text-[#265a27]">
                  <span className="text-green-500">✓</span> Earn gold coins for great quarters
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 border border-[#D0D0D0] text-[#265a27] font-medium rounded-xl hover:bg-[#F5F5F5] transition"
                >
                  Back
                </button>
                <button
                  onClick={handleFinish}
                  disabled={loading}
                  className="flex-1 py-3 bg-[#265a27] hover:bg-[#104911] text-white font-semibold rounded-xl transition disabled:opacity-60"
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
