import { useEffect, useState, useRef, useCallback } from "react";
import { useLocation, useParams } from "wouter";
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

const SECTION_ORDER: Section[] = ["income", "savings", "bills", "needs", "wants", "debt"];
const PIE_COLORS = ["#85BB65","#228B22","#c0516b","#5a8fc0","#d4900a","#8a9aaa"];

const DEFAULT_ROWS: Record<Section, string[]> = {
  income:  ["Paycheck #1", "Paycheck #2", "Side income"],
  savings: ["Emergency fund", "Investments", "Other savings"],
  bills:   ["Rent/Mortgage", "Utilities", "Phone/Internet", "Insurance", "Subscriptions"],
  needs:   ["Groceries", "Transport", "Medical", "Personal care"],
  wants:   ["Eating out", "Shopping", "Entertainment", "Hobbies"],
  debt:    ["Credit cards", "Loans"],
};

const SHORT_MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

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
        className="w-24 py-1 pr-2 text-sm text-right bg-transparent focus:outline-none text-[#1a4a1a] font-medium tabular-nums"
      />
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
  const saveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const monthName = new Date(year, month - 1).toLocaleDateString("en-GB", { month: "long", year: "numeric" });

  // Load current month + YTD bar data
  const loadMonth = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    // Create month if missing
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
        const defaultItems = SECTION_ORDER.flatMap((section, si) =>
          DEFAULT_ROWS[section].map((name, i) => ({
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

    // Load YTD savings per month for bar chart
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

  const totalFor = (section: Section) =>
    lineItems.filter(i => i.section === section).reduce((s, i) => s + i.amount, 0);

  const income    = totalFor("income");
  const saved     = totalFor("savings");
  const expenses  = (["bills","needs","wants","debt"] as Section[]).reduce((a,s) => a + totalFor(s), 0);
  const allocated = saved + expenses;
  const leftover  = income - allocated;
  const leftPct   = income > 0 ? Math.max(0, Math.min(100, (leftover / income) * 100)) : 0;

  const savingsGoal = monthData?.savings_goal ?? 500;
  const goalPct = Math.min(100, Math.round((saved / savingsGoal) * 100));
  const goalMet = saved >= savingsGoal;

  const ytdTotal = ytdData.reduce((a, p) => a + p.saved, 0);

  const pieData = SECTION_ORDER
    .map(s => ({ name: SECTION_CONFIG[s].label, value: totalFor(s) }))
    .filter(d => d.value > 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 rounded-full border-4 border-[#228B22] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-5 space-y-5 pb-10">

      {/* Month nav */}
      <div className="flex items-center justify-between">
        <button onClick={() => navigateMonth(-1)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#e8f0e8] text-[#2d5a2d] transition">←</button>
        <h2 className="text-base font-semibold text-[#1a4a1a]">{monthName}</h2>
        <button onClick={() => navigateMonth(1)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#e8f0e8] text-[#2d5a2d] transition">→</button>
      </div>

      {/* Savings goal strip */}
      <div
        className={`rounded-xl px-5 py-3.5 flex flex-wrap items-center justify-between gap-4 ${goalMet ? "bg-[#228B22]" : "bg-[#d4900a]"}`}
      >
        <div>
          <div className="text-white/80 text-xs mb-0.5">Monthly savings goal</div>
          <div className="text-white font-bold text-xl tabular-nums">
            {formatCurrency(saved)}&nbsp;
            <span className="text-white/60 font-normal text-sm">/ {formatCurrency(savingsGoal)}</span>
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

      {/* ── BUDGET TABLE ── */}
      <div className="bg-white rounded-xl border border-[#e0e8e0] overflow-hidden">
        {/* Column headers */}
        <div className="grid grid-cols-[1fr_150px_32px] bg-[#f5f8f5] border-b border-[#e8f0e8]">
          <div className="px-4 py-2.5 text-xs font-semibold text-[#5a7a5a] uppercase tracking-wide">Item</div>
          <div className="px-2 py-2.5 text-xs font-semibold text-[#5a7a5a] uppercase tracking-wide text-right">Amount</div>
          <div />
        </div>

        {SECTION_ORDER.map(section => {
          const cfg = SECTION_CONFIG[section];
          const items = lineItems.filter(i => i.section === section);
          const sTotal = totalFor(section);
          const isAdding = addingRow === section;

          return (
            <div key={section}>
              {/* Section header */}
              <div className="grid grid-cols-[1fr_150px_32px] border-b border-[#e8f0e8]" style={{ backgroundColor: cfg.rowBg }}>
                <div className="px-4 py-2 flex items-center gap-2">
                  <span className="text-sm">{cfg.emoji}</span>
                  <span className="text-sm font-bold" style={{ color: cfg.textColor }}>{cfg.label}</span>
                </div>
                <div className="px-2 py-2 text-sm font-bold text-right tabular-nums" style={{ color: cfg.color }}>
                  {sTotal > 0 ? formatCurrency(sTotal) : <span className="text-[#c8d8c8] font-normal">—</span>}
                </div>
                <div />
              </div>

              {/* Item rows */}
              {items.map(item => (
                <div key={item.id} className="grid grid-cols-[1fr_150px_32px] border-b border-[#f0f4f0] hover:bg-[#fafcfa] group">
                  <div className="px-4 py-2 pl-10 flex items-center">
                    <span className="text-sm text-[#2d4a2d] truncate">{item.name}</span>
                  </div>
                  <div className="px-1 py-1 flex items-center justify-end">
                    <AmountInput value={item.amount} onChange={v => updateAmount(item.id, v)} />
                  </div>
                  <div className="flex items-center justify-center">
                    <button
                      onClick={() => deleteRow(item.id)}
                      className="opacity-0 group-hover:opacity-100 w-5 h-5 rounded text-[#c0b0b0] hover:text-red-500 hover:bg-red-50 transition text-xs flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}

              {/* Add row */}
              <div className="border-b border-[#f0f4f0]">
                {isAdding ? (
                  <div className="flex items-center gap-2 pl-10 pr-3 py-2">
                    <input
                      autoFocus value={newRowName}
                      onChange={e => setNewRowName(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") addRow(section); if (e.key === "Escape") { setAddingRow(null); setNewRowName(""); } }}
                      placeholder="Item name..."
                      className="flex-1 px-2 py-1 text-sm rounded border border-[#d0e4d0] focus:outline-none focus:ring-1 focus:ring-[#228B22]"
                    />
                    <button onClick={() => addRow(section)} className="px-2 py-1 bg-[#228B22] text-white text-xs rounded hover:bg-[#1a6b1a]">Add</button>
                    <button onClick={() => { setAddingRow(null); setNewRowName(""); }} className="px-2 py-1 text-[#9ab89a] text-xs rounded hover:bg-[#f0f8f0]">Cancel</button>
                  </div>
                ) : (
                  <button
                    onClick={() => { setAddingRow(section); setNewRowName(""); }}
                    className="w-full text-left pl-10 px-4 py-2 text-xs text-[#228B22] hover:bg-[#f5fbf5] transition font-medium"
                  >
                    + Add row
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {/* Footer totals */}
        <div className="grid grid-cols-[1fr_150px_32px] bg-[#f5f8f5] border-t-2 border-[#d0e8d0]">
          <div className="px-4 py-3 text-sm font-bold text-[#1a4a1a]">Total income</div>
          <div className="px-2 py-3 text-sm font-bold text-right tabular-nums text-[#228B22]">{formatCurrency(income)}</div>
          <div />
        </div>
        <div className="grid grid-cols-[1fr_150px_32px] bg-[#f5f8f5] border-t border-[#e8f0e8]">
          <div className="px-4 py-3 text-sm font-bold text-[#1a4a1a]">Total allocated</div>
          <div className="px-2 py-3 text-sm font-bold text-right tabular-nums text-[#c0516b]">{formatCurrency(allocated)}</div>
          <div />
        </div>
        <div className={`grid grid-cols-[1fr_150px_32px] border-t-2 ${leftover >= 0 ? "border-[#228B22] bg-[#eef8ee]" : "border-[#c0516b] bg-[#fff0f2]"}`}>
          <div className="px-4 py-3 text-sm font-bold text-[#1a4a1a]">Left unallocated</div>
          <div className={`px-2 py-3 text-sm font-bold text-right tabular-nums ${leftover >= 0 ? "text-[#228B22]" : "text-[#c0516b]"}`}>
            {leftover >= 0 ? formatCurrency(leftover) : `−${formatCurrency(Math.abs(leftover))}`}
          </div>
          <div />
        </div>
      </div>

      {/* ── 3 CHARTS ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Chart 1: Amount left to spend */}
        <div className="bg-white rounded-xl border border-[#e0e8e0] p-4">
          <div className="text-xs font-semibold text-[#5a7a5a] uppercase tracking-wide mb-2">Amount left to spend</div>
          <div className={`text-2xl font-bold tabular-nums mb-1 ${leftover >= 0 ? "text-[#228B22]" : "text-[#c0516b]"}`}>
            {leftover >= 0 ? formatCurrency(leftover) : `−${formatCurrency(Math.abs(leftover))}`}
          </div>
          <div className="text-xs text-[#9ab89a] mb-3">of {formatCurrency(income)} income</div>
          <div className="w-full bg-[#e8f0e8] rounded-full h-3 overflow-hidden">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${leftover >= 0 ? "bg-[#228B22]" : "bg-[#c0516b]"}`}
              style={{ width: `${leftPct}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-[#b0c4b0] mt-1.5">
            <span>Allocated: {formatCurrency(allocated)}</span>
            <span>{Math.round(leftPct)}% free</span>
          </div>
        </div>

        {/* Chart 2: Total saved YTD */}
        <div className="bg-white rounded-xl border border-[#e0e8e0] p-4">
          <div className="text-xs font-semibold text-[#5a7a5a] uppercase tracking-wide mb-1">Total saved year to date</div>
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
          <div className="text-xs font-semibold text-[#5a7a5a] uppercase tracking-wide mb-2">Breakdown</div>
          {pieData.length > 0 ? (
            <div className="flex items-center gap-3">
              <PieChart width={96} height={96}>
                <Pie
                  data={pieData} cx={44} cy={44}
                  innerRadius={26} outerRadius={44}
                  paddingAngle={2} dataKey="value" stroke="none"
                >
                  {pieData.map((entry, i) => {
                    const sIdx = SECTION_ORDER.findIndex(s => SECTION_CONFIG[s].label === entry.name);
                    return <Cell key={i} fill={PIE_COLORS[sIdx >= 0 ? sIdx : i]} />;
                  })}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
              <div className="flex flex-col gap-1 flex-1 min-w-0">
                {pieData.map((entry, i) => {
                  const sIdx = SECTION_ORDER.findIndex(s => SECTION_CONFIG[s].label === entry.name);
                  return (
                    <div key={entry.name} className="flex items-center gap-1.5 min-w-0">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[sIdx >= 0 ? sIdx : i] }} />
                      <span className="text-[10px] text-[#5a7a5a] truncate flex-1">{entry.name}</span>
                      <span className="text-[10px] font-semibold text-[#1a4a1a] tabular-nums shrink-0">{formatCurrency(entry.value)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-xs text-[#b0c4b0] text-center py-6">Enter amounts to see your breakdown</div>
          )}
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
