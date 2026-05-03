import { useEffect, useState, useRef, useCallback } from "react";
import { useLocation, useParams } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { AppLayout } from "@/components/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/contexts/ProfileContext";
import { formatCurrency, parseCurrency, CURRENCY_SYMBOL } from "@/lib/currency";
import { Section, Month, LineItem } from "@/lib/types";

const SECTION_CONFIG: Record<Section, { label: string; emoji: string; color: string; textColor: string; rowBg: string }> = {
  income:  { label: "Income",  emoji: "💰", color: "#4CAF50", textColor: "#1B5E20", rowBg: "#F5F5F5" },
  savings: { label: "Savings", emoji: "🌱", color: "#2E7D32", textColor: "#1B5E20", rowBg: "#E8F5E9" },
  bills:   { label: "Bills",   emoji: "🏠", color: "#C62828", textColor: "#B71C1C", rowBg: "#FFEBEE" },
  needs:   { label: "Needs",   emoji: "🛒", color: "#1565C0", textColor: "#0D47A1", rowBg: "#E3F2FD" },
  wants:   { label: "Wants",   emoji: "✨", color: "#E65100", textColor: "#BF360C", rowBg: "#FFF3E0" },
  debt:    { label: "Debt",    emoji: "💳", color: "#607D8B", textColor: "#37474F", rowBg: "#ECEFF1" },
};

const EXPENSE_SECTIONS: Section[] = ["bills", "needs", "wants", "debt"];
const DUAL_AMOUNT_SECTIONS: Section[] = ["needs", "wants"];
const PIE_COLORS: Record<Section, string> = {
  income: "#4CAF50", savings: "#2E7D32", bills: "#C62828",
  needs: "#1565C0", wants: "#E65100", debt: "#607D8B",
};
const SHORT_MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const DEFAULT_ROWS: Record<Section, string[]> = {
  income:  ["Paycheck #1", "Paycheck #2", "Side income"],
  savings: ["Emergency fund", "Investments", "Other savings"],
  bills:   ["Rent/Mortgage", "Utilities", "Phone/Internet", "Insurance", "Subscriptions"],
  needs:   ["Groceries", "Transport", "Medical", "Personal care"],
  wants:   ["Eating out", "Shopping", "Entertainment", "Hobbies"],
  debt:    ["Credit cards", "Loans"],
};

interface YtdPoint { month: string; saved: number; isCurrent: boolean; }

const ChartTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-[#E8E8E8] rounded-lg px-3 py-1.5 shadow text-xs font-semibold text-[#1B5E20]">
      {formatCurrency(payload[0].value)}
    </div>
  );
};

function AmountInput({ value, onChange }: { value: number; onChange: (v: string) => void }) {
  const [focused, setFocused] = useState(false);
  const [local, setLocal] = useState(value === 0 ? "" : String(value));

  useEffect(() => {
    if (!focused) setLocal(value === 0 ? "" : String(value));
  }, [value, focused]);

  return (
    <div className={`flex items-center rounded border transition-all ${focused ? "border-[#2E7D32] bg-white ring-1 ring-[#2E7D32]/20" : "border-transparent"}`}>
      <span className="text-xs text-[#9E9E9E] pl-1.5">{CURRENCY_SYMBOL}</span>
      <input
        type="number" min="0" step="0.01"
        value={focused ? local : (value === 0 ? "" : String(value))}
        onChange={e => { setLocal(e.target.value); onChange(e.target.value); }}
        onFocus={() => { setFocused(true); setLocal(value === 0 ? "" : String(value)); }}
        onBlur={() => setFocused(false)}
        placeholder="—"
        className="w-20 py-1 pr-1.5 text-sm text-right bg-transparent focus:outline-none text-[#1B5E20] font-medium tabular-nums"
      />
    </div>
  );
}

function SideBySideSection({
  section, items, addingRow, newRowName,
  onUpdate, onDelete, onAddStart, onAddConfirm, onAddCancel, onNewRowNameChange,
}: {
  section: Section; items: LineItem[]; addingRow: Section | null; newRowName: string;
  onUpdate: (id: string, v: string) => void;
  onDelete: (id: string) => void;
  onAddStart: (s: Section) => void;
  onAddConfirm: (s: Section) => void;
  onAddCancel: () => void;
  onNewRowNameChange: (v: string) => void;
}) {
  const cfg = SECTION_CONFIG[section];
  const total = items.reduce((a, i) => a + i.amount, 0);
  const isAdding = addingRow === section;

  return (
    <div className="flex-1 min-w-0 bg-white rounded-xl border border-[#E0E0E0] overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#E8E8E8]" style={{ backgroundColor: cfg.rowBg }}>
        <div className="flex items-center gap-1.5">
          <span className="text-sm">{cfg.emoji}</span>
          <span className="text-sm font-bold" style={{ color: cfg.textColor }}>{cfg.label}</span>
        </div>
        <span className="text-sm font-bold tabular-nums" style={{ color: cfg.color }}>
          {total > 0 ? formatCurrency(total) : <span className="text-[#BDBDBD] font-normal">—</span>}
        </span>
      </div>

      {items.map(item => (
        <div key={item.id} className="flex items-center border-b border-[#F5F5F5] hover:bg-[#FAFAFA] group px-3 py-1.5">
          <span className="text-xs text-[#37474F] flex-1 truncate pr-2">{item.name}</span>
          <AmountInput value={item.amount} onChange={v => onUpdate(item.id, v)} />
          <button onClick={() => onDelete(item.id)} className="opacity-0 group-hover:opacity-100 ml-1 w-4 h-4 rounded text-[#BDBDBD] hover:text-red-500 transition text-xs flex items-center justify-center">×</button>
        </div>
      ))}

      <div className="px-3 py-1.5">
        {isAdding ? (
          <div className="flex gap-1">
            <input
              autoFocus value={newRowName}
              onChange={e => onNewRowNameChange(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") onAddConfirm(section); if (e.key === "Escape") onAddCancel(); }}
              placeholder="Item name…"
              className="flex-1 min-w-0 px-2 py-0.5 text-xs rounded border border-[#D0D0D0] focus:outline-none focus:ring-1 focus:ring-[#2E7D32]"
            />
            <button onClick={() => onAddConfirm(section)} className="px-1.5 py-0.5 bg-[#2E7D32] text-white text-xs rounded">Add</button>
            <button onClick={onAddCancel} className="px-1.5 py-0.5 text-[#9E9E9E] text-xs rounded hover:bg-[#F5F5F5]">✕</button>
          </div>
        ) : (
          <button onClick={() => onAddStart(section)} className="text-xs text-[#2E7D32] hover:text-[#1B5E20] font-medium">+ Add row</button>
        )}
      </div>
    </div>
  );
}

function BudgetContent() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const params = useParams<{ year?: string; month?: string }>();
  const [, navigate] = useLocation();

  const now = new Date();
  const year  = params.year  ? parseInt(params.year)  : now.getFullYear();
  const month = params.month ? parseInt(params.month) : now.getMonth() + 1;

  const [monthData, setMonthData] = useState<Month | null>(null);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [ytdData,   setYtdData]   = useState<YtdPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingRow, setAddingRow] = useState<Section | null>(null);
  const [newRowName, setNewRowName] = useState("");
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState("");
  const [copying, setCopying] = useState(false);
  const [copyDone, setCopyDone] = useState(false);
  const [copyError, setCopyError] = useState("");
  const saveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const monthName = new Date(year, month - 1).toLocaleDateString("en-GB", { month: "long", year: "numeric" });

  const loadMonth = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    let { data: existing } = await supabase
      .from("months").select("*")
      .eq("user_id", user.id).eq("year", year).eq("month", month).single();

    if (!existing) {
      const goal = profile?.default_monthly_goal ?? 500;
      const { data: created } = await supabase
        .from("months")
        .insert({ user_id: user.id, year, month, savings_goal: goal })
        .select().single();
      existing = created;

      if (created) {
        const defaultItems = ["income","bills","needs","wants","debt"].flatMap((section, si) =>
          DEFAULT_ROWS[section as Section].map((name, i) => ({
            month_id: created.id, section, name, amount: 0,
            sort_order: si * 100 + i, is_custom: false,
          }))
        );
        await supabase.from("line_items").insert(defaultItems);
      }
    }

    setMonthData(existing);

    if (existing) {
      const { data: items } = await supabase
        .from("line_items").select("*").eq("month_id", existing.id).order("sort_order");
      setLineItems(items ?? []);
    }

    // YTD bar chart data
    const { data: allMonths } = await supabase
      .from("months").select("id,month,savings_goal")
      .eq("user_id", user.id).eq("year", year).lte("month", month);

    if (allMonths && allMonths.length > 0) {
      const ids = allMonths.map((m: Month) => m.id);
      const { data: allItems } = await supabase
        .from("line_items").select("month_id,section,amount,actual_amount").in("month_id", ids);

      const points: YtdPoint[] = allMonths.map((m: Month) => {
        const mi = (allItems ?? []).filter((i: LineItem) => i.month_id === m.id);
        const inc = mi.filter((i: LineItem) => i.section === "income").reduce((s: number, i: LineItem) => s + i.amount, 0);
        const exp = mi.filter((i: LineItem) => ["bills","debt"].includes(i.section)).reduce((s: number, i: LineItem) => s + i.amount, 0)
                  + mi.filter((i: LineItem) => ["needs","wants"].includes(i.section)).reduce((s: number, i: LineItem) => s + (i.actual_amount ?? i.amount), 0);
        return { month: SHORT_MONTHS[m.month - 1], saved: Math.max(0, inc - exp), isCurrent: m.month === month };
      });
      setYtdData(points.sort((a, b) => SHORT_MONTHS.indexOf(a.month) - SHORT_MONTHS.indexOf(b.month)));
    }

    setLoading(false);
  }, [user, year, month, profile]);

  useEffect(() => { loadMonth(); }, [loadMonth]);

  const navigateMonth = (dir: -1 | 1) => {
    let m = month + dir, y = year;
    if (m < 1)  { m = 12; y--; }
    if (m > 12) { m = 1;  y++; }
    navigate(`/budget/${y}/${m}`);
  };

  const updateAmount = (itemId: string, value: string) => {
    const amount = parseCurrency(value);
    setLineItems(prev => prev.map(i => i.id === itemId ? { ...i, amount } : i));
    clearTimeout(saveTimers.current[itemId]);
    saveTimers.current[itemId] = setTimeout(async () => {
      await supabase.from("line_items").update({ amount }).eq("id", itemId);
    }, 500);
  };

  const updateActual = (itemId: string, value: string) => {
    const actual_amount = value === "" ? null : parseCurrency(value);
    setLineItems(prev => prev.map(i => i.id === itemId ? { ...i, actual_amount } : i));
    clearTimeout(saveTimers.current[`act_${itemId}`]);
    saveTimers.current[`act_${itemId}`] = setTimeout(async () => {
      await supabase.from("line_items").update({ actual_amount }).eq("id", itemId);
    }, 500);
  };

  const addRow = async (section: Section) => {
    if (!newRowName.trim() || !monthData) return;
    const existing = lineItems.filter(i => i.section === section);
    const sortOrder = existing.length > 0 ? Math.max(...existing.map(i => i.sort_order)) + 1 : 0;
    const { data } = await supabase
      .from("line_items")
      .insert({ month_id: monthData.id, section, name: newRowName.trim(), amount: 0, sort_order: sortOrder, is_custom: true })
      .select().single();
    if (data) setLineItems(prev => [...prev, data]);
    setNewRowName(""); setAddingRow(null);
  };

  const deleteRow = async (itemId: string) => {
    await supabase.from("line_items").delete().eq("id", itemId);
    setLineItems(prev => prev.filter(i => i.id !== itemId));
  };

  const updateGoal = async () => {
    if (!monthData) return;
    const newGoal = parseCurrency(goalInput);
    if (newGoal <= 0) return;
    await supabase.from("months").update({ savings_goal: newGoal }).eq("id", monthData.id);
    setMonthData(prev => prev ? { ...prev, savings_goal: newGoal } : prev);
    setEditingGoal(false);
  };

  const copyFromPreviousMonth = useCallback(async () => {
    if (!user || !monthData) return;
    setCopying(true);
    setCopyError("");

    let prevM = month - 1, prevY = year;
    if (prevM < 1) { prevM = 12; prevY--; }

    const { data: prevMonthRecord } = await supabase
      .from("months").select("id")
      .eq("user_id", user.id).eq("year", prevY).eq("month", prevM)
      .single();

    if (!prevMonthRecord) {
      setCopyError("No data found for last month.");
      setCopying(false);
      setTimeout(() => setCopyError(""), 3000);
      return;
    }

    const { data: prevItems } = await supabase
      .from("line_items").select("*").eq("month_id", prevMonthRecord.id);

    if (!prevItems || prevItems.length === 0) {
      setCopyError("Last month had no entries.");
      setCopying(false);
      setTimeout(() => setCopyError(""), 3000);
      return;
    }

    const prevMap = new Map((prevItems as LineItem[]).map(i => [`${i.section}::${i.name}`, i]));
    const currentKeys = new Set(lineItems.map(i => `${i.section}::${i.name}`));

    // Update amounts on existing matching rows
    const updatedItems = lineItems.map(item => {
      const prev = prevMap.get(`${item.section}::${item.name}`);
      return prev ? { ...item, amount: prev.amount } : item;
    });
    setLineItems(updatedItems);

    // Persist each matched row
    const matchedIds = updatedItems
      .filter(item => prevMap.has(`${item.section}::${item.name}`))
      .map(item => ({ id: item.id, amount: item.amount }));
    await Promise.all(matchedIds.map(({ id, amount }) =>
      supabase.from("line_items").update({ amount }).eq("id", id)
    ));

    // Insert custom rows from last month that don't exist yet
    const newCustomRows = (prevItems as LineItem[]).filter(
      i => i.is_custom && !currentKeys.has(`${i.section}::${i.name}`)
    );
    if (newCustomRows.length > 0) {
      const { data: inserted } = await supabase
        .from("line_items")
        .insert(newCustomRows.map(row => ({
          month_id: monthData.id,
          section: row.section,
          name: row.name,
          amount: row.amount,
          sort_order: row.sort_order,
          is_custom: true,
        })))
        .select();
      if (inserted) setLineItems(prev => [...prev, ...(inserted as LineItem[])]);
    }

    setCopying(false);
    setCopyDone(true);
    setTimeout(() => setCopyDone(false), 3000);
  }, [user, monthData, month, year, lineItems]);

  const itemsFor = (s: Section) => lineItems.filter(i => i.section === s);
  const totalFor = (s: Section) => itemsFor(s).reduce((a, i) => a + i.amount, 0);
  // For needs/wants: use actual_amount if entered, else fall back to expected (amount)
  const effectiveAmount = (item: LineItem) =>
    DUAL_AMOUNT_SECTIONS.includes(item.section as Section) && item.actual_amount !== null && item.actual_amount !== undefined
      ? item.actual_amount
      : item.amount;
  const effectiveTotalFor = (s: Section) => itemsFor(s).reduce((a, i) => a + effectiveAmount(i), 0);

  const income    = totalFor("income");
  const expenses  = ["bills","debt"].reduce((a, s) => a + totalFor(s as Section), 0)
                  + effectiveTotalFor("needs") + effectiveTotalFor("wants");
  const allocated = expenses; // savings excluded from "Total allocated"
  const saved     = income - expenses; // remaining balance IS the savings contribution

  const savingsGoal = monthData?.savings_goal ?? 500;
  const goalPct = Math.min(100, Math.round((saved / savingsGoal) * 100));
  const goalMet = saved >= savingsGoal;

  const savingsShortfall = Math.max(0, savingsGoal - saved);
  const amountLeftToSpend = saved - savingsGoal; // spare after hitting goal
  const leftPct = savingsGoal > 0 ? Math.max(0, Math.min(100, (saved / savingsGoal) * 100)) : 0;

  const today = new Date();
  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth() + 1;
  const daysInMonth = new Date(year, month, 0).getDate();
  const daysLeft = isCurrentMonth ? daysInMonth - today.getDate() : 0;
  const isLateInMonth = today.getDate() >= 20;
  const showNudge = !goalMet && isCurrentMonth && isLateInMonth && (income > 0 || saved > 0);

  const ytdTotal = ytdData.reduce((a, p) => a + p.saved, 0);
  const OUTGOING_SECTIONS: Section[] = ["bills", "needs", "wants", "debt"];
  const pieData = [
    ...OUTGOING_SECTIONS
      .map(s => ({ name: SECTION_CONFIG[s].label, value: totalFor(s), key: s, color: PIE_COLORS[s] }))
      .filter(d => d.value > 0),
    ...(saved > 0 ? [{ name: "Savings", value: saved, key: "savings", color: "#4CAF50" }] : []),
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 rounded-full border-4 border-[#2E7D32] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-5 pb-10">
      {/* Month nav */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => navigateMonth(-1)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#E8E8E8] text-[#2E7D32] transition">←</button>
        <h2 className="text-base font-semibold text-[#1B5E20]">{monthName}</h2>
        <button onClick={() => navigateMonth(1)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#E8E8E8] text-[#2E7D32] transition">→</button>
      </div>

      {/* Savings goal strip */}
      <div className={`rounded-xl px-5 py-3.5 flex flex-wrap items-center justify-between gap-4 mb-5 ${goalMet ? "bg-[#2E7D32]" : "bg-[#E65100]"}`}>
        <div>
          <div className="text-white/80 text-xs mb-0.5">Monthly savings goal</div>
          <div className="text-white font-bold text-xl tabular-nums">
            {formatCurrency(saved)} <span className="text-white/60 font-normal text-sm">/ {formatCurrency(savingsGoal)}</span>
          </div>
        </div>
        <div className="flex-1 min-w-[160px] max-w-xs">
          <div className="w-full bg-white/25 rounded-full h-3">
            <div className="bg-white rounded-full h-3 transition-all duration-500" style={{ width: `${goalPct}%` }} />
          </div>
          <div className="text-white/80 text-xs mt-1 text-right">
            {goalMet ? "✓ Goal met — tree growing!" : `${formatCurrency(savingsGoal - saved)} to go`}
          </div>
        </div>
        <button
          onClick={() => { setGoalInput(String(savingsGoal)); setEditingGoal(true); }}
          className="text-white/70 hover:text-white text-xs underline shrink-0"
        >
          Edit goal
        </button>
      </div>

      {/* Edit goal modal */}
      {editingGoal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="font-semibold text-[#1B5E20] mb-4">Update savings goal</h3>
            <div className="relative mb-4">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#2E7D32] font-semibold">{CURRENCY_SYMBOL}</span>
              <input
                type="number" value={goalInput}
                onChange={e => setGoalInput(e.target.value)}
                className="w-full pl-8 pr-4 py-3 rounded-xl border border-[#D0D0D0] focus:outline-none focus:ring-2 focus:ring-[#2E7D32] text-[#1B5E20] text-lg font-semibold"
                autoFocus
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setEditingGoal(false)} className="flex-1 py-2.5 border border-[#D0D0D0] text-[#546E7A] rounded-xl hover:bg-[#F5F5F5] transition">Cancel</button>
              <button onClick={updateGoal} className="flex-1 py-2.5 bg-[#2E7D32] text-white font-semibold rounded-xl hover:bg-[#1B5E20] transition">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* ── GOAL STATUS BANNER ── */}
      <AnimatePresence mode="wait">
        {goalMet ? (
          <motion.div
            key="celebration"
            initial={{ opacity: 0, y: -10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: "spring", bounce: 0.3 }}
            className="mb-5 bg-gradient-to-r from-[#E8F5E9] to-[#C8E6C9] border border-[#4CAF50] rounded-xl px-5 py-3.5 flex items-center justify-between"
          >
            <div>
              <div className="text-sm font-bold text-[#1B5E20]">🎉 Goal smashed! Your tree grew this month.</div>
              <div className="text-xs text-[#388E3C] mt-0.5">
                You saved {formatCurrency(saved)} —{" "}
                <span className="font-semibold">{formatCurrency(saved - savingsGoal)}</span> more than your {formatCurrency(savingsGoal)} goal
              </div>
            </div>
            <motion.span
              animate={{ rotate: [0, 12, -8, 0] }}
              transition={{ duration: 0.9, delay: 0.4, repeat: 2 }}
              className="text-3xl ml-3 shrink-0"
            >
              🌳
            </motion.span>
          </motion.div>
        ) : showNudge ? (
          <motion.div
            key="nudge"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-5 bg-amber-50 border border-amber-200 rounded-xl px-5 py-3.5 flex items-center justify-between"
          >
            <div>
              <div className="text-sm font-semibold text-[#BF360C]">
                ⏰ {daysLeft} day{daysLeft !== 1 ? "s" : ""} left — {formatCurrency(savingsGoal - saved)} short of your goal
              </div>
              <div className="text-xs text-[#E65100] mt-0.5">
                Try reducing expenses this month to hit your savings goal
              </div>
            </div>
            <span className="text-2xl ml-3 shrink-0">💪</span>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* ── MAIN 2-COLUMN LAYOUT ── */}
      <div className="flex gap-5 items-start">

        {/* LEFT: Budget table */}
        <div className="flex-1 min-w-0 space-y-3">

          {/* Copy from last month */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#546E7A] uppercase tracking-wide">Income</span>
            <div className="flex items-center gap-2">
              {copyError && (
                <span className="text-xs text-red-400">{copyError}</span>
              )}
              <button
                onClick={copyFromPreviousMonth}
                disabled={copying}
                className={`flex items-center gap-1.5 text-xs border rounded-lg px-2.5 py-1.5 transition font-medium ${
                  copyDone
                    ? "border-[#4CAF50] text-[#2E7D32] bg-[#f0fbf0]"
                    : "border-[#D0D0D0] text-[#2E7D32] hover:border-[#2E7D32] hover:bg-[#F5F5F5] bg-white"
                }`}
              >
                {copying ? (
                  <div className="w-3 h-3 rounded-full border border-[#2E7D32] border-t-transparent animate-spin" />
                ) : copyDone ? (
                  <span>✓</span>
                ) : (
                  <span>↩</span>
                )}
                {copying ? "Copying…" : copyDone ? "Copied!" : "Copy from last month"}
              </button>
            </div>
          </div>

          {/* Income + Savings side by side */}
          <div className="flex gap-3">
            <SideBySideSection
              section="income" items={itemsFor("income")}
              addingRow={addingRow} newRowName={newRowName}
              onUpdate={updateAmount} onDelete={deleteRow}
              onAddStart={s => { setAddingRow(s); setNewRowName(""); }}
              onAddConfirm={addRow} onAddCancel={() => { setAddingRow(null); setNewRowName(""); }}
              onNewRowNameChange={setNewRowName}
            />
            <SideBySideSection
              section="savings" items={itemsFor("savings")}
              addingRow={addingRow} newRowName={newRowName}
              onUpdate={updateAmount} onDelete={deleteRow}
              onAddStart={s => { setAddingRow(s); setNewRowName(""); }}
              onAddConfirm={addRow} onAddCancel={() => { setAddingRow(null); setNewRowName(""); }}
              onNewRowNameChange={setNewRowName}
            />
          </div>

          {/* Expense table */}
          <div className="bg-white rounded-xl border border-[#E0E0E0] overflow-hidden">

            {EXPENSE_SECTIONS.map(section => {
              const cfg = SECTION_CONFIG[section];
              const items = itemsFor(section);
              const isDual = DUAL_AMOUNT_SECTIONS.includes(section);
              const isAdding = addingRow === section;
              const expectedTotal = items.reduce((a, i) => a + i.amount, 0);
              const actualTotal   = isDual ? items.reduce((a, i) => a + (i.actual_amount ?? i.amount), 0) : expectedTotal;
              const hasActual     = isDual && items.some(i => i.actual_amount !== null && i.actual_amount !== undefined);

              return (
                <div key={section}>
                  {isDual ? (
                    /* ── DUAL header: Expected | Actual ── */
                    <div className="grid grid-cols-[1fr_90px_90px_28px] border-b border-[#E8E8E8]" style={{ backgroundColor: cfg.rowBg }}>
                      <div className="px-4 py-2 flex items-center gap-1.5">
                        <span className="text-sm">{cfg.emoji}</span>
                        <span className="text-sm font-bold" style={{ color: cfg.textColor }}>{cfg.label}</span>
                      </div>
                      <div className="py-1.5 pr-1 text-center">
                        <div className="text-[9px] uppercase tracking-wide text-[#9E9E9E] mb-0.5">Expected</div>
                        <div className="text-xs font-bold tabular-nums text-right" style={{ color: cfg.color }}>
                          {expectedTotal > 0 ? formatCurrency(expectedTotal) : <span className="text-[#BDBDBD] font-normal">—</span>}
                        </div>
                      </div>
                      <div className="py-1.5 pr-1 text-center">
                        <div className="text-[9px] uppercase tracking-wide text-[#9E9E9E] mb-0.5">Actual</div>
                        <div className={`text-xs font-bold tabular-nums text-right ${!hasActual ? "opacity-30" : ""}`} style={{ color: cfg.color }}>
                          {actualTotal > 0 ? formatCurrency(actualTotal) : <span className="text-[#BDBDBD] font-normal">—</span>}
                        </div>
                      </div>
                      <div />
                    </div>
                  ) : (
                    /* ── SINGLE header: Amount ── */
                    <div className="grid grid-cols-[1fr_110px_28px] border-b border-[#E8E8E8]" style={{ backgroundColor: cfg.rowBg }}>
                      <div className="px-4 py-2 flex items-center gap-1.5">
                        <span className="text-sm">{cfg.emoji}</span>
                        <span className="text-sm font-bold" style={{ color: cfg.textColor }}>{cfg.label}</span>
                      </div>
                      <div className="px-2 py-2 text-sm font-bold text-right tabular-nums" style={{ color: cfg.color }}>
                        {expectedTotal > 0 ? formatCurrency(expectedTotal) : <span className="text-[#BDBDBD] font-normal">—</span>}
                      </div>
                      <div />
                    </div>
                  )}

                  {items.map(item => isDual ? (
                    /* ── DUAL row ── */
                    <div key={item.id} className="grid grid-cols-[1fr_90px_90px_28px] border-b border-[#F5F5F5] hover:bg-[#FAFAFA] group">
                      <div className="px-4 py-1.5 pl-9 flex items-center">
                        <span className="text-sm text-[#37474F] truncate">{item.name}</span>
                      </div>
                      <div className="px-0.5 py-1 flex items-center justify-end">
                        <AmountInput value={item.amount} onChange={v => updateAmount(item.id, v)} />
                      </div>
                      <div className="px-0.5 py-1 flex items-center justify-end">
                        <AmountInput value={item.actual_amount ?? 0} onChange={v => updateActual(item.id, v)} />
                      </div>
                      <div className="flex items-center justify-center">
                        <button onClick={() => deleteRow(item.id)} className="opacity-0 group-hover:opacity-100 w-4 h-4 rounded text-[#BDBDBD] hover:text-red-500 transition text-xs flex items-center justify-center">×</button>
                      </div>
                    </div>
                  ) : (
                    /* ── SINGLE row ── */
                    <div key={item.id} className="grid grid-cols-[1fr_110px_28px] border-b border-[#F5F5F5] hover:bg-[#FAFAFA] group">
                      <div className="px-4 py-2 pl-9 flex items-center">
                        <span className="text-sm text-[#37474F] truncate">{item.name}</span>
                      </div>
                      <div className="px-1 py-1 flex items-center justify-end">
                        <AmountInput value={item.amount} onChange={v => updateAmount(item.id, v)} />
                      </div>
                      <div className="flex items-center justify-center">
                        <button onClick={() => deleteRow(item.id)} className="opacity-0 group-hover:opacity-100 w-4 h-4 rounded text-[#BDBDBD] hover:text-red-500 transition text-xs flex items-center justify-center">×</button>
                      </div>
                    </div>
                  ))}

                  <div className="border-b border-[#F5F5F5]">
                    {isAdding ? (
                      <div className="flex gap-2 pl-9 pr-3 py-2">
                        <input
                          autoFocus value={newRowName}
                          onChange={e => setNewRowName(e.target.value)}
                          onKeyDown={e => { if (e.key === "Enter") addRow(section); if (e.key === "Escape") { setAddingRow(null); setNewRowName(""); } }}
                          placeholder="Item name…"
                          className="flex-1 px-2 py-1 text-sm rounded border border-[#D0D0D0] focus:outline-none focus:ring-1 focus:ring-[#2E7D32]"
                        />
                        <button onClick={() => addRow(section)} className="px-2 py-1 bg-[#2E7D32] text-white text-xs rounded hover:bg-[#1B5E20]">Add</button>
                        <button onClick={() => { setAddingRow(null); setNewRowName(""); }} className="px-2 py-1 text-[#9E9E9E] text-xs rounded hover:bg-[#F5F5F5]">Cancel</button>
                      </div>
                    ) : (
                      <button onClick={() => { setAddingRow(section); setNewRowName(""); }} className="w-full text-left pl-9 px-4 py-2 text-xs text-[#2E7D32] hover:bg-[#F5F5F5] transition font-medium">+ Add row</button>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Footer totals */}
            <div className="grid grid-cols-[1fr_auto_28px] bg-[#F5F5F5] border-t-2 border-[#E0E0E0]">
              <div className="px-4 py-2.5 text-sm font-bold text-[#1B5E20]">Total income</div>
              <div className="px-3 py-2.5 text-sm font-bold text-right tabular-nums text-[#2E7D32]">{formatCurrency(income)}</div>
              <div />
            </div>
            <div className="grid grid-cols-[1fr_auto_28px] bg-[#F5F5F5] border-t border-[#E8E8E8]">
              <div className="px-4 py-2.5 text-sm font-bold text-[#1B5E20]">Total allocated</div>
              <div className="px-3 py-2.5 text-sm font-bold text-right tabular-nums text-[#C62828]">{formatCurrency(allocated)}</div>
              <div />
            </div>
            <div className={`grid grid-cols-[1fr_auto_28px] border-t-2 ${saved >= 0 ? "border-[#2E7D32] bg-[#E8F5E9]" : "border-[#C62828] bg-[#FFEBEE]"}`}>
              <div className="px-4 py-2.5 text-sm font-bold text-[#1B5E20]">Remaining balance</div>
              <div className={`px-3 py-2.5 text-sm font-bold text-right tabular-nums ${saved >= 0 ? "text-[#2E7D32]" : "text-[#C62828]"}`}>
                {saved >= 0 ? formatCurrency(saved) : `−${formatCurrency(Math.abs(saved))}`}
              </div>
              <div />
            </div>
          </div>
        </div>

        {/* RIGHT: Charts column — sticky */}
        <div className="w-72 shrink-0 space-y-4 sticky top-20">

          {/* Chart 1: Budget summary */}
          <div className="bg-white rounded-xl border border-[#E0E0E0] p-4 shadow-sm">
            <div className="text-xs font-semibold text-[#546E7A] uppercase tracking-wide mb-0.5">Left to spend</div>
            <div className="text-[10px] text-[#9E9E9E] mb-2">after expenses &amp; savings goal</div>
            <div className={`text-2xl font-bold tabular-nums mb-1 ${amountLeftToSpend >= 0 ? "text-[#2E7D32]" : "text-[#C62828]"}`}>
              {amountLeftToSpend >= 0 ? formatCurrency(amountLeftToSpend) : `−${formatCurrency(Math.abs(amountLeftToSpend))}`}
            </div>
            <div className="w-full bg-[#E8E8E8] rounded-full h-3 overflow-hidden mb-1">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${saved >= 0 ? "bg-[#4CAF50]" : "bg-[#C62828]"}`}
                style={{ width: `${income > 0 ? Math.max(0, Math.min(100, (saved / income) * 100)) : 0}%` }}
              />
            </div>
            <div className="mb-3" />

            <div className="border-t border-[#F5F5F5] pt-3 space-y-2.5">
              <div className="flex items-start justify-between">
                <span className="text-xs text-[#607D8B] leading-tight max-w-[120px]">Remaining balance</span>
                <span className={`text-sm font-bold tabular-nums ${saved >= 0 ? "text-[#2E7D32]" : "text-[#C62828]"}`}>
                  {saved >= 0 ? formatCurrency(saved) : `−${formatCurrency(Math.abs(saved))}`}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-[#F5F5F5]">
                <span className="text-xs text-[#607D8B]">Savings target</span>
                <span className="text-sm font-semibold tabular-nums text-[#1B5E20]">{formatCurrency(savingsGoal)}</span>
              </div>
            </div>
          </div>

          {/* Chart 2: YTD savings */}
          <div className="bg-white rounded-xl border border-[#E0E0E0] p-4 shadow-sm">
            <div className="text-xs font-semibold text-[#546E7A] uppercase tracking-wide mb-1">Saved year to date</div>
            <div className="text-2xl font-bold text-[#2E7D32] tabular-nums mb-3">{formatCurrency(ytdTotal)}</div>
            {ytdData.length > 0 ? (
              <ResponsiveContainer width="100%" height={90}>
                <BarChart data={ytdData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F5" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#9E9E9E" }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: "#F5F5F5" }} />
                  <Bar dataKey="saved" radius={[3,3,0,0]}>
                    {ytdData.map((p, i) => (
                      <Cell key={i} fill={p.isCurrent ? "#2E7D32" : "#4CAF50"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-[#9E9E9E] text-center py-6">No data yet this year</div>
            )}
          </div>

          {/* Chart 3: Breakdown */}
          <div className="bg-white rounded-xl border border-[#E0E0E0] p-4 shadow-sm">
            <div className="text-xs font-semibold text-[#546E7A] uppercase tracking-wide mb-3">Breakdown</div>
            {income > 0 && pieData.length > 0 ? (
              <>
                <div className="flex justify-center mb-3">
                  <div className="relative w-[120px] h-[120px]">
                    <PieChart width={120} height={120}>
                      <Pie data={pieData} cx={56} cy={56} innerRadius={32} outerRadius={54} paddingAngle={2} dataKey="value" stroke="none">
                        {pieData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<ChartTooltip />} />
                    </PieChart>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-[9px] text-[#9E9E9E] leading-none">total</span>
                      <span className="text-[11px] font-bold text-[#1B5E20] leading-tight tabular-nums">{formatCurrency(income)}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  {pieData.map(entry => (
                    <div key={entry.name} className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                      <span className="text-xs text-[#546E7A] flex-1">{entry.name}</span>
                      <span className="text-[10px] text-[#9E9E9E] tabular-nums mr-1">{Math.round((entry.value / income) * 100)}%</span>
                      <span className="text-xs font-semibold text-[#1B5E20] tabular-nums">{formatCurrency(entry.value)}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-xs text-[#9E9E9E] text-center py-6">Enter income to see breakdown</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BudgetPage() {
  const params = useParams<{ year?: string; month?: string }>();
  return (
    <ProtectedRoute>
      <AppLayout>
        <BudgetContent key={`${params.year}-${params.month}`} />
      </AppLayout>
    </ProtectedRoute>
  );
}
