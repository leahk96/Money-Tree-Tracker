import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { MoneyTreeSVG } from "@/components/MoneyTreeSVG";
import { formatCurrency } from "@/lib/currency";

const DEMO_NAV = [
  { label: "Budget",  to: "/demo" },
  { label: "My Tree", to: "/tree-demo" },
  { label: "Garden",  to: "/garden-demo" },
  { label: "Summary", to: "/summary-demo" },
];

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const QUARTERS = [
  { label:"Q1", months:"Jan–Mar", q1: true  },
  { label:"Q2", months:"Apr–Jun", q1: false },
  { label:"Q3", months:"Jul–Sep", q1: false },
  { label:"Q4", months:"Oct–Dec", q1: false },
];

interface YearScenario {
  year: number;
  goalsMetCount: number;
  totalSaved: number;
  bestStreak: number;
  currentStreak: number;
  q1: boolean; q2: boolean; q3: boolean; q4: boolean;
  months: { saved: number; goal: number; hasData: boolean }[];
}

const SCENARIOS: Record<number, YearScenario> = {
  2024: {
    year: 2024, goalsMetCount: 9, totalSaved: 4800, bestStreak: 5, currentStreak: 0,
    q1: true, q2: false, q3: true, q4: false,
    months: [
      { saved: 520, goal: 500, hasData: true },
      { saved: 510, goal: 500, hasData: true },
      { saved: 505, goal: 500, hasData: true },
      { saved: 380, goal: 500, hasData: true },
      { saved: 500, goal: 500, hasData: true },
      { saved: 490, goal: 500, hasData: true },
      { saved: 510, goal: 500, hasData: true },
      { saved: 520, goal: 500, hasData: true },
      { saved: 515, goal: 500, hasData: true },
      { saved: 350, goal: 500, hasData: true },
      { saved: 0,   goal: 500, hasData: false },
      { saved: 0,   goal: 500, hasData: false },
    ],
  },
  2025: {
    year: 2025, goalsMetCount: 11, totalSaved: 6200, bestStreak: 8, currentStreak: 0,
    q1: true, q2: true, q3: true, q4: false,
    months: [
      { saved: 550, goal: 500, hasData: true },
      { saved: 520, goal: 500, hasData: true },
      { saved: 530, goal: 500, hasData: true },
      { saved: 510, goal: 500, hasData: true },
      { saved: 540, goal: 500, hasData: true },
      { saved: 505, goal: 500, hasData: true },
      { saved: 560, goal: 500, hasData: true },
      { saved: 520, goal: 500, hasData: true },
      { saved: 515, goal: 500, hasData: true },
      { saved: 480, goal: 500, hasData: true },
      { saved: 490, goal: 500, hasData: true },
      { saved: 0,   goal: 500, hasData: false },
    ],
  },
  2026: {
    year: 2026, goalsMetCount: 3, totalSaved: 1550, bestStreak: 3, currentStreak: 3,
    q1: false, q2: false, q3: false, q4: false,
    months: [
      { saved: 520, goal: 500, hasData: true },
      { saved: 510, goal: 500, hasData: true },
      { saved: 520, goal: 500, hasData: true },
      { saved: 0,   goal: 500, hasData: false },
      { saved: 0,   goal: 500, hasData: false },
      { saved: 0,   goal: 500, hasData: false },
      { saved: 0,   goal: 500, hasData: false },
      { saved: 0,   goal: 500, hasData: false },
      { saved: 0,   goal: 500, hasData: false },
      { saved: 0,   goal: 500, hasData: false },
      { saved: 0,   goal: 500, hasData: false },
      { saved: 0,   goal: 500, hasData: false },
    ],
  },
};

const AVAILABLE_YEARS = [2024, 2025, 2026];

export default function SummaryDemo() {
  const [selectedYear, setSelectedYear] = useState(2026);
  const d = SCENARIOS[selectedYear];
  const yearIdx = AVAILABLE_YEARS.indexOf(selectedYear);
  const canPrev = yearIdx > 0;
  const canNext = yearIdx < AVAILABLE_YEARS.length - 1;

  const isCurrent = selectedYear === 2026;
  const totalGoal = d.months.filter(m => m.hasData).reduce((s, m) => s + m.goal, 0);
  const vsGoal = d.totalSaved - totalGoal;
  const quarterEarned = [d.q1, d.q2, d.q3, d.q4];

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <div className="bg-[#228B22] text-white text-center text-sm py-2 px-4">
        Demo preview — <Link to="/signup" className="underline font-medium">Sign up free</Link> to track your own summary
      </div>

      <header className="flex items-center justify-between px-6 py-3.5 bg-white border-b border-[#e8f0e8] sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <span className="text-xl">🌳</span>
          <span className="text-base font-bold text-[#1a4a1a]">Money Tree</span>
        </div>
        <nav className="hidden md:flex items-center gap-1">
          {DEMO_NAV.map(n => (
            <Link key={n.to} to={n.to}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                n.to === "/summary-demo"
                  ? "bg-[#e8f5e8] text-[#228B22]"
                  : "text-[#5a7a5a] hover:bg-[#f0f8f0]"
              }`}
            >{n.label}</Link>
          ))}
        </nav>
        <Link to="/signup" className="text-sm bg-[#228B22] text-white px-4 py-2 rounded-lg hover:bg-[#1a6b1a] transition font-medium">
          Get started
        </Link>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 pb-12 space-y-5">
        {/* Year nav */}
        <div className="flex items-center justify-between">
          <button onClick={() => canPrev && setSelectedYear(AVAILABLE_YEARS[yearIdx - 1])} disabled={!canPrev}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[#e8f0e8] text-[#2d5a2d] transition disabled:opacity-30">
            ←
          </button>
          <div className="text-center">
            <h1 className="text-xl font-bold text-[#1a4a1a]">{selectedYear} {isCurrent ? "so far" : "in review"}</h1>
            <p className="text-xs text-[#7a9a7a] mt-0.5">{isCurrent ? `${12 - d.goalsMetCount} months remaining` : "Full year"}</p>
          </div>
          <button onClick={() => canNext && setSelectedYear(AVAILABLE_YEARS[yearIdx + 1])} disabled={!canNext}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[#e8f0e8] text-[#2d5a2d] transition disabled:opacity-30">
            →
          </button>
        </div>

        {/* Tree + headline */}
        <motion.div key={selectedYear} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-[#e8f0e8] p-5">
          <div className="flex items-center gap-4">
            <div className="w-36 shrink-0">
              <MoneyTreeSVG monthsGoalMet={d.goalsMetCount} />
            </div>
            <div className="flex-1 space-y-2">
              <div>
                <div className="text-xs text-[#7a9a7a] mb-0.5">Goals hit</div>
                <div className="text-3xl font-bold text-[#228B22]">
                  {d.goalsMetCount}<span className="text-lg text-[#9ab89a] font-normal">/12</span>
                </div>
              </div>
              <div className="w-full bg-[#e8f0e8] rounded-full h-2">
                <motion.div className="bg-[#228B22] h-2 rounded-full"
                  initial={{ width: 0 }} animate={{ width: `${(d.goalsMetCount / 12) * 100}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }} />
              </div>
              <div className="text-xs text-[#5a7a5a]">
                {d.goalsMetCount >= 9 ? "🔥 Outstanding" : d.goalsMetCount >= 6 ? "⭐ Good progress" : "🌱 Getting started"}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Total saved",   value: formatCurrency(d.totalSaved), sub: vsGoal >= 0 ? `+${formatCurrency(vsGoal)} above goal` : `${formatCurrency(Math.abs(vsGoal))} below goal`, positive: vsGoal >= 0 },
            { label: "Best streak",   value: `${d.bestStreak} months`,     sub: d.currentStreak > 0 ? `Current: ${d.currentStreak}` : undefined, positive: true },
            { label: "Goals smashed", value: `${d.goalsMetCount}/12`,       sub: d.goalsMetCount === 12 ? "Perfect year!" : `${12 - d.goalsMetCount} to go`, positive: d.goalsMetCount >= 6 },
            { label: "Quarterly coins", value: `${quarterEarned.filter(Boolean).length}/4`, sub: "Hit every month in a quarter", positive: quarterEarned.some(Boolean) },
          ].map((card, i) => (
            <motion.div key={card.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.06 + i * 0.05 }}
              className="bg-white rounded-xl border border-[#e8f0e8] p-4">
              <div className="text-xs text-[#7a9a7a] mb-1">{card.label}</div>
              <div className={`text-xl font-bold ${card.positive ? "text-[#228B22]" : "text-[#c05a00]"}`}>{card.value}</div>
              {card.sub && <div className="text-xs text-[#9ab89a] mt-0.5">{card.sub}</div>}
            </motion.div>
          ))}
        </div>

        {/* Quarterly coins */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border border-[#e8f0e8] p-5">
          <h3 className="font-semibold text-[#1a4a1a] mb-4 text-sm">Quarterly coins</h3>
          <div className="flex justify-around">
            {QUARTERS.map((q, i) => {
              const earned = quarterEarned[i];
              return (
                <div key={q.label} className="flex flex-col items-center gap-1.5">
                  {earned ? (
                    <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5 }}
                      className="w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow"
                      style={{ background: "linear-gradient(135deg,#FFD700,#FFA500)" }}>🪙</motion.div>
                  ) : (
                    <div className="w-14 h-14 rounded-full border-2 border-dashed border-[#d0e0d0] bg-[#f8fbf8] flex items-center justify-center text-2xl opacity-25">🪙</div>
                  )}
                  <span className={`text-xs font-semibold ${earned ? "text-[#b07800]" : "text-[#9ab89a]"}`}>{q.label}</span>
                  <span className="text-[10px] text-[#b0c0b0]">{q.months}</span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Monthly grid */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}
          className="bg-white rounded-2xl border border-[#e8f0e8] p-5">
          <h3 className="font-semibold text-[#1a4a1a] mb-3 text-sm">{selectedYear} month by month</h3>
          <div className="grid grid-cols-4 gap-2">
            {d.months.map((m, i) => {
              const goalMet = m.hasData && m.saved >= m.goal;
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.025 }}
                  className={`rounded-xl p-2.5 border-2 ${
                    goalMet ? "border-[#85BB65] bg-[#f0faf0]"
                    : m.hasData ? "border-[#e8f0e8] bg-white"
                    : "border-dashed border-[#e8f0e8] bg-[#fafcfa]"
                  }`}
                >
                  <div className={`text-xs font-semibold mb-1 ${goalMet ? "text-[#228B22]" : "text-[#5a7a5a]"}`}>
                    {MONTH_NAMES[i]}
                  </div>
                  {m.hasData ? (
                    <>
                      <div className={`text-sm font-bold tabular-nums ${goalMet ? "text-[#228B22]" : "text-[#1a4a1a]"}`}>
                        {formatCurrency(m.saved)}
                      </div>
                      <div className={`text-[10px] mt-0.5 ${goalMet ? "text-[#4a8a4a]" : "text-[#c06060]"}`}>
                        {goalMet ? "✓ Goal met" : `${formatCurrency(m.goal - m.saved)} short`}
                      </div>
                    </>
                  ) : (
                    <div className="text-[10px] text-[#c8d8c8]">—</div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}
          className="bg-gradient-to-r from-[#f0fbf0] to-[#e8f5e8] rounded-2xl border border-[#c8e8c8] p-5 text-center">
          <div className="text-sm font-semibold text-[#1a4a1a] mb-1">Track your own year in Money Tree</div>
          <div className="text-xs text-[#5a7a5a] mb-3">See your real savings, streaks, and tree grow month by month.</div>
          <Link to="/signup" className="inline-block bg-[#228B22] text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-[#1a6b1a] transition">
            Start for free →
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
