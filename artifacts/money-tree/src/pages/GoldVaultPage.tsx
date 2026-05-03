import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AppLayout } from "@/components/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Month, LineItem } from "@/lib/types";

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const EXPENSE_SECTIONS = ["bills","needs","wants","debt"];
const DUAL_AMOUNT_SECTIONS = ["needs","wants"];

type Tier = "standard" | "premium" | "legendary";

interface GoldBar {
  monthId: string;
  year: number;
  month: number;
  savedAmount: number;
  savingsGoal: number;
  overshoot: number;
  tier: Tier;
}

function computeSavedForMonth(items: LineItem[], monthId: string): number {
  const mi = items.filter(i => i.month_id === monthId);
  const income = mi.filter(i => i.section === "income").reduce((a, i) => a + i.amount, 0);
  const expenses = mi.filter(i => EXPENSE_SECTIONS.includes(i.section)).reduce((a, i) => {
    const amt = DUAL_AMOUNT_SECTIONS.includes(i.section) && i.actual_amount != null
      ? i.actual_amount : i.amount;
    return a + amt;
  }, 0);
  return income - expenses;
}

function computeCurrentStreak(bars: GoldBar[]): number {
  if (bars.length === 0) return 0;
  const sorted = [...bars].sort((a, b) => a.year !== b.year ? a.year - b.year : a.month - b.month);
  let max = 1; let cur = 1;
  for (let i = 1; i < sorted.length; i++) {
    const p = sorted[i - 1]; const c = sorted[i];
    const consecutive =
      (c.year === p.year && c.month === p.month + 1) ||
      (c.year === p.year + 1 && p.month === 12 && c.month === 1);
    if (consecutive) { cur++; max = Math.max(max, cur); } else { cur = 1; }
  }
  return max;
}

function useVaultData() {
  const { user } = useAuth();
  const [bars, setBars] = useState<GoldBar[]>([]);
  const [totalSaved, setTotalSaved] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    (async () => {
      const { data: months } = await supabase
        .from("months").select("id,year,month,savings_goal").eq("user_id", user.id);
      if (!months || months.length === 0) { setLoading(false); return; }

      const monthIds = (months as Month[]).map(m => m.id);
      const { data: items } = await supabase
        .from("line_items")
        .select("month_id,section,amount,actual_amount")
        .in("month_id", monthIds);

      const earned: GoldBar[] = [];
      let tally = 0;
      for (const m of months as Month[]) {
        if (!m.savings_goal || m.savings_goal <= 0) continue;
        const saved = computeSavedForMonth((items ?? []) as LineItem[], m.id);
        if (saved >= m.savings_goal) {
          const overshoot = saved / m.savings_goal;
          earned.push({
            monthId: m.id, year: m.year, month: m.month,
            savedAmount: saved, savingsGoal: m.savings_goal, overshoot,
            tier: overshoot >= 2 ? "legendary" : overshoot >= 1.5 ? "premium" : "standard",
          });
          tally += saved;
        }
      }
      earned.sort((a, b) => b.year !== a.year ? b.year - a.year : b.month - a.month);
      setBars(earned);
      setTotalSaved(tally);
      setLoading(false);
    })();
  }, [user]);

  return { bars, totalSaved, loading };
}

// ── 3-D gold ingot SVG ─────────────────────────────────────────────────────
function GoldIngot({ tier, index = 0 }: { tier: Tier; index?: number }) {
  const uid = `gi-${tier}-${index}`;

  const TOP_LIGHT  = tier === "legendary" ? "#fffef5" : tier === "premium" ? "#fff8cc" : "#ffe566";
  const TOP_DARK   = tier === "legendary" ? "#f5d020" : tier === "premium" ? "#e8b800" : "#c8920a";
  const FRONT_TOP  = tier === "legendary" ? "#daa520" : tier === "premium" ? "#c89000" : "#b87800";
  const FRONT_BOT  = tier === "legendary" ? "#8b6000" : tier === "premium" ? "#7a5200" : "#6b4400";
  const SIDE       = tier === "legendary" ? "#7a5200" : tier === "premium" ? "#6b4400" : "#5a3800";
  const STAMP      = tier === "legendary" ? "#5a3800" : "#4a2c00";

  return (
    <svg viewBox="0 0 140 90" className="w-full h-full" style={{ filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.25))" }}>
      <defs>
        <linearGradient id={`${uid}-top`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor={TOP_LIGHT} />
          <stop offset="60%"  stopColor={TOP_DARK} />
          <stop offset="100%" stopColor={FRONT_TOP} />
        </linearGradient>
        <linearGradient id={`${uid}-front`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor={FRONT_TOP} />
          <stop offset="100%" stopColor={FRONT_BOT} />
        </linearGradient>
        <linearGradient id={`${uid}-side`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor={SIDE} />
          <stop offset="100%" stopColor={FRONT_BOT} />
        </linearGradient>
        {tier === "legendary" && (
          <filter id={`${uid}-glow`}>
            <feGaussianBlur stdDeviation="2" result="blur"/>
            <feComposite in="SourceGraphic" in2="blur" operator="over"/>
          </filter>
        )}
      </defs>

      {/* Right side face */}
      <polygon
        points="108,22 124,30 124,68 108,60"
        fill={`url(#${uid}-side)`}
      />
      {/* Front face — main body */}
      <polygon
        points="16,30 108,22 108,60 16,68"
        fill={`url(#${uid}-front)`}
      />
      {/* Inner recess on front (emboss frame) */}
      <polygon
        points="24,34 100,27 100,55 24,63"
        fill="none"
        stroke={FRONT_BOT}
        strokeWidth="1"
        opacity="0.5"
      />
      {/* Top face */}
      <polygon
        points="28,14 124,22 108,30 16,22"
        fill={`url(#${uid}-top)`}
      />
      {/* Top face inner depression */}
      <polygon
        points="42,17 110,24 100,28 30,21"
        fill={FRONT_TOP}
        opacity="0.25"
      />
      {/* Shine highlight on top */}
      <ellipse cx="50" cy="19" rx="14" ry="3.5"
        fill="white" opacity={tier === "legendary" ? 0.6 : tier === "premium" ? 0.45 : 0.3}
        transform="rotate(-10 50 19)"
      />
      {/* Second shine line */}
      <ellipse cx="44" cy="16" rx="5" ry="1.5"
        fill="white" opacity={tier === "legendary" ? 0.7 : 0.4}
        transform="rotate(-10 44 16)"
      />
      {/* Center stamp text on front face */}
      <text
        x="62" y="44"
        textAnchor="middle"
        fontSize="11"
        fontFamily="Georgia, serif"
        fontWeight="bold"
        fill={STAMP}
        letterSpacing="2"
        opacity="0.85"
      >
        MT
      </text>
      {/* Weight line under MT */}
      <line x1="47" y1="48" x2="77" y2="48" stroke={STAMP} strokeWidth="0.7" opacity="0.5" />

      {/* Legendary sparkles */}
      {tier === "legendary" && (
        <>
          <circle cx="18" cy="20" r="1.5" fill="#fffef5" opacity="0.8" />
          <circle cx="126" cy="26" r="1" fill="#fffef5" opacity="0.6" />
          <circle cx="110" cy="62" r="1.2" fill="#fffef5" opacity="0.5" />
        </>
      )}
      {/* Premium shimmer stripe */}
      {tier === "premium" && (
        <polygon
          points="28,14 50,16 36,22 16,20"
          fill="white"
          opacity="0.12"
        />
      )}
    </svg>
  );
}

// ── Tier badge ─────────────────────────────────────────────────────────────
function TierBadge({ tier }: { tier: Tier }) {
  if (tier === "legendary") return (
    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#7a5200] text-[#ffe566] border border-[#daa520]">LEGENDARY</span>
  );
  if (tier === "premium") return (
    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#e8f5e9] text-[#2e7d32] border border-[#4caf50]">PREMIUM</span>
  );
  return null;
}

// ── Empty vault ────────────────────────────────────────────────────────────
function EmptyVault() {
  return (
    <div className="flex flex-col items-center gap-5 py-20 text-center">
      <div className="w-28 h-20 opacity-20">
        <GoldIngot tier="standard" />
      </div>
      <div>
        <p className="text-lg font-semibold text-[#b8860b]">Your vault is empty</p>
        <p className="text-sm text-[#BDBDBD] mt-1 max-w-xs">
          Hit your monthly savings goal to earn your first gold bar
        </p>
      </div>
      <div className="mt-2 grid grid-cols-3 gap-3 text-center opacity-40 max-w-xs w-full">
        {(["standard","premium","legendary"] as Tier[]).map(t => (
          <div key={t} className="flex flex-col items-center gap-1">
            <div className="w-full aspect-[14/9]"><GoldIngot tier={t} /></div>
            <div className="text-[9px] text-[#9a7520] capitalize">{t}</div>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-[#BDBDBD]">Exceed 150% = Premium · Exceed 200% = Legendary</p>
    </div>
  );
}

// ── Main content ───────────────────────────────────────────────────────────
function GoldVaultContent() {
  const { fmt } = useCurrency();
  const { bars, totalSaved, loading } = useVaultData();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 rounded-full border-4 border-[#DAA520] border-t-transparent animate-spin" />
      </div>
    );
  }

  const bestBar = bars.reduce<GoldBar | null>((best, b) => !best || b.savedAmount > best.savedAmount ? b : best, null);
  const streak = computeCurrentStreak(bars);
  const legendaryCount = bars.filter(b => b.tier === "legendary").length;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 pb-10">

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-14 h-10 shrink-0">
          <GoldIngot tier="legendary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#7a5500]">Gold Vault</h1>
          <p className="text-sm text-[#9a7520]">A bar for every month you hit your savings goal</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <div className="col-span-2 sm:col-span-1 bg-gradient-to-br from-[#fffde0] to-[#fff3b0] rounded-2xl p-4 border border-[#ffe066] shadow-sm text-center">
          <div className="text-4xl font-black text-[#7a5500] leading-none">{bars.length}</div>
          <div className="text-xs text-[#9a7520] font-semibold mt-1">Bars collected</div>
        </div>
        <div className="bg-gradient-to-br from-[#fffde0] to-[#fff3b0] rounded-2xl p-4 border border-[#ffe066] shadow-sm text-center">
          <div className="text-lg font-black text-[#7a5500] tabular-nums leading-tight">{fmt(totalSaved)}</div>
          <div className="text-xs text-[#9a7520] font-semibold mt-1">Total saved</div>
        </div>
        <div className="bg-gradient-to-br from-[#fffde0] to-[#fff3b0] rounded-2xl p-4 border border-[#ffe066] shadow-sm text-center">
          <div className="text-3xl font-black text-[#7a5500] leading-none">{streak}</div>
          <div className="text-xs text-[#9a7520] font-semibold mt-1">Best streak</div>
        </div>
        <div className="bg-gradient-to-br from-[#fffde0] to-[#fff3b0] rounded-2xl p-4 border border-[#ffe066] shadow-sm text-center">
          <div className="text-3xl font-black text-[#7a5500] leading-none">{legendaryCount}</div>
          <div className="text-xs text-[#9a7520] font-semibold mt-1">Legendary</div>
        </div>
      </div>

      {/* Best bar callout */}
      {bestBar && (
        <div className="flex items-center gap-3 bg-white border border-[#ffe066] rounded-2xl px-4 py-3 mb-6 shadow-sm">
          <div className="w-16 h-11 shrink-0">
            <GoldIngot tier={bestBar.tier} />
          </div>
          <div>
            <div className="text-xs font-bold text-[#9a7520] uppercase tracking-wide">Best month</div>
            <div className="text-sm font-bold text-[#7a5500]">
              {MONTH_NAMES[bestBar.month - 1]} {bestBar.year} — {fmt(bestBar.savedAmount)} saved
            </div>
            <div className="text-xs text-[#b8a060]">
              {Math.round(bestBar.overshoot * 100)}% of your {fmt(bestBar.savingsGoal)} goal
            </div>
          </div>
        </div>
      )}

      {/* Tier legend */}
      {bars.length > 0 && (
        <div className="flex items-center gap-4 mb-5 text-[10px] text-[#9a7520]">
          <span className="font-semibold">Tiers:</span>
          <span>Standard = goal met</span>
          <span className="text-[#2e7d32] font-semibold">Premium = 150%+</span>
          <span className="text-[#daa520] font-semibold">Legendary = 200%+</span>
        </div>
      )}

      {bars.length === 0 ? <EmptyVault /> : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-x-4 gap-y-5">
          {bars.map((bar, i) => (
            <motion.div
              key={bar.monthId}
              initial={{ opacity: 0, y: 18, scale: 0.88 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: Math.min(i * 0.045, 0.6), duration: 0.3, ease: "easeOut" }}
              whileHover={{ y: -5, scale: 1.06 }}
              className="flex flex-col items-center gap-1"
            >
              <div className="w-full" style={{ aspectRatio: "14/9" }}>
                <GoldIngot tier={bar.tier} index={i} />
              </div>
              <div className="text-center w-full">
                <div className="text-[11px] font-bold text-[#7a5500] leading-tight">
                  {MONTH_NAMES[bar.month - 1]} {bar.year}
                </div>
                <div className="text-[10px] text-[#9a7520] tabular-nums">{fmt(bar.savedAmount)}</div>
                <div className="mt-0.5">
                  <TierBadge tier={bar.tier} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function GoldVaultPage() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <GoldVaultContent />
      </AppLayout>
    </ProtectedRoute>
  );
}
