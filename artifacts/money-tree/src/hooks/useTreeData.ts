import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Month, LineItem } from "@/lib/types";

export interface MonthSummary {
  year: number;
  month: number;
  monthId: string;
  savingsGoal: number;
  totalSaved: number;
  goalMet: boolean;
}

export interface TreeData {
  currentYear: number;
  monthlySummaries: MonthSummary[];
  goalsMetThisYear: number;
  currentStreak: number;
  bestStreak: number;
  q1Earned: boolean;
  q2Earned: boolean;
  q3Earned: boolean;
  q4Earned: boolean;
  bullionUnlocked: boolean;
  totalSavedThisYear: number;
}

function calcStreak(summaries: MonthSummary[]): { current: number; best: number } {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const sorted = [...summaries].sort((a, b) => a.month - b.month);

  let current = 0;
  let best = 0;
  let streak = 0;

  for (const s of sorted) {
    if (s.year > currentYear || (s.year === currentYear && s.month > currentMonth)) break;
    if (s.goalMet) {
      streak++;
      if (streak > best) best = streak;
    } else {
      streak = 0;
    }
  }
  current = streak;

  return { current, best };
}

export function useTreeData() {
  const { user } = useAuth();
  const [data, setData] = useState<TreeData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);

    const currentYear = new Date().getFullYear();

    const { data: months } = await supabase
      .from("months")
      .select("*")
      .eq("user_id", user.id)
      .eq("year", currentYear);

    if (!months || months.length === 0) {
      setData({
        currentYear,
        monthlySummaries: [],
        goalsMetThisYear: 0,
        currentStreak: 0,
        bestStreak: 0,
        q1Earned: false, q2Earned: false, q3Earned: false, q4Earned: false,
        bullionUnlocked: false,
        totalSavedThisYear: 0,
      });
      setLoading(false);
      return;
    }

    const monthIds = months.map((m: Month) => m.id);

    // savings = explicit savings bucket line items (Emergency fund, ISA, etc.)
    const { data: items } = await supabase
      .from("line_items")
      .select("*")
      .in("month_id", monthIds)
      .eq("section", "savings");

    const summaries: MonthSummary[] = months.map((m: Month) => {
      const monthItems = (items as LineItem[] ?? []).filter(i => i.month_id === m.id);
      const totalSaved = monthItems.reduce((s, i) => s + i.amount, 0);
      return {
        year: m.year,
        month: m.month,
        monthId: m.id,
        savingsGoal: m.savings_goal,
        totalSaved,
        goalMet: totalSaved >= m.savings_goal,
      };
    });

    const goalsMetThisYear = summaries.filter(s => s.goalMet).length;
    const totalSavedThisYear = summaries.reduce((s, m) => s + m.totalSaved, 0);

    const { current, best } = calcStreak(summaries);

    const metMonths = new Set(summaries.filter(s => s.goalMet).map(s => s.month));
    const q1Earned = [1, 2, 3].every(m => metMonths.has(m));
    const q2Earned = [4, 5, 6].every(m => metMonths.has(m));
    const q3Earned = [7, 8, 9].every(m => metMonths.has(m));
    const q4Earned = [10, 11, 12].every(m => metMonths.has(m));
    const bullionUnlocked = q1Earned && q2Earned && q3Earned && q4Earned;

    setData({
      currentYear,
      monthlySummaries: summaries,
      goalsMetThisYear,
      currentStreak: current,
      bestStreak: Math.max(best, current),
      q1Earned, q2Earned, q3Earned, q4Earned,
      bullionUnlocked,
      totalSavedThisYear,
    });
    setLoading(false);
  }, [user]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, refresh: fetch };
}
