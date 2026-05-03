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
            style={{ background: "linear-gradient(135deg, #ffd449 0%, #f9a620 50%, #ffd449 100%)" }}
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
      <span className={`text-xs font-semibold ${earned ? "text-[#ffd449]" : "text-[#9E9E9E]"}`}>{label}</span>
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
          ? "border-[#ffd449] shadow-sm"
          : goalMet
            ? "border-[#548c2f] bg-[#f0f7e8]"
            : "border-[#E8E8E8] bg-white"
      }`}
    >
      <div className={`text-xs font-semibold mb-1 ${goalMet ? "text-[#265a27]" : "text-[#546E7A]"}`}>
        {name}
      </div>
      {hasData ? (
        <>
          <div className={`text-sm font-bold ${goalMet ? "text-[#265a27]" : "text-[#104911]"}`}>
            {fmt(totalSaved)}
          </div>
          <div className={`text-[10px] mt-0.5 ${goalMet ? "text-[#548c2f]" : "text-[#9E9E9E]"}`}>
            {goalMet ? "✓ Goal met" : `${fmt((summary?.savingsGoal ?? 0) - totalSaved)} to go`}
          </div>
        </>
      ) : (
        <div className="text-[10px] text-[#ebf5df]">No data</div>
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
        <div className="w-10 h-10 rounded-full border-4 border-[#265a27] border-t-transparent animate-spin" />
      </div>
    );
  }

  const goalsMetThisYear = data?.goalsMetThisYear ?? 0;
  const summaryMap = new Map<number, MonthSummary>();
  (data?.monthlySummaries ?? []).forEach(s => summaryMap.set(s.month, s));

  const streakBadge = (data?.currentStreak ?? 0) >= 12 ? "🔥" : (data?.currentStreak ?? 0) >= 6 ? "🔥" : (data?.currentStreak ?? 0) >= 3 ? "🔥" : null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Tree hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-[#E8E8E8] p-6 flex flex-col items-center"
      >
        <MoneyTreeSVG monthsGoalMet={goalsMetThisYear} celebrateOnChange />

        <p className="text-sm text-[#546E7A] mt-2 font-medium">
          Your tree — {goalsMetThisYear}/12 months on track 🌱
        </p>

        {goalsMetThisYear === 0 && (
          <p className="text-xs text-[#9E9E9E] mt-1 text-center max-w-xs">
            Hit your savings goal this month and watch your tree grow its first leaves!
          </p>
        )}
      </motion.div>

      {/* Streak */}
      {(data?.currentStreak ?? 0) > 0 && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gradient-to-r from-[#fef6e0] to-[#fef9e0] rounded-2xl border border-[#ffd449] p-4 flex items-center justify-between"
        >
          <div>
            <div className="text-lg font-bold text-[#d4880a]">
              {streakBadge} {data?.currentStreak} month streak!
            </div>
            <div className="text-xs text-[#d4880a] mt-0.5">
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
            <div className="text-lg font-bold text-[#104911]">{profile.goal_name}</div>
            {data && (
              <div className="text-sm text-[#546E7A] mt-1">
                Total saved this year: <span className="font-semibold text-[#265a27]">{fmt(data.totalSavedThisYear)}</span>
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
        <h3 className="font-semibold text-[#104911] mb-4">Quarterly coins</h3>
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
        className={`rounded-2xl border p-5 text-center transition-all duration-700 ${
          data?.bullionUnlocked
            ? "border-[#ffd449] bg-gradient-to-r from-[#fef9e0] to-[#fdfae8]"
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
            <div className="font-bold text-[#ffd449] text-lg">Gold bullion unlocked!</div>
            <div className="text-sm text-[#d4880a]">You hit your goal every month this year. Incredible!</div>
          </div>
        ) : (
          <div className="space-y-1">
            <div className="text-3xl opacity-30">🏅</div>
            <div className="text-sm font-medium text-[#9E9E9E]">Gold bullion</div>
            <div className="text-xs text-[#9E9E9E]">Earn all 4 quarterly coins to unlock</div>
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
        <h3 className="font-semibold text-[#104911] mb-3">{currentYear} progress</h3>
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
