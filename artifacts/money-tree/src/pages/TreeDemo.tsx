import { useState } from "react";
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

// Demo: 5 goals met this year (March through July)
const DEMO_MET = new Set([3, 4, 5, 6, 7]);
const DEMO_AMOUNTS: Record<number, number> = {
  1: 220, 2: 310, 3: 520, 4: 500, 5: 610, 6: 540, 7: 500,
};
const GOAL = 500;

export default function TreeDemo() {
  const [goalsOverride, setGoalsOverride] = useState(5);

  const q1 = [1,2,3].every(m => DEMO_MET.has(m));
  const q2 = [4,5,6].every(m => DEMO_MET.has(m));
  const q3 = [7,8,9].every(m => DEMO_MET.has(m));
  const q4 = [10,11,12].every(m => DEMO_MET.has(m));
  const bullion = q1 && q2 && q3 && q4;
  const currentMonth = new Date().getMonth() + 1;

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <div className="bg-[#228B22] text-white text-center text-sm py-2 px-4 flex items-center justify-center gap-3">
        <span>This is a live demo preview. <Link to="/signup" className="underline font-medium">Sign up</Link> to save your data.</span>
      </div>

      <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-[#e8f0e8]">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌳</span>
          <span className="text-lg font-bold text-[#1a4a1a]">Money Tree</span>
        </div>
        <nav className="hidden md:flex items-center gap-1">
          {[{label:"Budget",to:"/demo"},{label:"My Tree",to:"/tree-demo"},{label:"Analytics",to:"/analytics"},{label:"Settings",to:"/settings"}].map(n => (
            <Link key={n.to} to={n.to} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${n.to==="/tree-demo" ? "bg-[#e8f5e8] text-[#228B22]" : "text-[#5a7a5a] hover:bg-[#f0f8f0]"}`}>{n.label}</Link>
          ))}
        </nav>
        <Link to="/signup" className="text-sm bg-[#228B22] text-white px-4 py-2 rounded-lg hover:bg-[#1a6b1a] transition font-medium">Get started</Link>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6 pb-10">

        {/* Interactive stage slider */}
        <div className="bg-[#f0f8f0] rounded-2xl border border-[#d0e8d0] p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-[#2d5a2d]">Tree growth preview</span>
            <span className="text-sm font-bold text-[#228B22]">{goalsOverride}/12 goals met</span>
          </div>
          <input
            type="range" min={0} max={12} value={goalsOverride}
            onChange={e => setGoalsOverride(Number(e.target.value))}
            className="w-full accent-[#228B22]"
          />
          <div className="flex justify-between text-[10px] text-[#9ab89a] mt-1">
            <span>Just a seedling</span><span>Full money tree!</span>
          </div>
        </div>

        {/* Tree */}
        <motion.div
          layout
          className="bg-white rounded-2xl border border-[#e8f0e8] p-6 flex flex-col items-center"
        >
          <MoneyTreeSVG goalsMetThisYear={goalsOverride} />
          <p className="text-sm text-[#5a7a5a] mt-2 font-medium">
            Your tree — {goalsOverride}/12 months on track 🌱
          </p>
          {goalsOverride === 0 && (
            <p className="text-xs text-[#9ab89a] mt-1 text-center max-w-xs">
              Drag the slider above to watch your tree grow!
            </p>
          )}
        </motion.div>

        {/* Streak */}
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl border border-amber-200 p-4 flex items-center justify-between">
          <div>
            <div className="text-lg font-bold text-[#c05a00]">🔥 5 month streak!</div>
            <div className="text-xs text-[#9a6020] mt-0.5">Best ever: 5 months</div>
          </div>
          <div className="text-4xl">⭐</div>
        </div>

        {/* Goal card */}
        <div className="bg-white rounded-2xl border border-[#e8f0e8] overflow-hidden">
          <div className="h-28 bg-gradient-to-br from-[#2d7a2d] to-[#85BB65] flex items-center justify-center text-6xl">
            🏝️
          </div>
          <div className="p-4">
            <div className="text-xs text-[#5a7a5a] mb-1">You're saving for</div>
            <div className="text-lg font-bold text-[#1a4a1a]">Bali 2026</div>
            <div className="text-sm text-[#5a7a5a] mt-1">
              Total saved this year: <span className="font-semibold text-[#228B22]">{formatCurrency(3200)}</span>
              <span className="text-[#9ab89a]"> / {formatCurrency(6000)}</span>
            </div>
          </div>
        </div>

        {/* Quarterly coins */}
        <div className="bg-white rounded-2xl border border-[#e8f0e8] p-5">
          <h3 className="font-semibold text-[#1a4a1a] mb-4">Quarterly coins</h3>
          <div className="flex justify-around">
            {QUARTERS.map((q, i) => {
              const earned = [q1, q2, q3, q4][i];
              return (
                <div key={q.label} className="flex flex-col items-center gap-1.5" title={`${q.label} (${q.months}): Hit your goal all 3 months`}>
                  {earned ? (
                    <motion.div
                      animate={{ scale: [1, 1.08, 1] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}
                      className="w-16 h-16 rounded-full flex items-center justify-center text-2xl shadow-md"
                      style={{ background: "linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FFD700 100%)" }}
                    >
                      🪙
                    </motion.div>
                  ) : (
                    <div className="w-16 h-16 rounded-full border-2 border-dashed border-[#c8d8c8] bg-[#f5f8f5] flex items-center justify-center">
                      <span className="text-2xl opacity-25">🪙</span>
                    </div>
                  )}
                  <span className={`text-xs font-semibold ${earned ? "text-[#b07800]" : "text-[#9ab89a]"}`}>{q.label}</span>
                  <span className="text-[10px] text-[#9ab89a]">{q.months}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Gold bullion */}
        <div className={`rounded-2xl border p-5 text-center ${bullion ? "border-[#FFD700] bg-gradient-to-r from-yellow-50 to-amber-50" : "border-[#e8f0e8] bg-white"}`}>
          {bullion ? (
            <div className="space-y-2">
              <div className="text-4xl">🏆</div>
              <div className="font-bold text-[#b07800] text-lg">Gold bullion unlocked!</div>
              <div className="text-sm text-[#9a6020]">You hit your goal every month this year. Incredible!</div>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="text-3xl opacity-30">🏅</div>
              <div className="text-sm font-medium text-[#9ab89a]">Gold bullion</div>
              <div className="text-xs text-[#b0c4b0]">Earn all 4 quarterly coins to unlock</div>
            </div>
          )}
        </div>

        {/* Year grid */}
        <div className="bg-white rounded-2xl border border-[#e8f0e8] p-5">
          <h3 className="font-semibold text-[#1a4a1a] mb-3">2026 progress</h3>
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 12 }, (_, i) => {
              const m = i + 1;
              const goalMet = DEMO_MET.has(m);
              const amount = DEMO_AMOUNTS[m] ?? null;
              const isCurrent = m === currentMonth;
              return (
                <Link key={m} to="/demo">
                  <motion.div
                    whileHover={{ scale: 1.04 }}
                    className={`rounded-xl p-2.5 cursor-pointer border-2 ${
                      isCurrent ? "border-[#FFD700] shadow-sm" : goalMet ? "border-[#85BB65] bg-[#f0faf0]" : "border-[#e8f0e8] bg-white"
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
                        <div className={`text-[10px] mt-0.5 ${goalMet ? "text-[#4a8a4a]" : "text-[#9ab89a]"}`}>
                          {goalMet ? "✓ Goal met" : `£${GOAL - amount} to go`}
                        </div>
                      </>
                    ) : (
                      <div className="text-[10px] text-[#c0d0c0]">No data</div>
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
