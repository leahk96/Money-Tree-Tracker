import { useState } from "react";
import { Link } from "wouter";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { CURRENCY_SYMBOL, formatCurrency, parseCurrency } from "@/lib/currency";
import { Section } from "@/lib/types";

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

// Fake prior months for YTD chart
const PRIOR_MONTHS = [
  { month: "Jan", saved: 220 },
  { month: "Feb", saved: 310 },
  { month: "Mar", saved: 520 },
  { month: "Apr", saved: 500 },
];

interface Item { id: string; name: string; amount: number; }
type SectionData = Record<Section, Item[]>;

const DEMO: SectionData = {
  income:  [{ id:"i1", name:"Salary",        amount:2200 }, { id:"i2", name:"Side income",   amount:300  }],
  savings: [{ id:"s1", name:"Emergency fund",amount:200  }, { id:"s2", name:"Investments",    amount:150  }],
  bills:   [{ id:"b1", name:"Rent",           amount:950  }, { id:"b2", name:"Utilities",      amount:85   }, { id:"b3", name:"Subscriptions", amount:45 }],
  needs:   [{ id:"n1", name:"Groceries",      amount:280  }, { id:"n2", name:"Transport",      amount:120  }],
  wants:   [{ id:"w1", name:"Eating out",     amount:160  }, { id:"w2", name:"Entertainment",  amount:60   }],
  debt:    [{ id:"d1", name:"Credit card",    amount:100  }],
};

function AmountInput({ value, onChange }: { value: number; onChange: (v: string) => void }) {
  const [focused, setFocused] = useState(false);
  const [local, setLocal] = useState(value === 0 ? "" : String(value));
  return (
    <div className={`flex items-center rounded border transition-all ${focused ? "border-[#228B22] bg-white ring-1 ring-[#228B22]/20" : "border-transparent bg-transparent"}`}>
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

const CUSTOM_TOOLTIP = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-[#e8f0e8] rounded-lg px-3 py-2 shadow text-xs">
      <span className="font-semibold text-[#1a4a1a]">{formatCurrency(payload[0].value)}</span>
    </div>
  );
};

export default function BudgetDemo() {
  const [sections, setSections] = useState<SectionData>(DEMO);
  const [addingRow, setAddingRow] = useState<Section | null>(null);
  const [newRowName, setNewRowName] = useState("");

  const update = (section: Section, id: string, val: string) => {
    const amount = parseCurrency(val);
    setSections(p => ({ ...p, [section]: p[section].map(i => i.id === id ? { ...i, amount } : i) }));
  };
  const addRow = (section: Section) => {
    if (!newRowName.trim()) return;
    setSections(p => ({ ...p, [section]: [...p[section], { id: `r-${Date.now()}`, name: newRowName.trim(), amount: 0 }] }));
    setNewRowName(""); setAddingRow(null);
  };
  const deleteRow = (section: Section, id: string) =>
    setSections(p => ({ ...p, [section]: p[section].filter(i => i.id !== id) }));

  const total = (s: Section) => sections[s].reduce((a, i) => a + i.amount, 0);
  const income = total("income");
  const saved = total("savings");
  const expenses = (["bills","needs","wants","debt"] as Section[]).reduce((a,s) => a + total(s), 0);
  const allocated = saved + expenses;
  const leftToSpend = income - allocated;
  const leftPct = income > 0 ? Math.max(0, Math.min(100, (leftToSpend / income) * 100)) : 0;

  const ytdSaved = PRIOR_MONTHS.reduce((a, m) => a + m.saved, 0) + saved;
  const ytdData = [...PRIOR_MONTHS, { month: "May", saved }];

  const pieData = SECTION_ORDER.map(s => ({ name: SECTION_CONFIG[s].label, value: total(s) })).filter(d => d.value > 0);

  const savingsGoal = 500;
  const goalPct = Math.min(100, Math.round((saved / savingsGoal) * 100));
  const goalMet = saved >= savingsGoal;

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <div className="bg-[#228B22] text-white text-center text-sm py-2 px-4">
        Demo preview — <Link to="/signup" className="underline font-medium">Sign up free</Link> to save your data
      </div>

      <header className="flex items-center justify-between px-6 py-3.5 bg-white border-b border-[#e8f0e8] sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <span className="text-xl">🌳</span>
          <span className="text-base font-bold text-[#1a4a1a]">Money Tree</span>
        </div>
        <nav className="hidden md:flex items-center gap-1">
          {[{label:"Budget",to:"/demo"},{label:"My Tree",to:"/tree-demo"},{label:"Settings",to:"/settings"}].map(n => (
            <Link key={n.to} to={n.to} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${n.to==="/demo" ? "bg-[#e8f5e8] text-[#228B22]" : "text-[#5a7a5a] hover:bg-[#f0f8f0]"}`}>{n.label}</Link>
          ))}
        </nav>
        <Link to="/signup" className="text-sm bg-[#228B22] text-white px-4 py-2 rounded-lg hover:bg-[#1a6b1a] transition font-medium">Get started</Link>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-5 space-y-5 pb-10">

        {/* Month + goal banner */}
        <div className="flex items-center justify-between">
          <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#e8f0e8] text-[#2d5a2d] transition">←</button>
          <h2 className="text-base font-semibold text-[#1a4a1a]">May 2026</h2>
          <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#e8f0e8] text-[#2d5a2d] transition">→</button>
        </div>

        {/* Savings goal strip */}
        <div className={`rounded-xl px-5 py-3.5 flex items-center justify-between gap-4 ${goalMet ? "bg-[#228B22]" : "bg-[#d4900a]"}`}>
          <div>
            <div className="text-white/80 text-xs mb-0.5">Monthly savings goal</div>
            <div className="text-white font-bold text-xl tabular-nums">
              {formatCurrency(saved)} <span className="text-white/60 font-normal text-sm">/ {formatCurrency(savingsGoal)}</span>
            </div>
          </div>
          <div className="flex-1 max-w-xs">
            <div className="w-full bg-white/25 rounded-full h-2">
              <div className="bg-white rounded-full h-2 transition-all duration-500" style={{ width: `${goalPct}%` }} />
            </div>
            <div className="text-white/80 text-xs mt-1 text-right">
              {goalMet ? "✓ Goal met — tree growing!" : `${formatCurrency(savingsGoal - saved)} to go`}
            </div>
          </div>
          <button className="text-white/70 hover:text-white text-xs underline shrink-0">Edit goal</button>
        </div>

        {/* ── BUDGET TABLE ── */}
        <div className="bg-white rounded-xl border border-[#e0e8e0] overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[1fr_140px_32px] border-b border-[#e8f0e8] bg-[#f5f8f5]">
            <div className="px-4 py-2.5 text-xs font-semibold text-[#5a7a5a] uppercase tracking-wide">Item</div>
            <div className="px-2 py-2.5 text-xs font-semibold text-[#5a7a5a] uppercase tracking-wide text-right">Amount</div>
            <div />
          </div>

          {SECTION_ORDER.map((section, sIdx) => {
            const cfg = SECTION_CONFIG[section];
            const items = sections[section];
            const sTotal = total(section);
            const isAdding = addingRow === section;

            return (
              <div key={section}>
                {/* Section header row */}
                <div
                  className="grid grid-cols-[1fr_140px_32px] border-b border-[#e8f0e8]"
                  style={{ backgroundColor: cfg.rowBg }}
                >
                  <div className="px-4 py-2 flex items-center gap-2">
                    <span className="text-sm">{cfg.emoji}</span>
                    <span className="text-sm font-bold" style={{ color: cfg.textColor }}>{cfg.label}</span>
                  </div>
                  <div className="px-2 py-2 text-sm font-bold text-right tabular-nums" style={{ color: cfg.color }}>
                    {sTotal > 0 ? formatCurrency(sTotal) : <span className="text-[#c0d0c0] font-normal">—</span>}
                  </div>
                  <div />
                </div>

                {/* Item rows */}
                {items.map((item, idx) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-[1fr_140px_32px] border-b border-[#f0f4f0] hover:bg-[#fafcfa] group"
                  >
                    <div className="px-4 py-2 pl-10 flex items-center">
                      <span className="text-sm text-[#2d4a2d] truncate">{item.name}</span>
                    </div>
                    <div className="px-1 py-1 flex items-center justify-end">
                      <AmountInput value={item.amount} onChange={v => update(section, item.id, v)} />
                    </div>
                    <div className="flex items-center justify-center">
                      <button
                        onClick={() => deleteRow(section, item.id)}
                        className="opacity-0 group-hover:opacity-100 w-5 h-5 rounded text-[#c0b0b0] hover:text-red-500 hover:bg-red-50 transition text-xs flex items-center justify-center"
                        title="Delete"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}

                {/* Add row */}
                <div className={`border-b border-[#f0f4f0] ${sIdx < SECTION_ORDER.length - 1 ? "" : ""}`}>
                  {isAdding ? (
                    <div className="flex items-center gap-2 pl-10 pr-3 py-2">
                      <input
                        autoFocus
                        value={newRowName}
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

          {/* Table footer — totals */}
          <div className="grid grid-cols-[1fr_140px_32px] bg-[#f5f8f5] border-t-2 border-[#d0e8d0]">
            <div className="px-4 py-3 text-sm font-bold text-[#1a4a1a]">Total income</div>
            <div className="px-2 py-3 text-sm font-bold text-right tabular-nums text-[#228B22]">{formatCurrency(income)}</div>
            <div />
          </div>
          <div className="grid grid-cols-[1fr_140px_32px] bg-[#f5f8f5] border-t border-[#e8f0e8]">
            <div className="px-4 py-3 text-sm font-bold text-[#1a4a1a]">Total allocated</div>
            <div className="px-2 py-3 text-sm font-bold text-right tabular-nums text-[#c0516b]">{formatCurrency(allocated)}</div>
            <div />
          </div>
          <div className={`grid grid-cols-[1fr_140px_32px] border-t-2 ${leftToSpend >= 0 ? "border-[#228B22] bg-[#eef8ee]" : "border-[#c0516b] bg-[#fff0f2]"}`}>
            <div className="px-4 py-3 text-sm font-bold text-[#1a4a1a]">Left unallocated</div>
            <div className={`px-2 py-3 text-sm font-bold text-right tabular-nums ${leftToSpend >= 0 ? "text-[#228B22]" : "text-[#c0516b]"}`}>
              {leftToSpend >= 0 ? formatCurrency(leftToSpend) : `−${formatCurrency(Math.abs(leftToSpend))}`}
            </div>
            <div />
          </div>
        </div>

        {/* ── 3 CHARTS ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Chart 1: Amount left to spend */}
          <div className="bg-white rounded-xl border border-[#e0e8e0] p-4">
            <div className="text-xs font-semibold text-[#5a7a5a] uppercase tracking-wide mb-3">Amount left to spend</div>
            <div className={`text-2xl font-bold tabular-nums mb-2 ${leftToSpend >= 0 ? "text-[#228B22]" : "text-[#c0516b]"}`}>
              {leftToSpend >= 0 ? formatCurrency(leftToSpend) : `−${formatCurrency(Math.abs(leftToSpend))}`}
            </div>
            <div className="text-xs text-[#9ab89a] mb-3">of {formatCurrency(income)} income</div>
            <div className="w-full bg-[#e8f0e8] rounded-full h-3 overflow-hidden">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${leftToSpend >= 0 ? "bg-[#228B22]" : "bg-[#c0516b]"}`}
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
            <div className="text-2xl font-bold text-[#228B22] tabular-nums mb-3">{formatCurrency(ytdSaved)}</div>
            <ResponsiveContainer width="100%" height={90}>
              <BarChart data={ytdData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f0" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#9ab89a" }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip content={<CUSTOM_TOOLTIP />} cursor={{ fill: "#f0f8f0" }} />
                <Bar dataKey="saved" radius={[3,3,0,0]}>
                  {ytdData.map((_, i) => (
                    <Cell key={i} fill={i === ytdData.length - 1 ? "#228B22" : "#85BB65"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Chart 3: Breakdown pie */}
          <div className="bg-white rounded-xl border border-[#e0e8e0] p-4">
            <div className="text-xs font-semibold text-[#5a7a5a] uppercase tracking-wide mb-1">Breakdown</div>
            <div className="flex items-center gap-3">
              <PieChart width={100} height={100}>
                <Pie
                  data={pieData}
                  cx={45} cy={45}
                  innerRadius={28} outerRadius={46}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[SECTION_ORDER.indexOf(SECTION_ORDER.find(s => SECTION_CONFIG[s].label === pieData[i].name)!)]} />
                  ))}
                </Pie>
                <Tooltip content={<CUSTOM_TOOLTIP />} />
              </PieChart>
              <div className="flex flex-col gap-1 flex-1 min-w-0">
                {pieData.map((entry, i) => {
                  const sIdx = SECTION_ORDER.findIndex(s => SECTION_CONFIG[s].label === entry.name);
                  return (
                    <div key={entry.name} className="flex items-center gap-1.5 min-w-0">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[sIdx] }} />
                      <span className="text-[10px] text-[#5a7a5a] truncate flex-1">{entry.name}</span>
                      <span className="text-[10px] font-semibold text-[#1a4a1a] tabular-nums shrink-0">{formatCurrency(entry.value)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
