import { useEffect, useState, useRef, useCallback } from "react";
import { useLocation, useParams } from "wouter";
import { AppLayout } from "@/components/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/contexts/ProfileContext";
import { formatCurrency, parseCurrency, CURRENCY_SYMBOL } from "@/lib/currency";
import { Section, Month, LineItem } from "@/lib/types";

const SECTION_CONFIG: Record<Section, { label: string; emoji: string; color: string; bg: string; border: string }> = {
  savings: { label: "Savings", emoji: "🌱", color: "#228B22", bg: "#f0f8f0", border: "#228B22" },
  income:  { label: "Income",  emoji: "💰", color: "#2d6a2d", bg: "#f5faf5", border: "#4a9a4a" },
  bills:   { label: "Bills",   emoji: "🏠", color: "#c0516b", bg: "#fdf5f7", border: "#E8B4B8" },
  needs:   { label: "Needs",   emoji: "🛒", color: "#2b6cb0", bg: "#f0f6ff", border: "#7FB3D5" },
  wants:   { label: "Wants",   emoji: "✨", color: "#b7791f", bg: "#fffbf0", border: "#F5B041" },
  debt:    { label: "Debt",    emoji: "💳", color: "#5a6672", bg: "#f6f7f8", border: "#9aa8b5" },
};

const SECTION_ORDER: Section[] = ["savings", "income", "bills", "needs", "wants", "debt"];

const DEFAULT_ROWS: Record<Section, string[]> = {
  savings: ["Emergency fund", "Investments", "Other savings"],
  income:  ["Paycheck #1", "Paycheck #2", "Side income"],
  bills:   ["Rent/Mortgage", "Utilities", "Phone/Internet", "Insurance", "Subscriptions"],
  needs:   ["Groceries", "Transport", "Medical", "Personal care"],
  wants:   ["Eating out", "Shopping", "Entertainment", "Hobbies"],
  debt:    ["Credit cards", "Loans"],
};

function BudgetContent() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const params = useParams<{ year?: string; month?: string }>();
  const [, navigate] = useLocation();

  const now = new Date();
  const year = params.year ? parseInt(params.year) : now.getFullYear();
  const month = params.month ? parseInt(params.month) : now.getMonth() + 1;

  const [monthData, setMonthData] = useState<Month | null>(null);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingRow, setAddingRow] = useState<Section | null>(null);
  const [newRowName, setNewRowName] = useState("");
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState("");
  const saveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const monthName = new Date(year, month - 1).toLocaleDateString("en-GB", { month: "long", year: "numeric" });

  const loadMonth = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    let { data: existing } = await supabase
      .from("months")
      .select("*")
      .eq("user_id", user.id)
      .eq("year", year)
      .eq("month", month)
      .single();

    if (!existing) {
      const goal = profile?.default_monthly_goal ?? 500;
      const { data: created } = await supabase
        .from("months")
        .insert({ user_id: user.id, year, month, savings_goal: goal })
        .select()
        .single();
      existing = created;

      if (created) {
        const defaultItems = SECTION_ORDER.flatMap((section, si) =>
          DEFAULT_ROWS[section].map((name, i) => ({
            month_id: created.id,
            section,
            name,
            amount: 0,
            sort_order: si * 100 + i,
            is_custom: false,
          }))
        );
        await supabase.from("line_items").insert(defaultItems);
      }
    }

    setMonthData(existing);

    if (existing) {
      const { data: items } = await supabase
        .from("line_items")
        .select("*")
        .eq("month_id", existing.id)
        .order("sort_order");
      setLineItems(items ?? []);
    }

    setLoading(false);
  }, [user, year, month, profile]);

  useEffect(() => { loadMonth(); }, [loadMonth]);

  const navigateMonth = (dir: -1 | 1) => {
    let m = month + dir;
    let y = year;
    if (m < 1) { m = 12; y--; }
    if (m > 12) { m = 1; y++; }
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
      .insert({
        month_id: monthData.id,
        section,
        name: newRowName.trim(),
        amount: 0,
        sort_order: sortOrder,
        is_custom: true,
      })
      .select()
      .single();

    if (data) {
      setLineItems(prev => [...prev, data]);
    }
    setNewRowName("");
    setAddingRow(null);
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

  const totalForSection = (section: Section) =>
    lineItems.filter(i => i.section === section).reduce((sum, i) => sum + i.amount, 0);

  const totalSaved = totalForSection("savings");
  const totalIncome = totalForSection("income");
  const totalSpent = (["bills", "needs", "wants", "debt"] as Section[]).reduce((s, sec) => s + totalForSection(sec), 0);
  const savingsGoal = monthData?.savings_goal ?? 500;
  const goalPct = Math.min(100, Math.round((totalSaved / savingsGoal) * 100));
  const goalMet = totalSaved >= savingsGoal;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 rounded-full border-4 border-[#228B22] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <button onClick={() => navigateMonth(-1)} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[#e8f0e8] text-[#2d5a2d] transition text-lg">
          ←
        </button>
        <h2 className="text-lg font-semibold text-[#1a4a1a]">{monthName}</h2>
        <button onClick={() => navigateMonth(1)} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[#e8f0e8] text-[#2d5a2d] transition text-lg">
          →
        </button>
      </div>

      {/* Savings Goal Banner */}
      <div className={`rounded-2xl p-5 ${goalMet ? "bg-gradient-to-r from-green-500 to-emerald-400" : "bg-gradient-to-r from-[#FFD700] to-[#F5B041]"}`}>
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="text-white/80 text-sm font-medium mb-1">Monthly savings goal</div>
            <div className="text-white text-3xl font-bold">
              {formatCurrency(totalSaved)} <span className="text-white/70 text-xl">/ {formatCurrency(savingsGoal)}</span>
            </div>
          </div>
          <button
            onClick={() => { setGoalInput(String(savingsGoal)); setEditingGoal(true); }}
            className="text-white/80 hover:text-white text-sm underline"
          >
            Edit
          </button>
        </div>

        <div className="w-full bg-white/30 rounded-full h-2 mb-2">
          <div
            className="bg-white rounded-full h-2 transition-all duration-700"
            style={{ width: `${goalPct}%` }}
          />
        </div>

        <div className="text-white/90 text-sm font-medium">
          {goalMet ? "✓ Goal met! Your tree is growing" : `${formatCurrency(savingsGoal - totalSaved)} to go · ${goalPct}%`}
        </div>
      </div>

      {/* Edit goal modal */}
      {editingGoal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="font-semibold text-[#1a4a1a] mb-4">Update savings goal</h3>
            <div className="relative mb-4">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#228B22] font-semibold">{CURRENCY_SYMBOL}</span>
              <input
                type="number"
                value={goalInput}
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

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-xl border border-[#e8f0e8] p-4">
          <div className="text-xs text-[#5a7a5a] mb-1">Income this month</div>
          <div className="text-xl font-bold text-[#228B22]">{formatCurrency(totalIncome)}</div>
        </div>
        <div className="bg-white rounded-xl border border-[#e8f0e8] p-4">
          <div className="text-xs text-[#5a7a5a] mb-1">Total spent</div>
          <div className="text-xl font-bold text-[#c0516b]">{formatCurrency(totalSpent)}</div>
        </div>
      </div>

      {/* Budget sections */}
      {SECTION_ORDER.map(section => {
        const cfg = SECTION_CONFIG[section];
        const items = lineItems.filter(i => i.section === section);
        const total = items.reduce((s, i) => s + i.amount, 0);

        return (
          <div
            key={section}
            className="bg-white rounded-xl border border-[#e8f0e8] overflow-hidden"
            style={{ borderLeftColor: cfg.border, borderLeftWidth: 3 }}
          >
            <div className="flex items-center justify-between px-4 pt-4 pb-2" style={{ backgroundColor: cfg.bg }}>
              <div className="flex items-center gap-2">
                <span className="text-lg">{cfg.emoji}</span>
                <span className="font-semibold text-[#1a4a1a]">{cfg.label}</span>
              </div>
              <span className="font-bold text-[#1a4a1a]">{formatCurrency(total)}</span>
            </div>

            <div className="divide-y divide-[#f0f4f0]">
              {items.map(item => (
                <LineItemRow
                  key={item.id}
                  item={item}
                  onAmountChange={updateAmount}
                  onDelete={deleteRow}
                />
              ))}
            </div>

            <div className="px-4 pb-3 pt-2">
              {addingRow === section ? (
                <div className="flex gap-2">
                  <input
                    autoFocus
                    value={newRowName}
                    onChange={e => setNewRowName(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") addRow(section); if (e.key === "Escape") { setAddingRow(null); setNewRowName(""); } }}
                    placeholder="Row name..."
                    className="flex-1 px-3 py-2 text-sm rounded-lg border border-[#d0e4d0] focus:outline-none focus:ring-2 focus:ring-[#228B22] text-[#1a4a1a]"
                  />
                  <button onClick={() => addRow(section)} className="px-3 py-2 bg-[#228B22] text-white text-sm rounded-lg hover:bg-[#1a6b1a]">Add</button>
                  <button onClick={() => { setAddingRow(null); setNewRowName(""); }} className="px-3 py-2 text-[#5a7a5a] text-sm rounded-lg hover:bg-[#f0f8f0]">Cancel</button>
                </div>
              ) : (
                <button
                  onClick={() => { setAddingRow(section); setNewRowName(""); }}
                  className="text-sm text-[#228B22] hover:text-[#1a6b1a] font-medium flex items-center gap-1"
                >
                  <span className="text-base">+</span> Add row
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function LineItemRow({ item, onAmountChange, onDelete }: {
  item: LineItem;
  onAmountChange: (id: string, value: string) => void;
  onDelete: (id: string) => void;
}) {
  const [focused, setFocused] = useState(false);
  const [localValue, setLocalValue] = useState(item.amount === 0 ? "" : String(item.amount));
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="flex items-center justify-between px-4 py-2.5 hover:bg-[#fafcfa] group relative">
      <span className="text-sm text-[#2d4a2d] flex-1 min-w-0 pr-2 truncate">{item.name}</span>

      <div className="flex items-center gap-2">
        <div className={`flex items-center rounded-lg border transition ${focused ? "border-[#228B22] ring-1 ring-[#228B22]/30" : "border-transparent bg-[#f5f8f5]"}`}>
          <span className="pl-2 text-sm text-[#5a7a5a]">{CURRENCY_SYMBOL}</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={focused ? localValue : (item.amount === 0 ? "" : String(item.amount))}
            onChange={e => {
              setLocalValue(e.target.value);
              onAmountChange(item.id, e.target.value);
            }}
            onFocus={() => { setFocused(true); setLocalValue(item.amount === 0 ? "" : String(item.amount)); }}
            onBlur={() => { setFocused(false); }}
            placeholder="0"
            className="w-24 pr-2 py-1.5 text-sm text-right bg-transparent focus:outline-none text-[#1a4a1a] font-medium"
          />
        </div>

        <div className="relative">
          <button
            onClick={() => setShowMenu(v => !v)}
            className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded flex items-center justify-center text-[#9ab89a] hover:text-[#5a7a5a] hover:bg-[#e8f0e8] transition text-xs"
          >
            ···
          </button>
          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-7 bg-white border border-[#e8f0e8] rounded-lg shadow-lg z-20 py-1 min-w-[120px]">
                <button
                  onClick={() => { onDelete(item.id); setShowMenu(false); }}
                  className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                >
                  Delete row
                </button>
              </div>
            </>
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
