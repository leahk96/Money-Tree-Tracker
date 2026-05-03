import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { AppLayout } from "@/components/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { MoneyTreeSVG } from "@/components/MoneyTreeSVG";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Month, LineItem } from "@/lib/types";

interface GardenYearData {
  year: number;
  goalsMetCount: number;
  totalSaved: number;
  isCurrent: boolean;
  hasData: boolean;
}

function useGardenData() {
  const { user } = useAuth();
  const [yearData, setYearData] = useState<GardenYearData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }

    (async () => {
      const currentYear = new Date().getFullYear();

      // Get all months across all years
      const { data: months } = await supabase
        .from("months").select("id,year,month,savings_goal").eq("user_id", user.id);

      if (!months || months.length === 0) {
        setYearData([{
          year: currentYear, goalsMetCount: 0, totalSaved: 0,
          isCurrent: true, hasData: false,
        }]);
        setLoading(false);
        return;
      }

      // Get all savings line items
      const monthIds = months.map((m: Month) => m.id);
      const { data: items } = await supabase
        .from("line_items").select("month_id,amount")
        .in("month_id", monthIds).eq("section", "savings");

      // Group by year
      const yearsMap = new Map<number, { goalsMetCount: number; totalSaved: number }>();
      const uniqueYears = [...new Set(months.map((m: Month) => m.year))];

      for (const year of uniqueYears) {
        const yearMonths = months.filter((m: Month) => m.year === year);
        let goalsMetCount = 0;
        let totalSaved = 0;
        for (const m of yearMonths) {
          const saved = (items ?? [])
            .filter((it: LineItem) => it.month_id === m.id)
            .reduce((s: number, it: LineItem) => s + it.amount, 0);
          totalSaved += saved;
          if (saved >= m.savings_goal) goalsMetCount++;
        }
        yearsMap.set(year, { goalsMetCount, totalSaved });
      }

      // Build list: all data years + current year if not present
      const allYears = [...uniqueYears];
      if (!allYears.includes(currentYear)) allYears.push(currentYear);
      allYears.sort((a, b) => a - b);

      const result: GardenYearData[] = allYears.map(year => ({
        year,
        goalsMetCount: yearsMap.get(year)?.goalsMetCount ?? 0,
        totalSaved: yearsMap.get(year)?.totalSaved ?? 0,
        isCurrent: year === currentYear,
        hasData: yearsMap.has(year),
      }));

      setYearData(result);
      setLoading(false);
    })();
  }, [user]);

  return { yearData, loading };
}

function EmptyPlot({ year }: { year: number }) {
  return (
    <div className="flex flex-col items-center gap-2 opacity-40">
      <div className="w-full aspect-square flex items-center justify-center">
        <svg viewBox="0 0 360 348" className="w-full max-w-[120px] mx-auto">
          {/* Empty pot */}
          <ellipse cx={180} cy={334} rx={52} ry={7} fill="#7a3c10" opacity={0.08} />
          <path d="M149 272 L157 304 Q180 314 203 304 L211 272 Z" fill="#c07838" opacity={0.5} />
          <rect x={141} y={265} width={78} height={12} rx={5} fill="#9e5e26" opacity={0.5} />
          <ellipse cx={180} cy={271} rx={34} ry={6} fill="#4a2810" opacity={0.5} />
        </svg>
      </div>
      <div className="text-center">
        <div className="text-xs font-semibold text-[#9E9E9E]">{year}</div>
        <div className="text-[10px] text-[#BDBDBD] mt-0.5">Not started</div>
      </div>
    </div>
  );
}

function TreePlot({ d, onClick }: { d: GardenYearData; onClick: () => void }) {
  const { fmt } = useCurrency();
  const isFullYear = !d.isCurrent;
  const badge = d.goalsMetCount === 12 ? "🏆" : d.goalsMetCount >= 9 ? "⭐" : null;

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.04, y: -3 }}
      whileTap={{ scale: 0.97 }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition w-full ${
        d.isCurrent
          ? "bg-white border-2 border-[#ffd449] shadow-md"
          : "bg-white border border-[#E8E8E8] hover:border-[#548c2f]"
      }`}
    >
      {d.isCurrent && (
        <span className="text-[10px] font-bold text-[#d4880a] bg-[#fff5c0] border border-[#ffd449] rounded-full px-2 py-0.5 -mb-1">
          GROWING NOW
        </span>
      )}
      <div className="w-full">
        <MoneyTreeSVG monthsGoalMet={d.goalsMetCount} />
      </div>
      <div className="text-center w-full">
        <div className="flex items-center justify-center gap-1">
          <span className="text-sm font-bold text-[#104911]">{d.year}</span>
          {badge && <span className="text-sm">{badge}</span>}
        </div>
        {d.hasData ? (
          <>
            <div className="text-[11px] text-[#265a27] font-semibold mt-0.5">
              {d.goalsMetCount}/12 goals
            </div>
            <div className="text-[10px] text-[#607D8B]">
              {fmt(d.totalSaved)} saved
            </div>
          </>
        ) : (
          <div className="text-[10px] text-[#9E9E9E] mt-0.5">Tap to start</div>
        )}
        {isFullYear && (
          <div className="text-[9px] text-[#9E9E9E] mt-0.5 uppercase tracking-wide">
            Year complete
          </div>
        )}
      </div>
    </motion.button>
  );
}

function GardenContent() {
  const { fmt } = useCurrency();
  const [, navigate] = useLocation();
  const { yearData, loading } = useGardenData();
  const currentYear = new Date().getFullYear();

  // Show current + past years, plus 2 future "coming soon" spots
  const futureYears = [currentYear + 1, currentYear + 2].filter(
    y => !yearData.some(d => d.year === y)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 rounded-full border-4 border-[#265a27] border-t-transparent animate-spin" />
      </div>
    );
  }

  const completedYears = yearData.filter(d => !d.isCurrent);
  const currentData = yearData.find(d => d.isCurrent);
  const totalSavedAllTime = yearData.reduce((s, d) => s + d.totalSaved, 0);
  const totalGoalsAllTime = yearData.reduce((s, d) => s + d.goalsMetCount, 0);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-16 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-[#104911]">My Garden</h1>
        <p className="text-xs text-[#607D8B] mt-0.5">
          Every year you use Money Tree, a new tree grows in your garden.
        </p>
      </div>

      {/* All-time stats */}
      {yearData.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-3 gap-2"
        >
          {[
            { label: "Years active", value: String(yearData.length) },
            { label: "Goals hit", value: `${totalGoalsAllTime}` },
            { label: "All-time saved", value: fmt(totalSavedAllTime) },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-[#E8E8E8] p-3 text-center">
              <div className="text-base font-bold text-[#265a27]">{s.value}</div>
              <div className="text-[10px] text-[#607D8B] mt-0.5">{s.label}</div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Garden grid */}
      <div>
        {/* Current year — prominent */}
        {currentData && (
          <div className="mb-4">
            <div className="text-xs font-semibold text-[#546E7A] uppercase tracking-wider mb-2">
              This year
            </div>
            <div className="max-w-[200px]">
              <TreePlot d={currentData} onClick={() => navigate(`/summary`)} />
            </div>
          </div>
        )}

        {/* Past years */}
        {completedYears.length > 0 && (
          <div className="mb-4">
            <div className="text-xs font-semibold text-[#546E7A] uppercase tracking-wider mb-2">
              Past years
            </div>
            <div className="grid grid-cols-3 gap-3">
              {completedYears.map(d => (
                <TreePlot
                  key={d.year}
                  d={d}
                  onClick={() => navigate(`/summary/${d.year}`)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Future spots */}
        <div>
          <div className="text-xs font-semibold text-[#546E7A] uppercase tracking-wider mb-2">
            Future plots
          </div>
          <div className="grid grid-cols-3 gap-3">
            {futureYears.map(year => (
              <EmptyPlot key={year} year={year} />
            ))}
            <div className="flex flex-col items-center gap-2 opacity-20">
              <div className="w-full aspect-square flex items-center justify-center">
                <div className="w-16 h-16 rounded-full border-2 border-dashed border-[#9E9E9E] flex items-center justify-center text-2xl text-[#9E9E9E]">
                  +
                </div>
              </div>
              <div className="text-[10px] text-[#c8d8a0] text-center">And more…</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-r from-[#f0f7e8] to-[#ebf5df] rounded-2xl border border-[#d4e8b8] p-5 text-center"
      >
        <div className="text-2xl mb-2">🌳</div>
        <div className="text-sm font-semibold text-[#104911]">Keep coming back year after year</div>
        <div className="text-xs text-[#546E7A] mt-1">
          Each year you save, a new tree joins your garden. Build a forest over time.
        </div>
      </motion.div>
    </div>
  );
}

export default function GardenPage() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <GardenContent />
      </AppLayout>
    </ProtectedRoute>
  );
}
