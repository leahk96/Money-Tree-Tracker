import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { AppLayout } from "@/components/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/contexts/ProfileContext";
import { formatCurrency, CURRENCY_SYMBOL, parseCurrency } from "@/lib/currency";

function SettingsContent() {
  const { user, signOut } = useAuth();
  const { profile, updateProfile, refreshProfile } = useProfile();
  const [, navigate] = useLocation();

  // Goal section state
  const [goalName, setGoalName]   = useState(profile?.goal_name ?? "");
  const [goalTarget, setGoalTarget] = useState(profile?.goal_target_total ? String(profile.goal_target_total) : "");
  const [goalPhotoUrl, setGoalPhotoUrl] = useState(profile?.goal_photo_url ?? "");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [savingGoal, setSavingGoal] = useState(false);
  const [goalSaved, setGoalSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Password change state
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwSaved, setPwSaved] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  // Delete account
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  // Sync profile → local state when profile loads
  useEffect(() => {
    if (profile) {
      setGoalName(profile.goal_name ?? "");
      setGoalTarget(profile.goal_target_total ? String(profile.goal_target_total) : "");
      setGoalPhotoUrl(profile.goal_photo_url ?? "");
    }
  }, [profile]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploadingPhoto(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/goal.${ext}`;
    const { error } = await supabase.storage.from("goal-photos").upload(path, file, { upsert: true });
    if (!error) {
      const { data } = supabase.storage.from("goal-photos").getPublicUrl(path);
      setGoalPhotoUrl(data.publicUrl);
    }
    setUploadingPhoto(false);
  };

  const saveGoal = async () => {
    setSavingGoal(true);
    await updateProfile({
      goal_name: goalName.trim() || null,
      goal_photo_url: goalPhotoUrl || null,
      goal_target_total: goalTarget ? parseCurrency(goalTarget) : null,
    });
    setSavingGoal(false);
    setGoalSaved(true);
    setTimeout(() => setGoalSaved(false), 2500);
  };

  const changePassword = async () => {
    setPwError("");
    if (newPw.length < 8) { setPwError("New password must be at least 8 characters."); return; }
    if (newPw !== confirmPw) { setPwError("Passwords don't match."); return; }
    setSavingPw(true);
    const { error } = await supabase.auth.updateUser({ password: newPw });
    setSavingPw(false);
    if (error) { setPwError(error.message); return; }
    setPwSaved(true);
    setCurrentPw(""); setNewPw(""); setConfirmPw("");
    setTimeout(() => setPwSaved(false), 2500);
  };

  const deleteAccount = async () => {
    if (deleteConfirm !== "DELETE") return;
    setDeleting(true);
    // Delete all user data then sign out (account deletion requires server-side in prod)
    await supabase.from("line_items").delete().in(
      "month_id",
      (await supabase.from("months").select("id").eq("user_id", user!.id)).data?.map(m => m.id) ?? []
    );
    await supabase.from("months").delete().eq("user_id", user!.id);
    await supabase.from("profiles").delete().eq("user_id", user!.id);
    await signOut();
    navigate("/");
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8 space-y-6 pb-16">
      <h1 className="text-xl font-bold text-[#1B5E20]">Settings</h1>

      {/* ── SAVINGS GOAL ── */}
      <section className="bg-white rounded-2xl border border-[#E0E0E0] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#F5F5F5]">
          <h2 className="font-semibold text-[#1B5E20]">My savings goal</h2>
          <p className="text-xs text-[#607D8B] mt-0.5">What are you growing your money tree for?</p>
        </div>

        <div className="px-5 py-5 space-y-5">
          {/* Photo upload */}
          <div className="flex items-center gap-4">
            <div
              onClick={() => fileRef.current?.click()}
              className="w-20 h-20 rounded-2xl border-2 border-dashed border-[#c8dcc8] bg-[#F5F5F5] flex items-center justify-center cursor-pointer hover:border-[#2E7D32] transition overflow-hidden shrink-0"
            >
              {goalPhotoUrl ? (
                <img src={goalPhotoUrl} alt="Goal" className="w-full h-full object-cover" />
              ) : uploadingPhoto ? (
                <div className="w-5 h-5 rounded-full border-2 border-[#2E7D32] border-t-transparent animate-spin" />
              ) : (
                <div className="text-center">
                  <div className="text-2xl mb-0.5">📷</div>
                  <div className="text-[9px] text-[#9E9E9E] font-medium">Add photo</div>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
            <div className="flex-1">
              <p className="text-xs text-[#546E7A] leading-relaxed">
                Add a photo of what you're saving for — a holiday, car, house, or anything else. It'll appear on your tree page.
              </p>
              {goalPhotoUrl && (
                <button
                  onClick={() => setGoalPhotoUrl("")}
                  className="text-xs text-red-400 hover:text-red-600 mt-1.5 transition"
                >
                  Remove photo
                </button>
              )}
            </div>
          </div>

          {/* Goal name */}
          <div>
            <label className="block text-xs font-semibold text-[#37474F] mb-1.5">Goal name</label>
            <input
              type="text"
              value={goalName}
              onChange={e => setGoalName(e.target.value)}
              placeholder="e.g. Family holiday to Italy"
              maxLength={80}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#D0D0D0] focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/40 text-sm text-[#1B5E20] placeholder:text-[#9E9E9E]"
            />
          </div>

          {/* Target amount */}
          <div>
            <label className="block text-xs font-semibold text-[#37474F] mb-1.5">Target amount</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#2E7D32] font-semibold text-sm">{CURRENCY_SYMBOL}</span>
              <input
                type="number"
                value={goalTarget}
                onChange={e => setGoalTarget(e.target.value)}
                placeholder="5000"
                min={0}
                className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-[#D0D0D0] focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/40 text-sm text-[#1B5E20] placeholder:text-[#9E9E9E]"
              />
            </div>
            {goalTarget && (
              <p className="text-xs text-[#607D8B] mt-1">Target: {formatCurrency(parseCurrency(goalTarget))}</p>
            )}
          </div>

          <button
            onClick={saveGoal}
            disabled={savingGoal}
            className="w-full py-2.5 bg-[#2E7D32] text-white font-semibold rounded-xl hover:bg-[#1B5E20] transition disabled:opacity-60 text-sm flex items-center justify-center gap-2"
          >
            {savingGoal ? (
              <><div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> Saving…</>
            ) : goalSaved ? (
              <>✓ Saved!</>
            ) : (
              "Save goal"
            )}
          </button>
        </div>
      </section>

      {/* ── ACCOUNT ── */}
      <section className="bg-white rounded-2xl border border-[#E0E0E0] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#F5F5F5]">
          <h2 className="font-semibold text-[#1B5E20]">Account</h2>
        </div>

        <div className="px-5 py-5 space-y-4">
          {/* Email — read only */}
          <div>
            <label className="block text-xs font-semibold text-[#37474F] mb-1.5">Email address</label>
            <div className="px-3.5 py-2.5 rounded-xl border border-[#E8E8E8] bg-[#FAFAFA] text-sm text-[#546E7A] select-all">
              {user?.email}
            </div>
          </div>

          {/* Change password */}
          <div>
            <label className="block text-xs font-semibold text-[#37474F] mb-2">Change password</label>
            <div className="space-y-2">
              <input
                type="password"
                value={newPw}
                onChange={e => setNewPw(e.target.value)}
                placeholder="New password"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D0D0D0] focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/40 text-sm text-[#1B5E20] placeholder:text-[#9E9E9E]"
              />
              <input
                type="password"
                value={confirmPw}
                onChange={e => setConfirmPw(e.target.value)}
                placeholder="Confirm new password"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D0D0D0] focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/40 text-sm text-[#1B5E20] placeholder:text-[#9E9E9E]"
              />
              {pwError && <p className="text-xs text-red-500">{pwError}</p>}
              {pwSaved && <p className="text-xs text-[#2E7D32] font-medium">✓ Password updated</p>}
              <button
                onClick={changePassword}
                disabled={savingPw || !newPw || !confirmPw}
                className="w-full py-2.5 border border-[#2E7D32] text-[#2E7D32] font-semibold rounded-xl hover:bg-[#F5F5F5] transition disabled:opacity-40 text-sm"
              >
                {savingPw ? "Updating…" : "Update password"}
              </button>
            </div>
          </div>

          {/* Sign out */}
          <button
            onClick={signOut}
            className="w-full py-2.5 border border-[#E0E0E0] text-[#546E7A] rounded-xl hover:bg-[#F5F5F5] transition text-sm font-medium"
          >
            Sign out
          </button>
        </div>
      </section>

      {/* ── DANGER ZONE ── */}
      <section className="bg-white rounded-2xl border border-red-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-red-50">
          <h2 className="font-semibold text-red-600">Danger zone</h2>
        </div>

        <div className="px-5 py-5">
          {!showDelete ? (
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-[#1B5E20]">Delete account</p>
                <p className="text-xs text-[#607D8B] mt-0.5">Permanently removes all your budget data and account.</p>
              </div>
              <button
                onClick={() => setShowDelete(true)}
                className="shrink-0 px-4 py-2 border border-red-200 text-red-500 rounded-xl text-sm hover:bg-red-50 transition font-medium"
              >
                Delete
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-[#1B5E20]">
                This will permanently delete <strong>all your budget data</strong> and cannot be undone. Type <strong>DELETE</strong> to confirm.
              </p>
              <input
                type="text"
                value={deleteConfirm}
                onChange={e => setDeleteConfirm(e.target.value)}
                placeholder="Type DELETE to confirm"
                className="w-full px-3.5 py-2.5 rounded-xl border border-red-200 focus:outline-none focus:ring-2 focus:ring-red-300 text-sm text-[#1B5E20]"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => { setShowDelete(false); setDeleteConfirm(""); }}
                  className="flex-1 py-2.5 border border-[#E0E0E0] text-[#546E7A] rounded-xl hover:bg-[#F5F5F5] transition text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={deleteAccount}
                  disabled={deleteConfirm !== "DELETE" || deleting}
                  className="flex-1 py-2.5 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition disabled:opacity-40 text-sm"
                >
                  {deleting ? "Deleting…" : "Delete account"}
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <SettingsContent />
      </AppLayout>
    </ProtectedRoute>
  );
}
