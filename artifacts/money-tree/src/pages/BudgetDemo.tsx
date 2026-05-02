import { useState, useRef } from "react";
import { Link } from "wouter";
import { CURRENCY_SYMBOL, formatCurrency, parseCurrency } from "@/lib/currency";
import { Section } from "@/lib/types";

const SECTION_CONFIG: Record<Section, { label: string; emoji: string; bg: string; border: string }> = {
  savings: { label: "Savings", emoji: "🌱", bg: "#f0f8f0", border: "#228B22" },
  income:  { label: "Income",  emoji: "💰", bg: "#f5faf5", border: "#4a9a4a" },
  bills:   { label: "Bills",   emoji: "🏠", bg: "#fdf5f7", border: "#E8B4B8" },
  needs:   { label: "Needs",   emoji: "🛒", bg: "#f0f6ff", border: "#7FB3D5" },
  wants:   { label: "Wants",   emoji: "✨", bg: "#fffbf0", border: "#F5B041" },
  debt:    { label: "Debt",    emoji: "💳", bg: "#f6f7f8", border: "#9aa8b5" },
};

const SECTION_ORDER: Section[] = ["savings", "income", "bills", "needs", "wants", "debt"];

interface Item { id: string; name: string; amount: number; }
type SectionData = Record<Section, Item[]>;

const DEMO_DATA: SectionData = {
  savings:  [{ id: "s1", name: "Emergency fund", amount: 200 }, { id: "s2", name: "Investments", amount: 150 }],
  income:   [{ id: "i1", name: "Paycheck #1", amount: 2200 }, { id: "i2", name: "Side income", amount: 300 }],
  bills:    [{ id: "b1", name: "Rent", amount: 950 }, { id: "b2", name: "Utilities", amount: 85 }, { id: "b3", name: "Subscriptions", amount: 45 }],
  needs:    [{ id: "n1", name: "Groceries", amount: 280 }, { id: "n2", name: "Transport", amount: 120 }],
  wants:    [{ id: "w1", name: "Eating out", amount: 160 }, { id: "w2", name: "Entertainment", amount: 60 }],
  debt:     [{ id: "d1", name: "Credit card", amount: 100 }],
};

export default function BudgetDemo() {
  const [sections, setSections] = useState<SectionData>(DEMO_DATA);
  const [addingRow, setAddingRow] = useState<Section | null>(null);
  const [newRowName, setNewRowName] = useState("");
  const saveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const updateAmount = (section: Section, id: string, value: string) => {
    const amount = parseCurrency(value);
    setSections(prev => ({
      ...prev,
      [section]: prev[section].map(i => i.id === id ? { ...i, amount } : i),
    }));
  };

  const addRow = (section: Section) => {
    if (!newRowName.trim()) return;
    const newItem: Item = { id: `custom-${Date.now()}`, name: newRowName.trim(), amount: 0 };
    setSections(prev => ({ ...prev, [section]: [...prev[section], newItem] }));
    setNewRowName("");
    setAddingRow(null);
  };

  const deleteRow = (section: Section, id: string) => {
    setSections(prev => ({ ...prev, [section]: prev[section].filter(i => i.id !== id) }));
  };

  const totalFor = (section: Section) => sections[section].reduce((s, i) => s + i.amount, 0);
  const totalSaved = totalFor("savings");
  const totalIncome = totalFor("income");
  const totalSpent = (["bills","needs","wants","debt"] as Section[]).reduce((s, sec) => s + totalFor(sec), 0);
  const savingsGoal = 500;
  const goalPct = Math.min(100, Math.round((totalSaved / savingsGoal) * 100));
  const goalMet = totalSaved >= savingsGoal;

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      {/* Demo banner */}
      <div className="bg-[#228B22] text-white text-center text-sm py-2 px-4 flex items-center justify-center gap-3">
        <span>This is a live demo preview. <Link to="/signup" className="underline font-medium">Sign up</Link> to save your data.</span>
      </div>

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-[#e8f0e8]">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌳</span>
          <span className="text-lg font-bold text-[#1a4a1a]">Money Tree</span>
        </div>
        <nav className="hidden md:flex items-center gap-1">
          {[{label:"Budget",to:"/demo"},{label:"My Tree",to:"/tree"},{label:"Analytics",to:"/analytics"},{label:"Settings",to:"/settings"}].map(n => (
            <Link key={n.to} to={n.to} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${n.to==="/demo" ? "bg-[#e8f5e8] text-[#228B22]" : "text-[#5a7a5a] hover:bg-[#f0f8f0]"}`}>{n.label}</Link>
          ))}
        </nav>
        <Link to="/signup" className="text-sm bg-[#228B22] text-white px-4 py-2 rounded-lg hover:bg-[#1a6b1a] transition font-medium">Get started</Link>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5 pb-10">
        {/* Month nav */}
        <div className="flex items-center justify-between">
          <button className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[#e8f0e8] text-[#2d5a2d] transition text-lg">←</button>
          <h2 className="text-lg font-semibold text-[#1a4a1a]">May 2026</h2>
          <button className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[#e8f0e8] text-[#2d5a2d] transition text-lg">→</button>
        </div>

        {/* Goal banner */}
        <div className={`rounded-2xl p-5 ${goalMet ? "bg-gradient-to-r from-green-500 to-emerald-400" : "bg-gradient-to-r from-[#FFD700] to-[#F5B041]"}`}>
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="text-white/80 text-sm font-medium mb-1">Monthly savings goal</div>
              <div className="text-white text-3xl font-bold">
                {formatCurrency(totalSaved)} <span className="text-white/70 text-xl">/ {formatCurrency(savingsGoal)}</span>
              </div>
            </div>
            <button className="text-white/80 hover:text-white text-sm underline">Edit</button>
          </div>
          <div className="w-full bg-white/30 rounded-full h-2 mb-2">
            <div className="bg-white rounded-full h-2 transition-all duration-700" style={{ width: `${goalPct}%` }} />
          </div>
          <div className="text-white/90 text-sm font-medium">
            {goalMet ? "✓ Goal met! Your tree is growing" : `${formatCurrency(savingsGoal - totalSaved)} to go · ${goalPct}%`}
          </div>
        </div>

        {/* Summary */}
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

        {/* Sections */}
        {SECTION_ORDER.map(section => {
          const cfg = SECTION_CONFIG[section];
          const items = sections[section];
          const total = totalFor(section);

          return (
            <div key={section} className="bg-white rounded-xl border border-[#e8f0e8] overflow-hidden" style={{ borderLeftColor: cfg.border, borderLeftWidth: 3 }}>
              <div className="flex items-center justify-between px-4 pt-4 pb-2" style={{ backgroundColor: cfg.bg }}>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{cfg.emoji}</span>
                  <span className="font-semibold text-[#1a4a1a]">{cfg.label}</span>
                </div>
                <span className="font-bold text-[#1a4a1a]">{formatCurrency(total)}</span>
              </div>

              <div className="divide-y divide-[#f0f4f0]">
                {items.map(item => (
                  <DemoRow key={item.id} item={item} section={section} onUpdate={updateAmount} onDelete={deleteRow} />
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
                  <button onClick={() => { setAddingRow(section); setNewRowName(""); }} className="text-sm text-[#228B22] hover:text-[#1a6b1a] font-medium flex items-center gap-1">
                    <span className="text-base">+</span> Add row
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DemoRow({ item, section, onUpdate, onDelete }: {
  item: { id: string; name: string; amount: number };
  section: Section;
  onUpdate: (section: Section, id: string, value: string) => void;
  onDelete: (section: Section, id: string) => void;
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
            type="number" min="0" step="0.01"
            value={focused ? localValue : (item.amount === 0 ? "" : String(item.amount))}
            onChange={e => { setLocalValue(e.target.value); onUpdate(section, item.id, e.target.value); }}
            onFocus={() => { setFocused(true); setLocalValue(item.amount === 0 ? "" : String(item.amount)); }}
            onBlur={() => setFocused(false)}
            placeholder="0"
            className="w-24 pr-2 py-1.5 text-sm text-right bg-transparent focus:outline-none text-[#1a4a1a] font-medium"
          />
        </div>
        <div className="relative">
          <button onClick={() => setShowMenu(v => !v)} className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded flex items-center justify-center text-[#9ab89a] hover:text-[#5a7a5a] hover:bg-[#e8f0e8] transition text-xs">···</button>
          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-7 bg-white border border-[#e8f0e8] rounded-lg shadow-lg z-20 py-1 min-w-[120px]">
                <button onClick={() => { onDelete(section, item.id); setShowMenu(false); }} className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition">Delete row</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
