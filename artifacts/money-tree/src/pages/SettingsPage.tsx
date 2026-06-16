import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { AppLayout } from "@/components/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/contexts/ProfileContext";
import { parseCurrency, SUPPORTED_CURRENCIES } from "@/lib/currency";
import { useCurrency } from "@/contexts/CurrencyContext";

function SettingsContent() {
  const { symbol, fmt } = useCurrency();
  const { user, signOut } = useAuth();
  const { profile, updateProfile, refreshProfile } = useProfile();
  const [location, navigate] = useLocation();
  const [upgradeSuccess, setUpgradeSuccess] = useState(false);

  // Refresh profile after Stripe redirect so the banner disappears immediately
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("upgraded") === "true") {
      setUpgradeSuccess(true);
      refreshProfile();
      navigate("/settings", { replace: true });
    }
  }, []);

  // Goal section state
  const [goalName, setGoalName]   = useState(profile?.goal_name ?? "");
  const [goalTarget, setGoalTarget] = useState(profile?.goal_target_total ? String(profile.goal_target_total) : "");
  const [savingGoal, setSavingGoal] = useState(false);
  const [goalSaved, setGoalSaved] = useState(false);

  // Currency section state
  const [selectedCurrency, setSelectedCurrency] = useState(profile?.currency ?? "GBP");
  const [savingCurrency, setSavingCurrency] = useState(false);
  const [currencySaved, setCurrencySaved] = useState(false);

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
      setSelectedCurrency(profile.currency ?? "GBP");
    }
  }, [profile]);

  const saveGoal = async () => {
    setSavingGoal(true);
    await updateProfile({
      goal_name: goalName.trim() || null,
      goal_target_total: goalTarget ? parseCurrency(goalTarget) : null,
    });
    setSavingGoal(false);
    setGoalSaved(true);
    setTimeout(() => setGoalSaved(false), 2500);
  };

  const saveCurrency = async () => {
    setSavingCurrency(true);
    await updateProfile({ currency: selectedCurrency });
    setSavingCurrency(false);
    setCurrencySaved(true);
    setTimeout(() => setCurrencySaved(false), 2500);
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

      {upgradeSuccess && (
        <div className="flex items-center gap-3 px-4 py-3 bg-[#E8F5E9] border border-[#A5D6A7] rounded-2xl text-sm text-[#1B5E20] font-medium">
          <span className="text-lg">🎉</span>
          You're now a premium member — your progress is saved forever!
        </div>
      )}

      {/* ── SAVINGS GOAL ── */}
      <section className="bg-white rounded-2xl border border-[#E0E0E0] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#F5F5F5]">
          <h2 className="font-semibold text-[#1B5E20]">My savings goal</h2>
          <p className="text-xs text-[#607D8B] mt-0.5">What are you growing your money tree for?</p>
        </div>

        <div className="px-5 py-5 space-y-5">
          {/* Goal name */}
          <div>
            <label className="block text-xs font-semibold text-[#37474F] mb-1.5">Goal name</label>
            <input
              type="text"
              value={goalName}
              onChange={e => setGoalName(e.target.value)}
              placeholder="e.g. Family holiday to Italy"
              maxLength={80}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#D0D0D0] focus:outline-none focus:ring-2 focus:ring-[#17914A]/40 text-sm text-[#1B5E20] placeholder:text-[#9E9E9E]"
            />
          </div>

          {/* Target amount */}
          <div>
            <label className="block text-xs font-semibold text-[#37474F] mb-1.5">Target amount</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#17914A] font-semibold text-sm">{symbol}</span>
              <input
                type="number"
                value={goalTarget}
                onChange={e => setGoalTarget(e.target.value)}
                placeholder="5000"
                min={0}
                className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-[#D0D0D0] focus:outline-none focus:ring-2 focus:ring-[#17914A]/40 text-sm text-[#1B5E20] placeholder:text-[#9E9E9E]"
              />
            </div>
            {goalTarget && (
              <p className="text-xs text-[#607D8B] mt-1">Target: {fmt(parseCurrency(goalTarget))}</p>
            )}
          </div>

          <button
            onClick={saveGoal}
            disabled={savingGoal}
            className="w-full py-2.5 bg-[#17914A] text-white font-semibold rounded-xl hover:bg-[#1B5E20] transition disabled:opacity-60 text-sm flex items-center justify-center gap-2"
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

      {/* ── CURRENCY ── */}
      <section className="bg-white rounded-2xl border border-[#E0E0E0] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#F5F5F5]">
          <h2 className="font-semibold text-[#1B5E20]">Currency</h2>
          <p className="text-xs text-[#607D8B] mt-0.5">Choose how amounts are displayed across the app</p>
        </div>
        <div className="px-5 py-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#37474F] mb-1.5">Display currency</label>
            <select
              value={selectedCurrency}
              onChange={e => setSelectedCurrency(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#D0D0D0] focus:outline-none focus:ring-2 focus:ring-[#17914A]/40 text-sm text-[#1B5E20] bg-white"
            >
              {Object.entries(SUPPORTED_CURRENCIES).map(([code, sym]) => (
                <option key={code} value={code}>{sym} — {code}</option>
              ))}
            </select>
          </div>
          <button
            onClick={saveCurrency}
            disabled={savingCurrency || selectedCurrency === (profile?.currency ?? "GBP")}
            className="w-full py-2.5 bg-[#17914A] text-white font-semibold rounded-xl hover:bg-[#1B5E20] transition disabled:opacity-60 text-sm flex items-center justify-center gap-2"
          >
            {savingCurrency ? (
              <><div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> Saving…</>
            ) : currencySaved ? (
              <>✓ Currency updated!</>
            ) : (
              "Save currency"
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
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D0D0D0] focus:outline-none focus:ring-2 focus:ring-[#17914A]/40 text-sm text-[#1B5E20] placeholder:text-[#9E9E9E]"
              />
              <input
                type="password"
                value={confirmPw}
                onChange={e => setConfirmPw(e.target.value)}
                placeholder="Confirm new password"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D0D0D0] focus:outline-none focus:ring-2 focus:ring-[#17914A]/40 text-sm text-[#1B5E20] placeholder:text-[#9E9E9E]"
              />
              {pwError && <p className="text-xs text-red-500">{pwError}</p>}
              {pwSaved && <p className="text-xs text-[#17914A] font-medium">✓ Password updated</p>}
              <button
                onClick={changePassword}
                disabled={savingPw || !newPw || !confirmPw}
                className="w-full py-2.5 border border-[#17914A] text-[#17914A] font-semibold rounded-xl hover:bg-[#F5F5F5] transition disabled:opacity-40 text-sm"
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
