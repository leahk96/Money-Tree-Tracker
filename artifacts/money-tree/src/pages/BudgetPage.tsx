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
  income:  { label: "Income",  emoji: "💰", color: "#85BB65", textColor: "#1a4a1a", rowBg: "#f4fbf4" },
  savings: { label: "Savings", emoji: "🌱", color: "#228B22", textColor: "#1a4a1a", rowBg: "#eef8ee" },
  bills:   { label: "Bills",   emoji: "🏠", color: "#c0516b", textColor: "#5a0e20", rowBg: "#fdf5f7" },
  needs:   { label: "Needs",   emoji: "🛒", color: "#5a8fc0", textColor: "#1a3050", rowBg: "#f0f6ff" },
  wants:   { label: "Wants",   emoji: "✨", color: "#d4900a", textColor: "#5a3800", rowBg: "#fffbf0" },
  debt:    { label: "Debt",    emoji: "💳", color: "#8a9aaa", textColor: "#2a3a4a", rowBg: "#f6f7f8" },
};

const EXPENSE_SECTIONS: Section[] = ["bills", "needs", "wants", "debt"];
const DUAL_AMOUNT_SECTIONS: Section[] = ["needs", "wants"];
const ALL_SECTIONS: Section[] = ["income", "savings", "bills", "needs", "wants", "debt"];
const PIE_COLORS: Record<Section, string> = {
  income: "#85BB65", savings: "#228B22", bills: "#c0516b",
  needs: "#5a8fc0", wants: "#d4900a", debt: "#8a9aaa",
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
    <div className="bg-white border border-[#e8f0e8] rounded-lg px-3 py-1.5 shadow text-xs font-semibold text-[#1a4a1a]">
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
    <div className={`flex items-center rounded border transition-all ${focused ? "border-[#228B22] bg-white ring-1 ring-[#228B22]/20" : "border-transparent"}`}>
      <span className="text-xs text-[#9ab89a] pl-1.5">{CURRENCY_SYMBOL}</span>
      <input
        type="number" min="0" step="0.01"
        value={focused ? local : (value === 0 ? "" : String(value))}
        onChange={e => { setLocal(e.target.value); onChange(e.target.value); }}
        onFocus={() => { setFocused(true); setLocal(value === 0 ? "" : String(value)); }}
        onBlur={() => setFocused(false)}
        placeholder="—"
        className="w-20 py-1 pr-1.5 text-sm text-right bg-transparent focus:outline-none text-[#1a4a1a] font-medium tabular-nums"
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
    <div className="flex-1 min-w-0 bg-white rounded-xl border border-[#e0e8e0] overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#e8f0e8]" style={{ backgroundColor: cfg.rowBg }}>
        <div className="flex items-center gap-1.5">
          <span className="text-sm">{cfg.emoji}</span>
          <span className="text-sm font-bold" style={{ color: cfg.textColor }}>{cfg.label}</span>
        </div>
        <span className="text-sm font-bold tabular-nums" style={{ color: cfg.color }}>
          {total > 0 ? formatCurrency(total) : <span className="text-[#c8d8c8] font-normal">—</span>}
        </span>
      </div>

      {items.map(item => (
        <div key={item.id} className="flex items-center border-b border-[#f0f4f0] hover:bg-[#fafcfa] group px-3 py-1.5">
          <span className="text-xs text-[#2d4a2d] flex-1 truncate pr-2">{item.name}</span>
          <AmountInput value={item.amount} onChange={v => onUpdate(item.id, v)} />
          <button onClick={() => onDelete(item.id)} className="opacity-0 group-hover:opacity-100 ml-1 w-4 h-4 rounded text-[#c0b0b0] hover:text-red-500 transition text-xs flex items-center justify-center">×</button>
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
              className="flex-1 min-w-0 px-2 py-0.5 text-xs rounded border border-[#d0e4d0] focus:outline-none focus:ring-1 focus:ring-[#228B22]"
            />
            <button onClick={() => onAddConfirm(section)} className="px-1.5 py-0.5 bg-[#228B22] text-white text-xs rounded">Add</button>
            <button onClick={onAddCancel} className="px-1.5 py-0.5 text-[#9ab89a] text-xs rounded hover:bg-[#f0f8f0]">✕</button>
          </div>
        ) : (
          <button onClick={() => onAddStart(section)} className="text-xs text-[#228B22] hover:text-[#1a6b1a] font-medium">+ Add row</button>
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
        const defaultItems = ["income","savings","bills","needs","wants","debt"].flatMap((section, si) =>
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
        .from("line_items").select("month_id,amount").in("month_id", ids).eq("section","savings");

      const points: YtdPoint[] = allMonths.map((m: Month) => {
        const saved = (allItems ?? [])
          .filter((i: LineItem) => i.month_id === m.id)
          .reduce((s: number, i: LineItem) => s + i.amount, 0);
        return { month: SHORT_MONTHS[m.month - 1], saved, isCurrent: m.month === month };
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
  const saved     = totalFor("savings");
  const expenses  = ["bills","debt"].reduce((a, s) => a + totalFor(s as Section), 0)
                  + effectiveTotalFor("needs") + effectiveTotalFor("wants");
  const allocated = saved + expenses;
  const leftover  = income - allocated;

  const savingsGoal = monthData?.savings_goal ?? 500;
  const goalPct = Math.min(100, Math.round((saved / savingsGoal) * 100));
  const goalMet = saved >= savingsGoal;

  // Amount left to spend = leftover minus any remaining savings gap
  const savingsShortfall = Math.max(0, savingsGoal - saved);
  const amountLeftToSpend = leftover - savingsShortfall;
  const leftPct = income > 0 ? Math.max(0, Math.min(100, (leftover / income) * 100)) : 0;

  const today = new Date();
  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth() + 1;
  const daysInMonth = new Date(year, month, 0).getDate();
  const daysLeft = isCurrentMonth ? daysInMonth - today.getDate() : 0;
  const isLateInMonth = today.getDate() >= 20;
  const showNudge = !goalMet && isCurrentMonth && isLateInMonth && (income > 0 || saved > 0);

  const ytdTotal = ytdData.reduce((a, p) => a + p.saved, 0);
  const pieData = ALL_SECTIONS
    .map(s => ({ name: SECTION_CONFIG[s].label, value: totalFor(s), key: s }))
    .filter(d => d.value > 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 rounded-full border-4 border-[#228B22] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-5 pb-10">
      {/* Month nav */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => navigateMonth(-1)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#e8f0e8] text-[#2d5a2d] transition">←</button>
        <h2 className="text-base font-semibold text-[#1a4a1a]">{monthName}</h2>
        <button onClick={() => navigateMonth(1)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#e8f0e8] text-[#2d5a2d] transition">→</button>
      </div>

      {/* Savings goal strip */}
      <div className={`rounded-xl px-5 py-3.5 flex flex-wrap items-center justify-between gap-4 mb-5 ${goalMet ? "bg-[#228B22]" : "bg-[#d4900a]"}`}>
        <div>
          <div className="text-white/80 text-xs mb-0.5">Monthly savings goal</div>
          <div className="text-white font-bold text-xl tabular-nums">
            {formatCurrency(saved)} <span className="text-white/60 font-normal text-sm">/ {formatCurrency(savingsGoal)}</span>
          </div>
        </div>
        <div className="flex-1 min-w-[160px] max-w-xs">
          <div className="w-full bg-white/25 rounded-full h-2">
            <div className="bg-white rounded-full h-2 transition-all duration-500" style={{ width: `${goalPct}%` }} />
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
            <h3 className="font-semibold text-[#1a4a1a] mb-4">Update savings goal</h3>
            <div className="relative mb-4">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#228B22] font-semibold">{CURRENCY_SYMBOL}</span>
              <input
                type="number" value={goalInput}
                onChange={e => setGoalInput(e.target.value)}
                className="w-full pl-8 pr-4 py-3 rounded-xl border border-[#d0e4d0] focus:outline-none focus:ring-2 focus:ring-[#228B22] text-[#1a4a1a] text-lg font-semibold"
                autoFocus
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setEditingGoal(false)} className="flex-1 py-2.5 border border-[#d0e4d0] text-[#5a7a5a] rounded-xl hover:bg-[#f0f8f0] transition">Cancel</button>
              <button onClick={updateGoal} className="flex-1 py-2.5 bg-[#228B22] text-white font-semibold rounded-xl hover:bg-[#1a6b1a] transition">Save</button>
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
            className="mb-5 bg-gradient-to-r from-[#e0f8e0] to-[#d0f2d0] border border-[#85BB65] rounded-xl px-5 py-3.5 flex items-center justify-between"
          >
            <div>
              <div className="text-sm font-bold text-[#1a5a1a]">🎉 Goal smashed! Your tree grew this month.</div>
              <div className="text-xs text-[#3a7a3a] mt-0.5">
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
              <div className="text-sm font-semibold text-[#9a6020]">
                ⏰ {daysLeft} day{daysLeft !== 1 ? "s" : ""} left — {formatCurrency(savingsGoal - saved)} short of your goal
              </div>
              <div className="text-xs text-[#b07830] mt-0.5">
                Top up your savings this month to keep your tree growing
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
            <span className="text-xs font-semibold text-[#5a7a5a] uppercase tracking-wide">Income &amp; Savings</span>
            <div className="flex items-center gap-2">
              {copyError && (
                <span className="text-xs text-red-400">{copyError}</span>
              )}
              <button
                onClick={copyFromPreviousMonth}
                disabled={copying}
                className={`flex items-center gap-1.5 text-xs border rounded-lg px-2.5 py-1.5 transition font-medium ${
                  copyDone
                    ? "border-[#85BB65] text-[#228B22] bg-[#f0fbf0]"
                    : "border-[#d0e4d0] text-[#228B22] hover:border-[#228B22] hover:bg-[#f5fbf5] bg-white"
                }`}
              >
                {copying ? (
                  <div className="w-3 h-3 rounded-full border border-[#228B22] border-t-transparent animate-spin" />
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
          <div className="bg-white rounded-xl border border-[#e0e8e0] overflow-hidden">

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
                    <div className="grid grid-cols-[1fr_90px_90px_28px] border-b border-[#e8f0e8]" style={{ backgroundColor: cfg.rowBg }}>
                      <div className="px-4 py-2 flex items-center gap-1.5">
                        <span className="text-sm">{cfg.emoji}</span>
                        <span className="text-sm font-bold" style={{ color: cfg.textColor }}>{cfg.label}</span>
                      </div>
                      <div className="py-1.5 pr-1 text-center">
                        <div className="text-[9px] uppercase tracking-wide text-[#9ab89a] mb-0.5">Expected</div>
                        <div className="text-xs font-bold tabular-nums text-right" style={{ color: cfg.color }}>
                          {expectedTotal > 0 ? formatCurrency(expectedTotal) : <span className="text-[#c8d8c8] font-normal">—</span>}
                        </div>
                      </div>
                      <div className="py-1.5 pr-1 text-center">
                        <div className="text-[9px] uppercase tracking-wide text-[#9ab89a] mb-0.5">Actual</div>
                        <div className={`text-xs font-bold tabular-nums text-right ${!hasActual ? "opacity-30" : ""}`} style={{ color: cfg.color }}>
                          {actualTotal > 0 ? formatCurrency(actualTotal) : <span className="text-[#c8d8c8] font-normal">—</span>}
                        </div>
                      </div>
                      <div />
                    </div>
                  ) : (
                    /* ── SINGLE header: Amount ── */
                    <div className="grid grid-cols-[1fr_110px_28px] border-b border-[#e8f0e8]" style={{ backgroundColor: cfg.rowBg }}>
                      <div className="px-4 py-2 flex items-center gap-1.5">
                        <span className="text-sm">{cfg.emoji}</span>
                        <span className="text-sm font-bold" style={{ color: cfg.textColor }}>{cfg.label}</span>
                      </div>
                      <div className="px-2 py-2 text-sm font-bold text-right tabular-nums" style={{ color: cfg.color }}>
                        {expectedTotal > 0 ? formatCurrency(expectedTotal) : <span className="text-[#c8d8c8] font-normal">—</span>}
                      </div>
                      <div />
                    </div>
                  )}

                  {items.map(item => isDual ? (
                    /* ── DUAL row ── */
                    <div key={item.id} className="grid grid-cols-[1fr_90px_90px_28px] border-b border-[#f0f4f0] hover:bg-[#fafcfa] group">
                      <div className="px-4 py-1.5 pl-9 flex items-center">
                        <span className="text-sm text-[#2d4a2d] truncate">{item.name}</span>
                      </div>
                      <div className="px-0.5 py-1 flex items-center justify-end">
                        <AmountInput value={item.amount} onChange={v => updateAmount(item.id, v)} />
                      </div>
                      <div className="px-0.5 py-1 flex items-center justify-end">
                        <AmountInput value={item.actual_amount ?? 0} onChange={v => updateActual(item.id, v)} />
                      </div>
                      <div className="flex items-center justify-center">
                        <button onClick={() => deleteRow(item.id)} className="opacity-0 group-hover:opacity-100 w-4 h-4 rounded text-[#c0b0b0] hover:text-red-500 transition text-xs flex items-center justify-center">×</button>
                      </div>
                    </div>
                  ) : (
                    /* ── SINGLE row ── */
                    <div key={item.id} className="grid grid-cols-[1fr_110px_28px] border-b border-[#f0f4f0] hover:bg-[#fafcfa] group">
                      <div className="px-4 py-2 pl-9 flex items-center">
                        <span className="text-sm text-[#2d4a2d] truncate">{item.name}</span>
                      </div>
                      <div className="px-1 py-1 flex items-center justify-end">
                        <AmountInput value={item.amount} onChange={v => updateAmount(item.id, v)} />
                      </div>
                      <div className="flex items-center justify-center">
                        <button onClick={() => deleteRow(item.id)} className="opacity-0 group-hover:opacity-100 w-4 h-4 rounded text-[#c0b0b0] hover:text-red-500 transition text-xs flex items-center justify-center">×</button>
                      </div>
                    </div>
                  ))}

                  <div className="border-b border-[#f0f4f0]">
                    {isAdding ? (
                      <div className="flex gap-2 pl-9 pr-3 py-2">
                        <input
                          autoFocus value={newRowName}
                          onChange={e => setNewRowName(e.target.value)}
                          onKeyDown={e => { if (e.key === "Enter") addRow(section); if (e.key === "Escape") { setAddingRow(null); setNewRowName(""); } }}
                          placeholder="Item name…"
                          className="flex-1 px-2 py-1 text-sm rounded border border-[#d0e4d0] focus:outline-none focus:ring-1 focus:ring-[#228B22]"
                        />
                        <button onClick={() => addRow(section)} className="px-2 py-1 bg-[#228B22] text-white text-xs rounded hover:bg-[#1a6b1a]">Add</button>
                        <button onClick={() => { setAddingRow(null); setNewRowName(""); }} className="px-2 py-1 text-[#9ab89a] text-xs rounded hover:bg-[#f0f8f0]">Cancel</button>
                      </div>
                    ) : (
                      <button onClick={() => { setAddingRow(section); setNewRowName(""); }} className="w-full text-left pl-9 px-4 py-2 text-xs text-[#228B22] hover:bg-[#f5fbf5] transition font-medium">+ Add row</button>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Footer totals */}
            <div className="grid grid-cols-[1fr_auto_28px] bg-[#f5f8f5] border-t-2 border-[#d0e8d0]">
              <div className="px-4 py-2.5 text-sm font-bold text-[#1a4a1a]">Remaining left</div>
              <div className={`px-3 py-2.5 text-sm font-bold text-right tabular-nums ${income - allocated >= 0 ? "text-[#228B22]" : "text-[#c0516b]"}`}>
                {income - allocated >= 0 ? formatCurrency(income - allocated) : `−${formatCurrency(Math.abs(income - allocated))}`}
              </div>
              <div />
            </div>
            <div className={`grid grid-cols-[1fr_auto_28px] border-t-2 ${amountLeftToSpend >= 0 ? "border-[#228B22] bg-[#eef8ee]" : "border-[#c0516b] bg-[#fff0f2]"}`}>
              <div className="px-4 py-2.5 text-sm font-bold text-[#1a4a1a]">
                Amount left to spend{!goalMet && <span className="font-normal text-[#9ab89a] ml-1 text-xs">(if goal met)</span>}
              </div>
              <div className={`px-3 py-2.5 text-sm font-bold text-right tabular-nums ${amountLeftToSpend >= 0 ? "text-[#228B22]" : "text-[#c0516b]"}`}>
                {amountLeftToSpend >= 0 ? formatCurrency(amountLeftToSpend) : `−${formatCurrency(Math.abs(amountLeftToSpend))}`}
              </div>
              <div />
            </div>
          </div>
        </div>

        {/* RIGHT: Charts column — sticky */}
        <div className="w-72 shrink-0 space-y-4 sticky top-20">

          {/* Chart 1: Budget summary */}
          <div className="bg-white rounded-xl border border-[#e0e8e0] p-4">
            <div className="text-xs font-semibold text-[#5a7a5a] uppercase tracking-wide mb-0.5">Remaining amount</div>
            <div className="text-[10px] text-[#9ab89a] mb-2">income minus allocated</div>
            <div className={`text-2xl font-bold tabular-nums mb-1 ${leftover >= 0 ? "text-[#228B22]" : "text-[#c0516b]"}`}>
              {leftover >= 0 ? formatCurrency(leftover) : `−${formatCurrency(Math.abs(leftover))}`}
            </div>
            <div className="w-full bg-[#e8f0e8] rounded-full h-2.5 overflow-hidden mb-1">
              <div
                className={`h-2.5 rounded-full transition-all duration-500 ${leftover >= 0 ? "bg-[#85BB65]" : "bg-[#c0516b]"}`}
                style={{ width: `${leftPct}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-[#b0c4b0] mb-4">
              <span>Allocated: {formatCurrency(allocated)}</span>
              <span>{Math.round(leftPct)}% remaining</span>
            </div>

            <div className="border-t border-[#f0f4f0] pt-3 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#7a9a7a]">Savings target</span>
                <span className="text-sm font-semibold tabular-nums text-[#1a4a1a]">{formatCurrency(savingsGoal)}</span>
              </div>
              <div className="flex items-start justify-between pt-2 border-t border-[#f0f4f0]">
                <span className="text-xs text-[#7a9a7a] leading-tight max-w-[120px]">Amount spare after savings goal</span>
                <span className={`text-sm font-bold tabular-nums ${amountLeftToSpend >= 0 ? "text-[#228B22]" : "text-[#c0516b]"}`}>
                  {amountLeftToSpend >= 0 ? formatCurrency(amountLeftToSpend) : `−${formatCurrency(Math.abs(amountLeftToSpend))}`}
                </span>
              </div>
            </div>
          </div>

          {/* Chart 2: YTD savings */}
          <div className="bg-white rounded-xl border border-[#e0e8e0] p-4">
            <div className="text-xs font-semibold text-[#5a7a5a] uppercase tracking-wide mb-1">Saved year to date</div>
            <div className="text-2xl font-bold text-[#228B22] tabular-nums mb-3">{formatCurrency(ytdTotal)}</div>
            {ytdData.length > 0 ? (
              <ResponsiveContainer width="100%" height={90}>
                <BarChart data={ytdData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f0" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#9ab89a" }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: "#f0f8f0" }} />
                  <Bar dataKey="saved" radius={[3,3,0,0]}>
                    {ytdData.map((p, i) => (
                      <Cell key={i} fill={p.isCurrent ? "#228B22" : "#85BB65"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-[#b0c4b0] text-center py-6">No data yet this year</div>
            )}
          </div>

          {/* Chart 3: Breakdown */}
          <div className="bg-white rounded-xl border border-[#e0e8e0] p-4">
            <div className="text-xs font-semibold text-[#5a7a5a] uppercase tracking-wide mb-3">Breakdown</div>
            {pieData.length > 0 ? (
              <>
                <div className="flex justify-center mb-3">
                  <PieChart width={120} height={120}>
                    <Pie data={pieData} cx={56} cy={56} innerRadius={32} outerRadius={54} paddingAngle={2} dataKey="value" stroke="none">
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={PIE_COLORS[entry.key as Section]} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                  </PieChart>
                </div>
                <div className="space-y-1.5">
                  {pieData.map(entry => (
                    <div key={entry.name} className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[entry.key as Section] }} />
                      <span className="text-xs text-[#5a7a5a] flex-1">{entry.name}</span>
                      <span className="text-xs font-semibold text-[#1a4a1a] tabular-nums">{formatCurrency(entry.value)}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-xs text-[#b0c4b0] text-center py-6">Enter amounts to see breakdown</div>
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
