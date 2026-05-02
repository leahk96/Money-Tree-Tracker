import { Link } from "wouter";
import { motion } from "framer-motion";
import { MoneyTreeSVG } from "@/components/MoneyTreeSVG";
import { formatCurrency } from "@/lib/currency";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const QUARTERS = [
  { label: "Q1", months: "Jan–Mar" },
  { label: "Q2", months: "Apr–Jun" },
  { label: "Q3", months: "Jul–Sep" },
  { label: "Q4", months: "Oct–Dec" },
];

// Demo: 9 months met (Jan–Feb missed, Mar–Nov all hit)
const DEMO_MET = new Set([3, 4, 5, 6, 7, 8, 9, 10, 11]);
const DEMO_AMOUNTS: Record<number, number> = {
  1: 310, 2: 420, 3: 520, 4: 500, 5: 580,
  6: 510, 7: 500, 8: 550, 9: 500, 10: 520, 11: 505,
};
const GOAL = 500;
const MONTHS_MET = DEMO_MET.size; // 9

const q1 = [1, 2, 3].every(m => DEMO_MET.has(m));
const q2 = [4, 5, 6].every(m => DEMO_MET.has(m));
const q3 = [7, 8, 9].every(m => DEMO_MET.has(m));
const q4 = [10, 11, 12].every(m => DEMO_MET.has(m));
const coinsEarned = [q1, q2, q3, q4].filter(Boolean).length;
const bullion = q1 && q2 && q3 && q4;

function CoinSlot({ label, months, earned, index }: { label: string; months: string; earned: boolean; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.08 }}
      className="flex flex-col items-center gap-1.5"
    >
      {earned ? (
        <motion.div
          initial={{ scale: 0.4 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", bounce: 0.5, delay: 0.15 + index * 0.08 }}
          className="w-16 h-16 rounded-full flex items-center justify-center shadow-md text-3xl"
          style={{ background: "radial-gradient(circle at 35% 35%, #FFE066, #FFA500)" }}
        >
          🪙
        </motion.div>
      ) : (
        <div className="w-16 h-16 rounded-full border-2 border-dashed border-[#c8d8c8] bg-[#f5f8f5] flex items-center justify-center">
          <span className="text-3xl opacity-20">🪙</span>
        </div>
      )}
      <span className={`text-xs font-bold ${earned ? "text-[#b07800]" : "text-[#9ab89a]"}`}>{label}</span>
      <span className="text-[10px] text-[#9ab89a] text-center leading-tight">{months}</span>
      <span className={`text-[10px] font-medium ${earned ? "text-[#b07800]" : "text-[#c0d0c0]"}`}>
        {earned ? "Earned!" : "Locked"}
      </span>
    </motion.div>
  );
}

export default function TreeDemo() {
  const currentMonth = new Date().getMonth() + 1;

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <div className="bg-[#228B22] text-white text-center text-sm py-2 px-4">
        Demo preview — <Link to="/signup" className="underline font-medium">Sign up free</Link> to track your real savings
      </div>

      <header className="flex items-center justify-between px-6 py-3.5 bg-white border-b border-[#e8f0e8] sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <span className="text-xl">🌳</span>
          <span className="text-base font-bold text-[#1a4a1a]">Money Tree</span>
        </div>
        <nav className="hidden md:flex items-center gap-1">
          {[{ label:"Budget", to:"/demo" }, { label:"My Tree", to:"/tree-demo" }, { label:"Settings", to:"/settings" }].map(n => (
            <Link key={n.to} to={n.to} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${n.to==="/tree-demo" ? "bg-[#e8f5e8] text-[#228B22]" : "text-[#5a7a5a] hover:bg-[#f0f8f0]"}`}>{n.label}</Link>
          ))}
        </nav>
        <Link to="/signup" className="text-sm bg-[#228B22] text-white px-4 py-2 rounded-lg hover:bg-[#1a6b1a] transition font-medium">Get started</Link>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5 pb-10">

        {/* Tree hero card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-[#e8f0e8] p-5"
        >
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-bold text-[#1a4a1a] text-base">Your Money Tree</h2>
            <span className="text-xs font-semibold text-[#228B22] bg-[#e8f5e8] px-2.5 py-1 rounded-full">
              {MONTHS_MET}/12 goals met
            </span>
          </div>
          <p className="text-xs text-[#7a9a7a] mb-4">
            Hit your monthly savings goal and your tree grows a new stage. Miss a month and it stays put — no going backwards.
          </p>

          <MoneyTreeSVG monthsGoalMet={MONTHS_MET} />

          <div className="mt-3 pt-3 border-t border-[#f0f4f0] flex items-center justify-between">
            <div className="text-xs text-[#7a9a7a]">
              3 more months to unlock the full money tree ✨
            </div>
            <div className="flex gap-1">
              {Array.from({ length: 12 }, (_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${i < MONTHS_MET ? "bg-[#228B22]" : "bg-[#e0e8e0]"}`}
                />
              ))}
            </div>
          </div>
        </motion.div>

        {/* Streak */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl border border-amber-200 p-4 flex items-center justify-between"
        >
          <div>
            <div className="text-base font-bold text-[#c05a00]">🔥 9 month streak!</div>
            <div className="text-xs text-[#9a6020] mt-0.5">Best ever: 9 months — keep it up for the full tree!</div>
          </div>
          <div className="text-4xl">🔥</div>
        </motion.div>

        {/* Goal card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="bg-white rounded-2xl border border-[#e8f0e8] overflow-hidden"
        >
          <div className="h-28 bg-gradient-to-br from-[#1a5a1a] to-[#85BB65] flex items-center justify-center text-6xl select-none">
            🏝️
          </div>
          <div className="p-4">
            <div className="text-xs text-[#5a7a5a] mb-0.5">Saving for</div>
            <div className="text-lg font-bold text-[#1a4a1a]">Bali 2026</div>
            <div className="mt-2 text-sm text-[#5a7a5a]">
              Total saved this year:&nbsp;
              <span className="font-semibold text-[#228B22]">{formatCurrency(4985)}</span>
              <span className="text-[#9ab89a]"> / {formatCurrency(8000)}</span>
            </div>
            <div className="mt-2 w-full bg-[#e8f0e8] rounded-full h-1.5">
              <div className="bg-[#228B22] h-1.5 rounded-full" style={{ width: "62%" }} />
            </div>
          </div>
        </motion.div>

        {/* Rewards */}
        <div className="pt-1">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-px flex-1 bg-[#e8f0e8]" />
            <span className="text-xs font-semibold text-[#9ab89a] uppercase tracking-wider">Rewards</span>
            <div className="h-px flex-1 bg-[#e8f0e8]" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="bg-white rounded-2xl border border-[#e8f0e8] p-5"
          >
            <div className="flex items-start justify-between mb-1">
              <h3 className="font-bold text-[#1a4a1a]">Quarterly coins</h3>
              <span className="text-xs text-[#9ab89a]">{coinsEarned}/4 earned</span>
            </div>
            <p className="text-xs text-[#7a9a7a] mb-5">
              Hit your goal every month for a quarter and earn a coin. Collect all 4 and they melt into a gold bullion!
            </p>
            <div className="flex justify-around">
              {QUARTERS.map((q, i) => (
                <CoinSlot
                  key={q.label}
                  label={q.label}
                  months={q.months}
                  earned={[q1, q2, q3, q4][i]}
                  index={i}
                />
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16 }}
            className={`mt-3 rounded-2xl border p-5 text-center ${
              bullion ? "border-[#FFD700] bg-gradient-to-br from-yellow-50 to-amber-50" : "border-[#e8f0e8] bg-white"
            }`}
          >
            {bullion ? (
              <div className="space-y-2">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5 }} className="text-5xl">🏆</motion.div>
                <div className="font-bold text-[#b07800] text-lg">Gold bullion unlocked!</div>
              </div>
            ) : (
              <div className="flex items-center gap-4 text-left">
                <div className="text-4xl opacity-30 shrink-0">🏅</div>
                <div>
                  <div className="font-semibold text-[#9ab89a]">Gold bullion</div>
                  <div className="text-xs text-[#b0c4b0] mt-0.5">
                    Hit your goal every month of the year to collect all 4 coins and unlock the gold bullion.
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Year grid */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border border-[#e8f0e8] p-5"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-[#1a4a1a]">2026 at a glance</h3>
            <span className="text-xs text-[#9ab89a]">{DEMO_MET.size} goals met</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 12 }, (_, i) => {
              const m = i + 1;
              const goalMet = DEMO_MET.has(m);
              const amount = DEMO_AMOUNTS[m] ?? null;
              const isCurrent = m === currentMonth;
              return (
                <motion.div
                  key={m}
                  whileHover={{ scale: 1.04 }}
                  className={`rounded-xl p-2.5 border-2 ${
                    isCurrent ? "border-[#FFD700] shadow-sm"
                    : goalMet ? "border-[#85BB65] bg-[#f0faf0]"
                    : "border-[#e8f0e8] bg-white"
                  }`}
                >
                  <div className={`text-xs font-semibold mb-1 ${goalMet ? "text-[#228B22]" : "text-[#5a7a5a]"}`}>
                    {MONTH_NAMES[i]}
                  </div>
                  {amount !== null ? (
                    <>
                      <div className={`text-sm font-bold ${goalMet ? "text-[#228B22]" : "text-[#1a4a1a]"}`}>
                        {formatCurrency(amount)}
                      </div>
                      <div className={`text-[10px] mt-0.5 ${goalMet ? "text-[#4a8a4a]" : "text-[#c06060]"}`}>
                        {goalMet ? "✓ Goal met" : `£${GOAL - amount} short`}
                      </div>
                    </>
                  ) : (
                    <div className="text-[10px] text-[#c0d0c0]">—</div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>

      </div>
    </div>
  );
}
