import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Month, LineItem } from "@/lib/types";

export interface MonthDetail {
  month: number;
  totalSaved: number;
  savingsGoal: number;
  goalMet: boolean;
  hasData: boolean;
}

export interface YearData {
  year: number;
  goalsMetCount: number;
  totalSaved: number;
  isCurrent: boolean;
  monthDetails: MonthDetail[];
  q1Earned: boolean;
  q2Earned: boolean;
  q3Earned: boolean;
  q4Earned: boolean;
  bullionUnlocked: boolean;
  currentStreak: number;
  bestStreak: number;
}

function calcStreaks(details: MonthDetail[], year: number): { current: number; best: number } {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  let streak = 0, best = 0;
  for (const d of details) {
    if (year === currentYear && d.month > currentMonth) break;
    if (!d.hasData) { streak = 0; continue; }
    if (d.goalMet) { streak++; if (streak > best) best = streak; }
    else streak = 0;
  }
  return { current: streak, best };
}

export function useYearData(targetYear: number) {
  const { user } = useAuth();
  const [data, setData] = useState<YearData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);

    const currentYear = new Date().getFullYear();
    const empty = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1, totalSaved: 0, savingsGoal: 500, goalMet: false, hasData: false,
    }));

    const { data: months } = await supabase
      .from("months").select("*").eq("user_id", user.id).eq("year", targetYear);

    if (!months || months.length === 0) {
      setData({
        year: targetYear, goalsMetCount: 0, totalSaved: 0,
        isCurrent: targetYear === currentYear,
        monthDetails: empty,
        q1Earned: false, q2Earned: false, q3Earned: false, q4Earned: false,
        bullionUnlocked: false, currentStreak: 0, bestStreak: 0,
      });
      setLoading(false);
      return;
    }

    const monthIds = months.map((m: Month) => m.id);
    const { data: items } = await supabase
      .from("line_items").select("month_id,amount")
      .in("month_id", monthIds).eq("section", "savings");

    const monthMap = new Map(months.map((m: Month) => [m.month, m]));
    const monthDetails: MonthDetail[] = Array.from({ length: 12 }, (_, i) => {
      const m = i + 1;
      const rec = monthMap.get(m);
      if (!rec) return { month: m, totalSaved: 0, savingsGoal: 500, goalMet: false, hasData: false };
      const saved = (items ?? [])
        .filter((it: LineItem) => it.month_id === rec.id)
        .reduce((s: number, it: LineItem) => s + it.amount, 0);
      return { month: m, totalSaved: saved, savingsGoal: rec.savings_goal, goalMet: saved >= rec.savings_goal, hasData: true };
    });

    const goalsMetCount = monthDetails.filter(d => d.goalMet).length;
    const totalSaved = monthDetails.reduce((s, d) => s + d.totalSaved, 0);
    const metSet = new Set(monthDetails.filter(d => d.goalMet).map(d => d.month));
    const q1Earned = [1, 2, 3].every(m => metSet.has(m));
    const q2Earned = [4, 5, 6].every(m => metSet.has(m));
    const q3Earned = [7, 8, 9].every(m => metSet.has(m));
    const q4Earned = [10, 11, 12].every(m => metSet.has(m));
    const { current, best } = calcStreaks(monthDetails, targetYear);

    setData({
      year: targetYear, goalsMetCount, totalSaved,
      isCurrent: targetYear === currentYear,
      monthDetails,
      q1Earned, q2Earned, q3Earned, q4Earned,
      bullionUnlocked: q1Earned && q2Earned && q3Earned && q4Earned,
      currentStreak: current, bestStreak: best,
    });
    setLoading(false);
  }, [user, targetYear]);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, refresh: fetch };
}

export function useAvailableYears() {
  const { user } = useAuth();
  const [years, setYears] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    supabase.from("months").select("year").eq("user_id", user.id).then(({ data }) => {
      const currentYear = new Date().getFullYear();
      const unique = data ? [...new Set(data.map((r: { year: number }) => r.year))] as number[] : [];
      if (!unique.includes(currentYear)) unique.push(currentYear);
      setYears(unique.sort((a, b) => a - b));
      setLoading(false);
    });
  }, [user]);

  return { years, loading };
}
