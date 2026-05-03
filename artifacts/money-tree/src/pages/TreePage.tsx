import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { AppLayout } from "@/components/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { MoneyTreeSVG } from "@/components/MoneyTreeSVG";
import { useTreeData, MonthSummary } from "@/hooks/useTreeData";
import { useProfile } from "@/contexts/ProfileContext";
import { useCurrency } from "@/contexts/CurrencyContext";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const QUARTERS = [
  { label: "Q1", months: "Jan–Mar", key: "q1Earned" as const },
  { label: "Q2", months: "Apr–Jun", key: "q2Earned" as const },
  { label: "Q3", months: "Jul–Sep", key: "q3Earned" as const },
  { label: "Q4", months: "Oct–Dec", key: "q4Earned" as const },
];

function CoinSlot({ label, months, earned, index }: { label: string; months: string; earned: boolean; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 + index * 0.08 }}
      className="flex flex-col items-center gap-1.5"
      title={`${label} (${months}): Hit your goal all 3 months`}
    >
      <div className="relative">
        {earned ? (
          <motion.div
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", bounce: 0.5 }}
            className="w-16 h-16 rounded-full flex items-center justify-center text-2xl shadow-md"
            style={{ background: "linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FFD700 100%)" }}
          >
            <motion.span
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            >
              🪙
            </motion.span>
          </motion.div>
        ) : (
          <div className="w-16 h-16 rounded-full border-2 border-dashed border-[#BDBDBD] bg-[#F5F5F5] flex items-center justify-center">
            <span className="text-2xl opacity-25">🪙</span>
          </div>
        )}
      </div>
      <span className={`text-xs font-semibold ${earned ? "text-[#D4AF37]" : "text-[#9E9E9E]"}`}>{label}</span>
      <span className="text-[10px] text-[#9E9E9E]">{months}</span>
    </motion.div>
  );
}

function MonthBox({ summary, isCurrent, onClick }: { summary: MonthSummary | null; month: number; isCurrent: boolean; onClick: () => void }) {
  const { fmt } = useCurrency();
  const monthIdx = summary ? summary.month - 1 : -1;
  const name = monthIdx >= 0 ? MONTH_NAMES[monthIdx] : "—";
  const hasData = !!summary;
  const goalMet = summary?.goalMet ?? false;
  const totalSaved = summary?.totalSaved ?? 0;

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      className={`rounded-xl p-2.5 text-left transition border-2 ${
        isCurrent
          ? "border-[#FFD700] shadow-sm"
          : goalMet
            ? "border-[#4CAF50] bg-[#f0faf0]"
            : "border-[#E8E8E8] bg-white"
      }`}
    >
      <div className={`text-xs font-semibold mb-1 ${goalMet ? "text-[#2E7D32]" : "text-[#546E7A]"}`}>
        {name}
      </div>
      {hasData ? (
        <>
          <div className={`text-sm font-bold ${goalMet ? "text-[#2E7D32]" : "text-[#1B5E20]"}`}>
            {fmt(totalSaved)}
          </div>
          <div className={`text-[10px] mt-0.5 ${goalMet ? "text-[#4a8a4a]" : "text-[#9E9E9E]"}`}>
            {goalMet ? "✓ Goal met" : `${fmt((summary?.savingsGoal ?? 0) - totalSaved)} to go`}
          </div>
        </>
      ) : (
        <div className="text-[10px] text-[#c0d0c0]">No data</div>
      )}
    </motion.button>
  );
}

function TreeContent() {
  const { fmt } = useCurrency();
  const { data, loading } = useTreeData();
  const { profile } = useProfile();
  const [, navigate] = useLocation();
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 rounded-full border-4 border-[#2E7D32] border-t-transparent animate-spin" />
      </div>
    );
  }

  const goalsMetThisYear = data?.goalsMetThisYear ?? 0;
  const summaryMap = new Map<number, MonthSummary>();
  (data?.monthlySummaries ?? []).forEach(s => summaryMap.set(s.month, s));

  const streakBadge = (data?.currentStreak ?? 0) >= 12 ? "🔥" : (data?.currentStreak ?? 0) >= 6 ? "🔥" : (data?.currentStreak ?? 0) >= 3 ? "🔥" : null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5 pb-10">
      {/* Tree hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-[#E8E8E8] p-5"
      >
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-bold text-[#1B5E20] text-base">Your Money Tree</h2>
          <span className="text-xs font-semibold text-[#2E7D32] bg-[#E8F5E9] px-2.5 py-1 rounded-full">
            {goalsMetThisYear}/12 goals met
          </span>
        </div>
        <p className="text-xs text-[#607D8B] mb-3">
          Hit your monthly savings goal and your tree grows. Miss a month and it stays put — no shortcuts, no going backwards.
        </p>

        <MoneyTreeSVG monthsGoalMet={goalsMetThisYear} celebrateOnChange />

        {/* Progress dots */}
        <div className="mt-3 pt-3 border-t border-[#F5F5F5] flex items-center justify-between">
          <p className="text-xs text-[#607D8B]">
            {goalsMetThisYear === 0
              ? "Hit your savings goal this month to grow your first leaves!"
              : "Every month you hit your goal, notes grow on your tree"}
          </p>
          <div className="flex gap-1 shrink-0 ml-3">
            {Array.from({ length: 12 }, (_, i) => (
              <div key={i} className={`w-2 h-2 rounded-full ${i < goalsMetThisYear ? "bg-[#2E7D32]" : "bg-[#E0E0E0]"}`} />
            ))}
          </div>
        </div>
      </motion.div>

      {/* Streak */}
      {(data?.currentStreak ?? 0) > 0 && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl border border-amber-200 p-4 flex items-center justify-between"
        >
          <div>
            <div className="text-lg font-bold text-[#c05a00]">
              {streakBadge} {data?.currentStreak} month streak!
            </div>
            <div className="text-xs text-[#BF360C] mt-0.5">
              Best ever: {data?.bestStreak} months
            </div>
          </div>
          <div className="text-4xl">{(data?.currentStreak ?? 0) >= 12 ? "🏆" : (data?.currentStreak ?? 0) >= 6 ? "⭐" : "🔥"}</div>
        </motion.div>
      )}

      {/* Goal context card */}
      {profile?.goal_name && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-[#E8E8E8] overflow-hidden"
        >
          {profile.goal_photo_url && (
            <img src={profile.goal_photo_url} alt={profile.goal_name} className="w-full h-32 object-cover" />
          )}
          <div className="p-4">
            <div className="text-xs text-[#546E7A] mb-1">You're saving for</div>
            <div className="text-lg font-bold text-[#1B5E20]">{profile.goal_name}</div>
            {data && (
              <div className="text-sm text-[#546E7A] mt-1">
                Total saved this year: <span className="font-semibold text-[#2E7D32]">{fmt(data.totalSavedThisYear)}</span>
                {profile.yearly_target && (
                  <span className="text-[#9E9E9E]"> / {fmt(profile.yearly_target)}</span>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Quarterly coins */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-white rounded-2xl border border-[#E8E8E8] p-5"
      >
        <div className="flex items-start justify-between mb-1">
          <h3 className="font-bold text-[#1B5E20]">Quarterly coins</h3>
          <span className="text-xs text-[#9E9E9E]">
            {[data?.q1Earned, data?.q2Earned, data?.q3Earned, data?.q4Earned].filter(Boolean).length}/4 earned
          </span>
        </div>
        <p className="text-xs text-[#607D8B] mb-5">
          Hit your goal every month in a quarter and earn a coin. Collect all 4 and they melt into a gold bullion at year end.
        </p>
        <div className="flex justify-around">
          {QUARTERS.map((q, i) => (
            <CoinSlot
              key={q.label}
              label={q.label}
              months={q.months}
              earned={data?.[q.key] ?? false}
              index={i}
            />
          ))}
        </div>
      </motion.div>

      {/* Gold bullion */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={`rounded-2xl border p-5 transition-all duration-700 ${
          data?.bullionUnlocked
            ? "border-[#FFD700] bg-gradient-to-r from-yellow-50 to-amber-50 text-center"
            : "border-[#E8E8E8] bg-white"
        }`}
      >
        {data?.bullionUnlocked ? (
          <div className="space-y-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", bounce: 0.5 }}
              className="text-4xl"
            >
              🏆
            </motion.div>
            <div className="font-bold text-[#D4AF37] text-lg">Gold bullion unlocked!</div>
            <div className="text-sm text-[#BF360C]">You hit your goal every single month. Extraordinary!</div>
          </div>
        ) : (
          <div className="flex items-center gap-4 text-left">
            <div className="shrink-0">
              <svg width="52" height="34" viewBox="0 0 52 34" className="opacity-30">
                <rect x="4" y="8" width="44" height="22" rx="4" fill="#C8960C" />
                <rect x="2" y="6" width="48" height="22" rx="4" fill="#FFD700" />
                <rect x="6" y="10" width="40" height="14" rx="2" fill="none" stroke="#C8960C" strokeWidth="1.2" />
                <rect x="2" y="6" width="48" height="6" rx="4" fill="rgba(255,255,255,0.18)" />
                <text x="26" y="19" textAnchor="middle" fontSize="7" fill="#8a6200" fontWeight="bold" fontFamily="Inter, sans-serif">GOLD</text>
              </svg>
            </div>
            <div>
              <div className="font-semibold text-[#9E9E9E]">Gold bullion</div>
              <div className="text-xs text-[#9E9E9E] mt-0.5">
                Collect all 4 quarterly coins by hitting your goal every single month. At year end they melt into a gold bar.
              </div>
              {(() => {
                const coinsEarned = [data?.q1Earned, data?.q2Earned, data?.q3Earned, data?.q4Earned].filter(Boolean).length;
                const remaining = 4 - coinsEarned;
                return (
                  <div className="text-xs text-[#c8a000] mt-1.5 font-medium">
                    {coinsEarned}/4 coins — {remaining} more quarter{remaining !== 1 ? "s" : ""} to go
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </motion.div>

      {/* Year progress grid */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="bg-white rounded-2xl border border-[#E8E8E8] p-5"
      >
        <h3 className="font-semibold text-[#1B5E20] mb-3">{currentYear} progress</h3>
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: 12 }, (_, i) => {
            const m = i + 1;
            const summary = summaryMap.get(m) ?? null;
            return (
              <MonthBox
                key={m}
                summary={summary}
                month={m}
                isCurrent={m === currentMonth}
                onClick={() => navigate(`/budget/${currentYear}/${m}`)}
              />
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}

export default function TreePage() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <TreeContent />
      </AppLayout>
    </ProtectedRoute>
  );
}
