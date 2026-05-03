import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation, useParams } from "wouter";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, ReferenceLine, CartesianGrid, Legend,
} from "recharts";
import { AppLayout } from "@/components/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { MoneyTreeSVG } from "@/components/MoneyTreeSVG";
import { useYearData, useAvailableYears } from "@/hooks/useYearData";
import { useCurrency } from "@/contexts/CurrencyContext";

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const QUARTERS = [
  { label:"Q1", months:"Jan–Mar", q:"q1Earned" as const },
  { label:"Q2", months:"Apr–Jun", q:"q2Earned" as const },
  { label:"Q3", months:"Jul–Sep", q:"q3Earned" as const },
  { label:"Q4", months:"Oct–Dec", q:"q4Earned" as const },
];

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) {
  const { fmt } = useCurrency();
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-[#E8E8E8] rounded-xl p-3 shadow-lg text-xs min-w-[110px]">
      <div className="font-semibold text-[#1B5E20] mb-1.5">{label}</div>
      {payload.map(p => (
        <div key={p.name} className="flex items-center justify-between gap-3">
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="font-semibold text-[#1B5E20] tabular-nums">{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

function SummaryContent() {
  const { fmt } = useCurrency();
  const [, navigate] = useLocation();
  const params = useParams<{ year?: string }>();
  const currentYear = new Date().getFullYear();
  const urlYear = params.year ? parseInt(params.year) : null;
  const [selectedYear, setSelectedYear] = useState(urlYear ?? currentYear);
  const { years } = useAvailableYears();

  useEffect(() => {
    if (urlYear && urlYear !== selectedYear) setSelectedYear(urlYear);
  }, [urlYear]);
  const { data, loading } = useYearData(selectedYear);

  const yearIdx = years.indexOf(selectedYear);
  const canPrev = yearIdx > 0;
  const canNext = yearIdx < years.length - 1;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 rounded-full border-4 border-[#2E7D32] border-t-transparent animate-spin" />
      </div>
    );
  }

  const totalSaved = data?.totalSaved ?? 0;
  const goalsMetCount = data?.goalsMetCount ?? 0;
  const bestStreak = data?.bestStreak ?? 0;
  const currentStreak = data?.currentStreak ?? 0;
  const monthDetails = data?.monthDetails ?? [];
  const isCurrent = data?.isCurrent ?? true;

  // Calculate how much above/below total goal
  const totalGoal = monthDetails.filter(d => d.hasData).reduce((s, d) => s + d.savingsGoal, 0);
  const vsGoal = totalSaved - totalGoal;

  // Chart data — only months with actual data
  const activeMonths = monthDetails.filter(d => d.hasData);
  const chartMonths = activeMonths.map(d => ({
    month: MONTH_NAMES[d.month - 1],
    Saved: d.totalSaved,
    Goal: d.savingsGoal,
    Needs: d.needsTotal,
    Wants: d.wantsTotal,
  }));

  // Spending insights
  const lowestWantsMonth = activeMonths.length > 1 ? activeMonths.reduce((a, b) => b.wantsTotal < a.wantsTotal ? b : a) : null;
  const lowestNeedsMonth = activeMonths.length > 1 ? activeMonths.reduce((a, b) => b.needsTotal < a.needsTotal ? b : a) : null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-16 space-y-5">
      {/* Year navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => canPrev && setSelectedYear(years[yearIdx - 1])}
          disabled={!canPrev}
          className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[#E8E8E8] text-[#2E7D32] transition disabled:opacity-30"
        >
          ←
        </button>
        <div className="text-center">
          <h1 className="text-xl font-bold text-[#1B5E20]">
            {selectedYear} {isCurrent ? "so far" : "in review"}
          </h1>
          <p className="text-xs text-[#607D8B] mt-0.5">
            {isCurrent ? `${12 - goalsMetCount} months remaining` : "Full year"}
          </p>
        </div>
        <button
          onClick={() => canNext && setSelectedYear(years[yearIdx + 1])}
          disabled={!canNext}
          className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[#E8E8E8] text-[#2E7D32] transition disabled:opacity-30"
        >
          →
        </button>
      </div>

      {/* Tree + headline */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-[#E8E8E8] p-5"
      >
        <div className="flex items-center gap-4">
          <div className="w-36 shrink-0">
            <MoneyTreeSVG monthsGoalMet={goalsMetCount} />
          </div>
          <div className="flex-1 space-y-2">
            <div>
              <div className="text-xs text-[#607D8B] mb-0.5">Goals hit</div>
              <div className="text-3xl font-bold text-[#2E7D32]">
                {goalsMetCount}<span className="text-lg text-[#9E9E9E] font-normal">/12</span>
              </div>
            </div>
            <div className="w-full bg-[#E8E8E8] rounded-full h-2">
              <motion.div
                className="bg-[#2E7D32] h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(goalsMetCount / 12) * 100}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
            <div className="text-xs text-[#546E7A]">
              {goalsMetCount === 12 ? "🏆 Perfect year!" : goalsMetCount >= 9 ? "🔥 Outstanding" : goalsMetCount >= 6 ? "⭐ Good progress" : goalsMetCount >= 3 ? "🌱 Getting started" : "🌱 Early days"}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Big stat cards */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Total saved", value: fmt(totalSaved), sub: totalGoal > 0 ? (vsGoal >= 0 ? `+${fmt(vsGoal)} above goal` : `${fmt(Math.abs(vsGoal))} below goal`) : undefined, positive: vsGoal >= 0 },
          { label: "Best streak", value: `${bestStreak} month${bestStreak !== 1 ? "s" : ""}`, sub: currentStreak > 0 ? `Current: ${currentStreak}` : undefined, positive: true },
          { label: "Goals smashed", value: `${goalsMetCount}/12`, sub: goalsMetCount === 12 ? "Perfect year!" : `${12 - goalsMetCount} to go`, positive: goalsMetCount >= 6 },
          { label: data?.bullionUnlocked ? "Gold bullion" : "Quarterly coins", value: data?.bullionUnlocked ? "🏆 Unlocked!" : `${[data?.q1Earned, data?.q2Earned, data?.q3Earned, data?.q4Earned].filter(Boolean).length}/4`, sub: data?.bullionUnlocked ? "All 4 coins earned" : "Hit every month in a quarter", positive: !!data?.bullionUnlocked },
        ].map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06 + i * 0.05 }}
            className="bg-white rounded-xl border border-[#E8E8E8] p-4"
          >
            <div className="text-xs text-[#607D8B] mb-1">{card.label}</div>
            <div className={`text-xl font-bold ${card.positive ? "text-[#2E7D32]" : "text-[#c05a00]"}`}>{card.value}</div>
            {card.sub && <div className="text-xs text-[#9E9E9E] mt-0.5">{card.sub}</div>}
          </motion.div>
        ))}
      </div>

      {/* Monthly savings bar chart */}
      {chartMonths.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="bg-white rounded-2xl border border-[#E8E8E8] p-5"
        >
          <h3 className="font-semibold text-[#1B5E20] text-sm mb-1">Monthly savings</h3>
          <p className="text-xs text-[#9E9E9E] mb-4">How much you put away each month vs your goal</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartMonths} barGap={2} barSize={chartMonths.length > 6 ? 14 : 22}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F5" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#9E9E9E" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#9E9E9E" }} axisLine={false} tickLine={false}
                tickFormatter={v => fmt(v)} width={48} />
              <Tooltip content={<ChartTooltip />} />
              <ReferenceLine y={chartMonths[0]?.Goal ?? 500} stroke="#FFD700" strokeDasharray="4 3" strokeWidth={1.5}
                label={{ value: "Goal", position: "right", fontSize: 9, fill: "#D4AF37" }} />
              <Bar dataKey="Saved" fill="#2E7D32" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Spending patterns line chart */}
      {chartMonths.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24 }}
          className="bg-white rounded-2xl border border-[#E8E8E8] p-5"
        >
          <h3 className="font-semibold text-[#1B5E20] text-sm mb-1">Spending patterns</h3>
          <p className="text-xs text-[#9E9E9E] mb-4">Needs and wants spending month by month</p>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={chartMonths}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F5" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#9E9E9E" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#9E9E9E" }} axisLine={false} tickLine={false}
                tickFormatter={v => fmt(v)} width={48} />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
              <Line dataKey="Needs" stroke="#1565C0" strokeWidth={2} dot={{ r: 3, fill: "#1565C0" }} activeDot={{ r: 4 }} />
              <Line dataKey="Wants" stroke="#E65100" strokeWidth={2} dot={{ r: 3, fill: "#E65100" }} activeDot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>

          {/* Spending insights */}
          {lowestWantsMonth && lowestNeedsMonth && (
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="bg-[#FFF3E0] rounded-xl p-3 border border-[#f0e0a0]">
                <div className="text-[10px] text-[#9a7020] font-semibold uppercase tracking-wide mb-0.5">Best Wants month</div>
                <div className="text-sm font-bold text-[#D4AF37]">{MONTH_NAMES[lowestWantsMonth.month - 1]}</div>
                <div className="text-xs text-[#b08030]">{fmt(lowestWantsMonth.wantsTotal)} spent</div>
              </div>
              <div className="bg-[#E3F2FD] rounded-xl p-3 border border-[#c0d8f0]">
                <div className="text-[10px] text-[#2a5080] font-semibold uppercase tracking-wide mb-0.5">Best Needs month</div>
                <div className="text-sm font-bold text-[#3a70b0]">{MONTH_NAMES[lowestNeedsMonth.month - 1]}</div>
                <div className="text-xs text-[#4a80c0]">{fmt(lowestNeedsMonth.needsTotal)} spent</div>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Quarterly coins */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl border border-[#E8E8E8] p-5"
      >
        <h3 className="font-semibold text-[#1B5E20] mb-4 text-sm">Quarterly coins</h3>
        <div className="flex justify-around">
          {QUARTERS.map((q, i) => {
            const earned = data?.[q.q] ?? false;
            return (
              <motion.div
                key={q.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 + i * 0.06 }}
                className="flex flex-col items-center gap-1.5"
              >
                {earned ? (
                  <motion.div
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", bounce: 0.5 }}
                    className="w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow"
                    style={{ background: "linear-gradient(135deg,#FFD700,#FFA500)" }}
                  >🪙</motion.div>
                ) : (
                  <div className="w-14 h-14 rounded-full border-2 border-dashed border-[#d0e0d0] bg-[#FAFAFA] flex items-center justify-center text-2xl opacity-25">🪙</div>
                )}
                <span className={`text-xs font-semibold ${earned ? "text-[#D4AF37]" : "text-[#9E9E9E]"}`}>{q.label}</span>
                <span className="text-[10px] text-[#b0c0b0]">{q.months}</span>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Monthly breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.28 }}
        className="bg-white rounded-2xl border border-[#E8E8E8] p-5"
      >
        <h3 className="font-semibold text-[#1B5E20] mb-3 text-sm">{selectedYear} month by month</h3>
        <div className="grid grid-cols-4 gap-2">
          {monthDetails.map((d, i) => {
            const isCurrentMonth = isCurrent && d.month === new Date().getMonth() + 1;
            return (
              <motion.button
                key={d.month}
                whileHover={{ scale: 1.04 }}
                onClick={() => navigate(`/budget/${selectedYear}/${d.month}`)}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.025 }}
                className={`rounded-xl p-2.5 text-left border-2 transition ${
                  isCurrentMonth ? "border-[#FFD700] shadow-sm bg-white"
                  : d.goalMet ? "border-[#4CAF50] bg-[#f0faf0]"
                  : d.hasData ? "border-[#E8E8E8] bg-white"
                  : "border-dashed border-[#E8E8E8] bg-[#FAFAFA]"
                }`}
              >
                <div className={`text-xs font-semibold mb-1 ${d.goalMet ? "text-[#2E7D32]" : "text-[#546E7A]"}`}>
                  {MONTH_NAMES[i]}
                </div>
                {d.hasData ? (
                  <>
                    <div className={`text-sm font-bold tabular-nums ${d.goalMet ? "text-[#2E7D32]" : "text-[#1B5E20]"}`}>
                      {fmt(d.totalSaved)}
                    </div>
                    <div className={`text-[10px] mt-0.5 ${d.goalMet ? "text-[#4a8a4a]" : "text-[#c06060]"}`}>
                      {d.goalMet ? "✓ Goal met" : `${fmt(d.savingsGoal - d.totalSaved)} short`}
                    </div>
                  </>
                ) : (
                  <div className="text-[10px] text-[#BDBDBD]">—</div>
                )}
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Navigate to garden */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.45 }}
        onClick={() => navigate("/garden")}
        className="w-full py-3 bg-[#F5F5F5] border border-[#c8e4c8] rounded-xl text-sm font-medium text-[#2E7D32] hover:bg-[#e4f5e4] transition"
      >
        🌳 View your garden →
      </motion.button>
    </div>
  );
}

export default function SummaryPage() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <SummaryContent />
      </AppLayout>
    </ProtectedRoute>
  );
}
