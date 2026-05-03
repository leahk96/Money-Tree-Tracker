import { useState } from "react";
import { Link } from "wouter";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { CURRENCY_SYMBOL, formatCurrency, parseCurrency } from "@/lib/currency";
import { Section } from "@/lib/types";

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
const PRIOR_MONTHS = [
  { month: "Jan", saved: 220 },
  { month: "Feb", saved: 310 },
  { month: "Mar", saved: 520 },
  { month: "Apr", saved: 500 },
];

interface Item { id: string; name: string; amount: number; actual_amount: number | null; }
type SectionData = Record<Section, Item[]>;

const DEMO: SectionData = {
  income:  [{ id:"i1", name:"Salary",         amount:2200, actual_amount:null }, { id:"i2", name:"Side income",   amount:300,  actual_amount:null }],
  savings: [{ id:"s1", name:"Emergency fund", amount:200,  actual_amount:null }, { id:"s2", name:"Investments",   amount:150,  actual_amount:null }],
  bills:   [{ id:"b1", name:"Rent",            amount:950,  actual_amount:null }, { id:"b2", name:"Utilities",     amount:85,   actual_amount:null }, { id:"b3", name:"Subscriptions", amount:45, actual_amount:null }],
  needs:   [{ id:"n1", name:"Groceries",       amount:280,  actual_amount:312  }, { id:"n2", name:"Transport",     amount:120,  actual_amount:98   }],
  wants:   [{ id:"w1", name:"Eating out",      amount:160,  actual_amount:null }, { id:"w2", name:"Entertainment", amount:60,   actual_amount:45   }],
  debt:    [{ id:"d1", name:"Credit card",     amount:100,  actual_amount:null }],
};

function AmountInput({ value, onChange }: { value: number; onChange: (v: string) => void }) {
  const [focused, setFocused] = useState(false);
  const [local, setLocal] = useState(value === 0 ? "" : String(value));
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

const ChartTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-[#E8E8E8] rounded-lg px-3 py-1.5 shadow text-xs font-semibold text-[#1B5E20]">
      {formatCurrency(payload[0].value)}
    </div>
  );
};

function SideBySideSection({
  section, items, addingRow, newRowName,
  onUpdate, onDelete, onAddStart, onAddConfirm, onAddCancel, onNewRowNameChange,
}: {
  section: Section; items: Item[]; addingRow: Section | null; newRowName: string;
  onUpdate: (s: Section, id: string, v: string) => void;
  onDelete: (s: Section, id: string) => void;
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
          <AmountInput value={item.amount} onChange={v => onUpdate(section, item.id, v)} />
          <button onClick={() => onDelete(section, item.id)} className="opacity-0 group-hover:opacity-100 ml-1 w-4 h-4 rounded text-[#BDBDBD] hover:text-red-500 transition text-xs flex items-center justify-center">×</button>
        </div>
      ))}
      <div className="px-3 py-1.5">
        {isAdding ? (
          <div className="flex gap-1">
            <input autoFocus value={newRowName} onChange={e => onNewRowNameChange(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") onAddConfirm(section); if (e.key === "Escape") onAddCancel(); }}
              placeholder="Item name…" className="flex-1 min-w-0 px-2 py-0.5 text-xs rounded border border-[#D0D0D0] focus:outline-none focus:ring-1 focus:ring-[#2E7D32]" />
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

export default function BudgetDemo() {
  const [sections, setSections] = useState<SectionData>(DEMO);
  const [addingRow, setAddingRow] = useState<Section | null>(null);
  const [newRowName, setNewRowName] = useState("");

  const updateExpected = (section: Section, id: string, val: string) => {
    const amount = parseCurrency(val);
    setSections(p => ({ ...p, [section]: p[section].map(i => i.id === id ? { ...i, amount } : i) }));
  };
  const updateActual = (section: Section, id: string, val: string) => {
    const actual_amount = val === "" ? null : parseCurrency(val);
    setSections(p => ({ ...p, [section]: p[section].map(i => i.id === id ? { ...i, actual_amount } : i) }));
  };
  const addRow = (section: Section) => {
    if (!newRowName.trim()) return;
    setSections(p => ({ ...p, [section]: [...p[section], { id: `r-${Date.now()}`, name: newRowName.trim(), amount: 0, actual_amount: null }] }));
    setNewRowName(""); setAddingRow(null);
  };
  const deleteRow = (section: Section, id: string) =>
    setSections(p => ({ ...p, [section]: p[section].filter(i => i.id !== id) }));

  const effectiveAmount = (item: Item, section: Section) =>
    DUAL_AMOUNT_SECTIONS.includes(section) && item.actual_amount !== null && item.actual_amount !== undefined
      ? item.actual_amount : item.amount;

  const totalExpected = (s: Section) => sections[s].reduce((a, i) => a + i.amount, 0);
  const totalActual   = (s: Section) => sections[s].reduce((a, i) => a + effectiveAmount(i, s), 0);

  const income    = totalExpected("income");
  const expenses  = ["bills","debt"].reduce((a, s) => a + totalExpected(s as Section), 0)
                  + totalActual("needs") + totalActual("wants");
  const allocated = expenses; // savings excluded from "Total allocated"
  const saved     = income - expenses; // remaining balance IS the savings contribution

  const savingsGoal = 500;
  const goalPct = Math.min(100, Math.round((saved / savingsGoal) * 100));
  const goalMet = saved >= savingsGoal;
  const savingsShortfall = Math.max(0, savingsGoal - saved);
  const amountLeftToSpend = saved - savingsGoal; // spare after hitting goal
  const leftPct = savingsGoal > 0 ? Math.max(0, Math.min(100, (saved / savingsGoal) * 100)) : 0;

  const ytdData = [...PRIOR_MONTHS, { month: "May", saved }];
  const ytdTotal = PRIOR_MONTHS.reduce((a, m) => a + m.saved, 0) + saved;

  const OUTGOING_SECTIONS: Section[] = ["bills", "needs", "wants", "debt"];
  const pieData = [
    ...OUTGOING_SECTIONS
      .map(s => ({ name: SECTION_CONFIG[s].label, value: totalActual(s), key: s, color: PIE_COLORS[s] }))
      .filter(d => d.value > 0),
    ...(saved > 0 ? [{ name: "Savings", value: saved, key: "savings", color: "#4CAF50" }] : []),
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="bg-[#2E7D32] text-white text-center text-sm py-2 px-4">
        Demo preview — <Link to="/signup" className="underline font-medium">Sign up free</Link> to save your data
      </div>

      <header className="flex items-center justify-between px-6 py-3.5 bg-white border-b border-[#E8E8E8] sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <span className="text-xl">🌳</span>
          <span className="text-base font-bold text-[#1B5E20]">Money Tree</span>
        </div>
        <nav className="hidden md:flex items-center gap-1">
          {[
            { label: "Budget",  to: "/demo" },
            { label: "My Tree", to: "/tree-demo" },
            { label: "Garden",  to: "/garden-demo" },
            { label: "Summary", to: "/summary-demo" },
          ].map(n => (
            <Link key={n.to} to={n.to} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${n.to === "/demo" ? "bg-[#E8F5E9] text-[#2E7D32]" : "text-[#546E7A] hover:bg-[#F5F5F5]"}`}>{n.label}</Link>
          ))}
        </nav>
        <Link to="/signup" className="text-sm bg-[#2E7D32] text-white px-4 py-2 rounded-lg hover:bg-[#1B5E20] transition font-medium">Get started</Link>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-5 pb-10">
        <div className="flex items-center justify-between mb-4">
          <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#E8E8E8] text-[#2E7D32] transition">←</button>
          <h2 className="text-base font-semibold text-[#1B5E20]">May 2026</h2>
          <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#E8E8E8] text-[#2E7D32] transition">→</button>
        </div>

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
          <button className="text-white/70 hover:text-white text-xs underline shrink-0">Edit goal</button>
        </div>

        <div className="flex gap-5 items-start">

          {/* LEFT: Budget table */}
          <div className="flex-1 min-w-0 space-y-3">

            {/* Income + Savings side by side */}
            <div className="flex gap-3">
              <SideBySideSection section="income" items={sections.income} addingRow={addingRow} newRowName={newRowName}
                onUpdate={updateExpected} onDelete={deleteRow}
                onAddStart={s => { setAddingRow(s); setNewRowName(""); }}
                onAddConfirm={addRow} onAddCancel={() => { setAddingRow(null); setNewRowName(""); }}
                onNewRowNameChange={setNewRowName} />
              <SideBySideSection section="savings" items={sections.savings} addingRow={addingRow} newRowName={newRowName}
                onUpdate={updateExpected} onDelete={deleteRow}
                onAddStart={s => { setAddingRow(s); setNewRowName(""); }}
                onAddConfirm={addRow} onAddCancel={() => { setAddingRow(null); setNewRowName(""); }}
                onNewRowNameChange={setNewRowName} />
            </div>

            {/* Expense table */}
            <div className="bg-white rounded-xl border border-[#E0E0E0] overflow-hidden">

              {EXPENSE_SECTIONS.map(section => {
                const cfg = SECTION_CONFIG[section];
                const items = sections[section];
                const isDual = DUAL_AMOUNT_SECTIONS.includes(section);
                const isAdding = addingRow === section;
                const expectedTotal = items.reduce((a, i) => a + i.amount, 0);
                const actualTotal   = isDual ? items.reduce((a, i) => a + (i.actual_amount ?? i.amount), 0) : expectedTotal;
                const hasActual     = isDual && items.some(i => i.actual_amount !== null && i.actual_amount !== undefined);

                return (
                  <div key={section}>
                    {isDual ? (
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
                      <div key={item.id} className="grid grid-cols-[1fr_90px_90px_28px] border-b border-[#F5F5F5] hover:bg-[#FAFAFA] group">
                        <div className="px-4 py-1.5 pl-9 flex items-center">
                          <span className="text-sm text-[#37474F] truncate">{item.name}</span>
                        </div>
                        <div className="px-0.5 py-1 flex items-center justify-end">
                          <AmountInput value={item.amount} onChange={v => updateExpected(section, item.id, v)} />
                        </div>
                        <div className="px-0.5 py-1 flex items-center justify-end">
                          <AmountInput value={item.actual_amount ?? 0} onChange={v => updateActual(section, item.id, v)} />
                        </div>
                        <div className="flex items-center justify-center">
                          <button onClick={() => deleteRow(section, item.id)} className="opacity-0 group-hover:opacity-100 w-4 h-4 rounded text-[#BDBDBD] hover:text-red-500 transition text-xs flex items-center justify-center">×</button>
                        </div>
                      </div>
                    ) : (
                      <div key={item.id} className="grid grid-cols-[1fr_110px_28px] border-b border-[#F5F5F5] hover:bg-[#FAFAFA] group">
                        <div className="px-4 py-2 pl-9 flex items-center">
                          <span className="text-sm text-[#37474F] truncate">{item.name}</span>
                        </div>
                        <div className="px-1 py-1 flex items-center justify-end">
                          <AmountInput value={item.amount} onChange={v => updateExpected(section, item.id, v)} />
                        </div>
                        <div className="flex items-center justify-center">
                          <button onClick={() => deleteRow(section, item.id)} className="opacity-0 group-hover:opacity-100 w-4 h-4 rounded text-[#BDBDBD] hover:text-red-500 transition text-xs flex items-center justify-center">×</button>
                        </div>
                      </div>
                    ))}

                    <div className="border-b border-[#F5F5F5]">
                      {isAdding ? (
                        <div className="flex gap-2 pl-9 pr-3 py-2">
                          <input autoFocus value={newRowName} onChange={e => setNewRowName(e.target.value)}
                            onKeyDown={e => { if (e.key === "Enter") addRow(section); if (e.key === "Escape") { setAddingRow(null); setNewRowName(""); } }}
                            placeholder="Item name…" className="flex-1 px-2 py-1 text-sm rounded border border-[#D0D0D0] focus:outline-none focus:ring-1 focus:ring-[#2E7D32]" />
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

          {/* RIGHT: Charts column */}
          <div className="w-72 shrink-0 space-y-4 sticky top-20">

            {/* Budget summary widget */}
            <div className="bg-white rounded-xl border border-[#E0E0E0] p-4">
              <div className="text-xs font-semibold text-[#546E7A] uppercase tracking-wide mb-0.5">Remaining amount</div>
              <div className="text-[10px] text-[#9E9E9E] mb-2">after expenses &amp; savings goal</div>
              <div className={`text-2xl font-bold tabular-nums mb-1 ${amountLeftToSpend >= 0 ? "text-[#2E7D32]" : "text-[#C62828]"}`}>
                {amountLeftToSpend >= 0 ? formatCurrency(amountLeftToSpend) : `−${formatCurrency(Math.abs(amountLeftToSpend))}`}
              </div>
              <div className="w-full bg-[#E8E8E8] rounded-full h-2.5 overflow-hidden mb-1">
                <div className={`h-2.5 rounded-full transition-all duration-500 ${amountLeftToSpend >= 0 ? "bg-[#4CAF50]" : "bg-[#C62828]"}`} style={{ width: `${income > 0 ? Math.max(0, Math.min(100, (amountLeftToSpend / income) * 100)) : 0}%` }} />
              </div>
              <div className="flex justify-between text-[10px] text-[#9E9E9E] mb-4">
                <span>Expenses: {formatCurrency(allocated)}</span>
                <span>{Math.round(goalPct)}% of goal met</span>
              </div>

              <div className="border-t border-[#F5F5F5] pt-3 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#607D8B]">Savings target</span>
                  <span className="text-sm font-semibold tabular-nums text-[#1B5E20]">{formatCurrency(savingsGoal)}</span>
                </div>
                <div className="flex items-start justify-between pt-2 border-t border-[#F5F5F5]">
                  <span className="text-xs text-[#607D8B] leading-tight max-w-[120px]">Remaining balance</span>
                  <span className={`text-sm font-bold tabular-nums ${saved >= 0 ? "text-[#2E7D32]" : "text-[#C62828]"}`}>
                    {saved >= 0 ? formatCurrency(saved) : `−${formatCurrency(Math.abs(saved))}`}
                  </span>
                </div>
              </div>
            </div>

            {/* YTD savings */}
            <div className="bg-white rounded-xl border border-[#E0E0E0] p-4">
              <div className="text-xs font-semibold text-[#546E7A] uppercase tracking-wide mb-1">Saved year to date</div>
              <div className="text-2xl font-bold text-[#2E7D32] tabular-nums mb-3">{formatCurrency(ytdTotal)}</div>
              <ResponsiveContainer width="100%" height={90}>
                <BarChart data={ytdData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F5" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#9E9E9E" }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: "#F5F5F5" }} />
                  <Bar dataKey="saved" radius={[3,3,0,0]}>
                    {ytdData.map((_, i) => (
                      <Cell key={i} fill={i === ytdData.length - 1 ? "#2E7D32" : "#4CAF50"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Breakdown pie */}
            <div className="bg-white rounded-xl border border-[#E0E0E0] p-4">
              <div className="text-xs font-semibold text-[#546E7A] uppercase tracking-wide mb-3">Breakdown</div>
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
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
