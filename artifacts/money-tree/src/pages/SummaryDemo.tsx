import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, ReferenceLine, CartesianGrid, Legend,
} from "recharts";
import { MoneyTreeSVG } from "@/components/MoneyTreeSVG";
import { useCurrency } from "@/contexts/CurrencyContext";

const DEMO_NAV = [
  { label: "Budget",  to: "/demo" },
  { label: "My Tree", to: "/tree-demo" },
  { label: "Garden",  to: "/garden-demo" },
  { label: "Summary", to: "/summary-demo" },
];

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const QUARTERS = [
  { label:"Q1", months:"Jan–Mar" },
  { label:"Q2", months:"Apr–Jun" },
  { label:"Q3", months:"Jul–Sep" },
  { label:"Q4", months:"Oct–Dec" },
];

interface MonthData {
  month: string;
  saved: number;
  goal: number;
  needs: number;
  wants: number;
  hasData: boolean;
}

interface YearScenario {
  year: number;
  goalsMetCount: number;
  totalSaved: number;
  bestStreak: number;
  currentStreak: number;
  q1: boolean; q2: boolean; q3: boolean; q4: boolean;
  months: MonthData[];
}

const SCENARIOS: Record<number, YearScenario> = {
  2024: {
    year: 2024, goalsMetCount: 9, totalSaved: 4800, bestStreak: 5, currentStreak: 0,
    q1: true, q2: false, q3: true, q4: false,
    months: [
      { month:"Jan", saved:520, goal:500, needs:410, wants:280, hasData:true },
      { month:"Feb", saved:510, goal:500, needs:390, wants:260, hasData:true },
      { month:"Mar", saved:505, goal:500, needs:420, wants:290, hasData:true },
      { month:"Apr", saved:380, goal:500, needs:480, wants:380, hasData:true },
      { month:"May", saved:500, goal:500, needs:415, wants:310, hasData:true },
      { month:"Jun", saved:490, goal:500, needs:440, wants:340, hasData:true },
      { month:"Jul", saved:510, goal:500, needs:395, wants:255, hasData:true },
      { month:"Aug", saved:520, goal:500, needs:380, wants:240, hasData:true },
      { month:"Sep", saved:515, goal:500, needs:405, wants:270, hasData:true },
      { month:"Oct", saved:350, goal:500, needs:460, wants:360, hasData:true },
      { month:"Nov", saved:0,   goal:500, needs:0,   wants:0,   hasData:false },
      { month:"Dec", saved:0,   goal:500, needs:0,   wants:0,   hasData:false },
    ],
  },
  2025: {
    year: 2025, goalsMetCount: 11, totalSaved: 6200, bestStreak: 8, currentStreak: 0,
    q1: true, q2: true, q3: true, q4: false,
    months: [
      { month:"Jan", saved:550, goal:500, needs:395, wants:240, hasData:true },
      { month:"Feb", saved:520, goal:500, needs:380, wants:210, hasData:true },
      { month:"Mar", saved:530, goal:500, needs:410, wants:250, hasData:true },
      { month:"Apr", saved:510, goal:500, needs:400, wants:265, hasData:true },
      { month:"May", saved:540, goal:500, needs:385, wants:230, hasData:true },
      { month:"Jun", saved:505, goal:500, needs:415, wants:255, hasData:true },
      { month:"Jul", saved:560, goal:500, needs:370, wants:200, hasData:true },
      { month:"Aug", saved:520, goal:500, needs:390, wants:225, hasData:true },
      { month:"Sep", saved:515, goal:500, needs:405, wants:245, hasData:true },
      { month:"Oct", saved:480, goal:500, needs:430, wants:295, hasData:true },
      { month:"Nov", saved:490, goal:500, needs:420, wants:280, hasData:true },
      { month:"Dec", saved:0,   goal:500, needs:0,   wants:0,   hasData:false },
    ],
  },
  2026: {
    year: 2026, goalsMetCount: 4, totalSaved: 2030, bestStreak: 4, currentStreak: 4,
    q1: true, q2: false, q3: false, q4: false,
    months: [
      { month:"Jan", saved:520, goal:500, needs:400, wants:260, hasData:true },
      { month:"Feb", saved:495, goal:500, needs:390, wants:245, hasData:true },
      { month:"Mar", saved:510, goal:500, needs:415, wants:270, hasData:true },
      { month:"Apr", saved:505, goal:500, needs:410, wants:205, hasData:true },
      { month:"May", saved:0,   goal:500, needs:0,   wants:0,   hasData:false },
      { month:"Jun", saved:0,   goal:500, needs:0,   wants:0,   hasData:false },
      { month:"Jul", saved:0,   goal:500, needs:0,   wants:0,   hasData:false },
      { month:"Aug", saved:0,   goal:500, needs:0,   wants:0,   hasData:false },
      { month:"Sep", saved:0,   goal:500, needs:0,   wants:0,   hasData:false },
      { month:"Oct", saved:0,   goal:500, needs:0,   wants:0,   hasData:false },
      { month:"Nov", saved:0,   goal:500, needs:0,   wants:0,   hasData:false },
      { month:"Dec", saved:0,   goal:500, needs:0,   wants:0,   hasData:false },
    ],
  },
};

const AVAILABLE_YEARS = [2024, 2025, 2026];

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) {
  const { fmt } = useCurrency();
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-[#E8E8E8] rounded-xl p-3 shadow-lg text-xs min-w-[110px]">
      <div className="font-semibold text-[#035c37] mb-1.5">{label}</div>
      {payload.map(p => (
        <div key={p.name} className="flex items-center justify-between gap-3">
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="font-semibold text-[#035c37] tabular-nums">{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

export default function SummaryDemo() {
  const { fmt } = useCurrency();
  const [selectedYear, setSelectedYear] = useState(2026);
  const d = SCENARIOS[selectedYear];
  const yearIdx = AVAILABLE_YEARS.indexOf(selectedYear);
  const canPrev = yearIdx > 0;
  const canNext = yearIdx < AVAILABLE_YEARS.length - 1;

  const isCurrent = selectedYear === 2026;
  const totalGoal = d.months.filter(m => m.hasData).reduce((s, m) => s + m.goal, 0);
  const vsGoal = d.totalSaved - totalGoal;
  const quarterEarned = [d.q1, d.q2, d.q3, d.q4];

  const activeMonths = d.months.filter(m => m.hasData);
  const chartMonths = activeMonths.map(m => ({
    month: m.month,
    Saved: m.saved,
    Goal: m.goal,
    Needs: m.needs,
    Wants: m.wants,
  }));

  // Insight: find best month for low wants spending
  const lowestWantsMonth = activeMonths.length > 1
    ? activeMonths.reduce((a, b) => b.wants < a.wants ? b : a)
    : null;
  const lowestNeedsMonth = activeMonths.length > 1
    ? activeMonths.reduce((a, b) => b.needs < a.needs ? b : a)
    : null;

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="bg-[#035c37] text-white text-center text-sm py-2 px-4">
        Demo preview — <Link to="/signup" className="underline font-medium">Sign up free</Link> to track your own summary
      </div>

      <header className="flex items-center justify-between px-6 py-3.5 bg-white border-b border-[#E8E8E8] sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <span className="text-xl">🌳</span>
          <span className="text-base font-bold text-[#035c37]">Money Tree</span>
        </div>
        <nav className="hidden md:flex items-center gap-1">
          {DEMO_NAV.map(n => (
            <Link key={n.to} to={n.to}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                n.to === "/summary-demo" ? "bg-[#e2f9f0] text-[#035c37]" : "text-[#546E7A] hover:bg-[#F5F5F5]"
              }`}
            >{n.label}</Link>
          ))}
        </nav>
        <Link to="/signup" className="text-sm bg-[#035c37] text-white px-4 py-2 rounded-lg hover:bg-[#035c37] transition font-medium">
          Get started
        </Link>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 pb-12 space-y-5">

        {/* Year nav */}
        <div className="flex items-center justify-between">
          <button onClick={() => canPrev && setSelectedYear(AVAILABLE_YEARS[yearIdx - 1])} disabled={!canPrev}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[#E8E8E8] text-[#035c37] transition disabled:opacity-30">←</button>
          <div className="text-center">
            <h1 className="text-xl font-bold text-[#035c37]">{selectedYear} {isCurrent ? "so far" : "in review"}</h1>
            <p className="text-xs text-[#607D8B] mt-0.5">{isCurrent ? `${12 - d.goalsMetCount} months remaining` : "Full year"}</p>
          </div>
          <button onClick={() => canNext && setSelectedYear(AVAILABLE_YEARS[yearIdx + 1])} disabled={!canNext}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[#E8E8E8] text-[#035c37] transition disabled:opacity-30">→</button>
        </div>

        {/* Tree + headline */}
        <motion.div key={selectedYear} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-[#E8E8E8] p-5">
          <div className="flex items-center gap-4">
            <div className="w-36 shrink-0">
              <MoneyTreeSVG monthsGoalMet={d.goalsMetCount} />
            </div>
            <div className="flex-1 space-y-2">
              <div>
                <div className="text-xs text-[#607D8B] mb-0.5">Goals hit</div>
                <div className="text-3xl font-bold text-[#035c37]">
                  {d.goalsMetCount}<span className="text-lg text-[#9E9E9E] font-normal">/12</span>
                </div>
              </div>
              <div className="w-full bg-[#E8E8E8] rounded-full h-2">
                <motion.div className="bg-[#035c37] h-2 rounded-full"
                  initial={{ width: 0 }} animate={{ width: `${(d.goalsMetCount / 12) * 100}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }} />
              </div>
              <div className="text-xs text-[#546E7A]">
                {d.goalsMetCount >= 9 ? "🔥 Outstanding" : d.goalsMetCount >= 6 ? "⭐ Good progress" : "🌱 Getting started"}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Total saved",     value: fmt(d.totalSaved), sub: vsGoal >= 0 ? `+${fmt(vsGoal)} above goal` : `${fmt(Math.abs(vsGoal))} below goal`, positive: vsGoal >= 0 },
            { label: "Best streak",     value: `${d.bestStreak} months`,     sub: d.currentStreak > 0 ? `Current: ${d.currentStreak}` : undefined, positive: true },
            { label: "Goals smashed",   value: `${d.goalsMetCount}/12`,       sub: d.goalsMetCount === 12 ? "Perfect year!" : `${12 - d.goalsMetCount} to go`, positive: d.goalsMetCount >= 6 },
            { label: "Quarterly coins", value: `${quarterEarned.filter(Boolean).length}/4`, sub: "Hit every month in a quarter", positive: quarterEarned.some(Boolean) },
          ].map((card, i) => (
            <motion.div key={card.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.06 + i * 0.05 }}
              className="bg-white rounded-xl border border-[#E8E8E8] p-4">
              <div className="text-xs text-[#607D8B] mb-1">{card.label}</div>
              <div className={`text-xl font-bold ${card.positive ? "text-[#035c37]" : "text-[#c23354]"}`}>{card.value}</div>
              {card.sub && <div className="text-xs text-[#9E9E9E] mt-0.5">{card.sub}</div>}
            </motion.div>
          ))}
        </div>

        {/* Savings bar chart */}
        {chartMonths.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
            className="bg-white rounded-2xl border border-[#E8E8E8] p-5">
            <h3 className="font-semibold text-[#035c37] text-sm mb-1">Monthly savings</h3>
            <p className="text-xs text-[#9E9E9E] mb-4">How much you put away each month vs your goal</p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartMonths} barGap={2} barSize={chartMonths.length > 6 ? 14 : 22}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F5" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#9E9E9E" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#9E9E9E" }} axisLine={false} tickLine={false}
                  tickFormatter={v => `£${v}`} width={38} />
                <Tooltip content={<ChartTooltip />} />
                <ReferenceLine y={500} stroke="#ffd23f" strokeDasharray="4 3" strokeWidth={1.5}
                  label={{ value: "Goal", position: "right", fontSize: 9, fill: "#ffd23f" }} />
                <Bar dataKey="Saved" fill="#035c37" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Spending patterns line chart */}
        {chartMonths.length > 1 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}
            className="bg-white rounded-2xl border border-[#E8E8E8] p-5">
            <h3 className="font-semibold text-[#035c37] text-sm mb-1">Spending patterns</h3>
            <p className="text-xs text-[#9E9E9E] mb-4">Needs and wants spending month by month</p>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={chartMonths}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F5" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#9E9E9E" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#9E9E9E" }} axisLine={false} tickLine={false}
                  tickFormatter={v => `£${v}`} width={38} />
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                <Line dataKey="Needs" stroke="#3bceac" strokeWidth={2} dot={{ r: 3, fill: "#3bceac" }} activeDot={{ r: 4 }} />
                <Line dataKey="Wants" stroke="#ee4266" strokeWidth={2} dot={{ r: 3, fill: "#ee4266" }} activeDot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>

            {/* Insights */}
            {lowestWantsMonth && lowestNeedsMonth && (
              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="bg-[#fde8ed] rounded-xl p-3 border border-[#ffd23f]">
                  <div className="text-[10px] text-[#c23354] font-semibold uppercase tracking-wide mb-0.5">Best Wants month</div>
                  <div className="text-sm font-bold text-[#ffd23f]">{lowestWantsMonth.month}</div>
                  <div className="text-xs text-[#c23354]">{fmt(lowestWantsMonth.wants)} spent</div>
                </div>
                <div className="bg-[#e0f9f4] rounded-xl p-3 border border-[#3bceac]">
                  <div className="text-[10px] text-[#035c37] font-semibold uppercase tracking-wide mb-0.5">Best Needs month</div>
                  <div className="text-sm font-bold text-[#0ead69]">{lowestNeedsMonth.month}</div>
                  <div className="text-xs text-[#3bceac]">{fmt(lowestNeedsMonth.needs)} spent</div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Quarterly coins */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl border border-[#E8E8E8] p-5">
          <h3 className="font-semibold text-[#035c37] mb-4 text-sm">Quarterly coins</h3>
          <div className="flex justify-around">
            {QUARTERS.map((q, i) => {
              const earned = quarterEarned[i];
              return (
                <div key={q.label} className="flex flex-col items-center gap-1.5">
                  {earned ? (
                    <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5 }}
                      className="w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow"
                      style={{ background: "linear-gradient(135deg,#ffd23f,#ee4266)" }}>🪙</motion.div>
                  ) : (
                    <div className="w-14 h-14 rounded-full border-2 border-dashed border-[#e0f9f4] bg-[#FAFAFA] flex items-center justify-center text-2xl opacity-25">🪙</div>
                  )}
                  <span className={`text-xs font-semibold ${earned ? "text-[#ffd23f]" : "text-[#9E9E9E]"}`}>{q.label}</span>
                  <span className="text-[10px] text-[#3bceac]">{q.months}</span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Monthly grid */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.36 }}
          className="bg-white rounded-2xl border border-[#E8E8E8] p-5">
          <h3 className="font-semibold text-[#035c37] mb-3 text-sm">{selectedYear} month by month</h3>
          <div className="grid grid-cols-4 gap-2">
            {d.months.map((m, i) => {
              const goalMet = m.hasData && m.saved >= m.goal;
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.38 + i * 0.02 }}
                  className={`rounded-xl p-2.5 border-2 ${
                    goalMet ? "border-[#0ead69] bg-[#e2f9f0]"
                    : m.hasData ? "border-[#E8E8E8] bg-white"
                    : "border-dashed border-[#E8E8E8] bg-[#FAFAFA]"
                  }`}
                >
                  <div className={`text-xs font-semibold mb-1 ${goalMet ? "text-[#035c37]" : "text-[#546E7A]"}`}>
                    {MONTH_NAMES[i]}
                  </div>
                  {m.hasData ? (
                    <>
                      <div className={`text-sm font-bold tabular-nums ${goalMet ? "text-[#035c37]" : "text-[#035c37]"}`}>
                        {fmt(m.saved)}
                      </div>
                      <div className={`text-[10px] mt-0.5 ${goalMet ? "text-[#0ead69]" : "text-[#ee4266]"}`}>
                        {goalMet ? "✓ Goal met" : `${fmt(m.goal - m.saved)} short`}
                      </div>
                    </>
                  ) : (
                    <div className="text-[10px] text-[#BDBDBD]">—</div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-[#e2f9f0] to-[#e2f9f0] rounded-2xl border border-[#e2f9f0] p-5 text-center">
          <div className="text-sm font-semibold text-[#035c37] mb-1">Track your own year in Money Tree</div>
          <div className="text-xs text-[#546E7A] mb-3">See your real savings, streaks, and tree grow month by month.</div>
          <Link to="/signup" className="inline-block bg-[#035c37] text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-[#035c37] transition">
            Start for free →
          </Link>
        </motion.div>

      </div>
    </div>
  );
}
