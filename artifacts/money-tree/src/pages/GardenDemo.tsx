import { useLocation, Link } from "wouter";
import { motion } from "framer-motion";
import { MoneyTreeSVG } from "@/components/MoneyTreeSVG";
import { useCurrency } from "@/contexts/CurrencyContext";

const DEMO_YEARS = [
  { year: 2024, goalsMetCount: 12, totalSaved: 6000, isCurrent: false, hasData: true, bullionEarned: true },
  { year: 2025, goalsMetCount: 11, totalSaved: 6200, isCurrent: false, hasData: true, bullionEarned: false },
  { year: 2026, goalsMetCount: 3,  totalSaved: 1550, isCurrent: true,  hasData: true, bullionEarned: false },
];
const FUTURE_YEARS = [2027, 2028];

const DEMO_NAV = [
  { label: "Budget",  to: "/demo" },
  { label: "My Tree", to: "/tree-demo" },
  { label: "Garden",  to: "/garden-demo" },
  { label: "Summary", to: "/summary-demo" },
];

function TreePlot({ d, onClick }: { d: typeof DEMO_YEARS[0]; onClick: () => void }) {
  const { fmt } = useCurrency();
  const badge = d.goalsMetCount === 12 ? "🏆" : d.goalsMetCount >= 9 ? "⭐" : null;
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.04, y: -3 }}
      whileTap={{ scale: 0.97 }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition w-full text-left ${
        d.isCurrent
          ? "bg-white border-2 border-[#FFD700] shadow-md"
          : "bg-white border border-[#E8E8E8] hover:border-[#4CAF50]"
      }`}
    >
      {d.isCurrent && (
        <span className="text-[10px] font-bold text-[#c09000] bg-[#fff8e0] border border-[#FFD700] rounded-full px-2 py-0.5 -mb-1">
          GROWING NOW
        </span>
      )}
      <div className="w-full">
        <MoneyTreeSVG monthsGoalMet={d.goalsMetCount} />
      </div>
      <div className="text-center w-full">
        <div className="flex items-center justify-center gap-1">
          <span className="text-sm font-bold text-[#1B5E20]">{d.year}</span>
          {badge && <span className="text-sm">{badge}</span>}
        </div>
        <div className="text-[11px] text-[#2E7D32] font-semibold mt-0.5">
          {d.goalsMetCount}/12 goals
        </div>
        <div className="text-[10px] text-[#607D8B]">{fmt(d.totalSaved)} saved</div>
        {!d.isCurrent && (
          <div className="text-[9px] text-[#9E9E9E] mt-0.5 uppercase tracking-wide">Year complete</div>
        )}
      </div>
    </motion.button>
  );
}

function GoldBullion({ year, saved }: { year: number; saved: number }) {
  const { fmt } = useCurrency();
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -3, scale: 1.04 }}
      className="flex flex-col items-center gap-1.5"
    >
      <svg viewBox="0 0 120 72" className="w-24 h-auto drop-shadow-md">
        <defs>
          <linearGradient id={`gold-g-${year}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#FFE566" />
            <stop offset="30%"  stopColor="#D4AF37" />
            <stop offset="60%"  stopColor="#B8860B" />
            <stop offset="100%" stopColor="#8B6914" />
          </linearGradient>
          <linearGradient id={`gold-top-${year}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#FFF0A0" />
            <stop offset="100%" stopColor="#D4AF37" />
          </linearGradient>
          <linearGradient id={`gold-side-${year}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#A07820" />
            <stop offset="100%" stopColor="#6B4F10" />
          </linearGradient>
        </defs>
        <polygon points="10,55 110,55 110,65 10,65" fill={`url(#gold-side-${year})`} />
        <rect x="10" y="22" width="100" height="33" rx="3" fill={`url(#gold-g-${year})`} />
        <polygon points="18,14 102,14 110,22 10,22" fill={`url(#gold-top-${year})`} />
        <polygon points="102,14 110,22 110,55 102,47" fill={`url(#gold-side-${year})`} opacity="0.7" />
        <rect x="18" y="27" width="30" height="4" rx="2" fill="white" opacity="0.2" />
        <text x="60" y="43" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#6B4F10" fontFamily="sans-serif">
          {year}
        </text>
      </svg>
      <div className="text-center">
        <div className="text-[10px] font-bold text-[#D4AF37]">12/12</div>
        <div className="text-[9px] text-[#9E9E9E]">{fmt(saved)} saved</div>
      </div>
    </motion.div>
  );
}

function LockedBullion() {
  return (
    <div className="flex flex-col items-center gap-1.5 opacity-40">
      <svg viewBox="0 0 120 72" className="w-24 h-auto">
        <rect x="10" y="22" width="100" height="33" rx="3" fill="#D0D0D0" />
        <polygon points="18,14 102,14 110,22 10,22" fill="#E8E8E8" />
        <polygon points="102,14 110,22 110,55 102,47" fill="#B0B0B0" />
        <polygon points="10,55 110,55 110,65 10,65" fill="#A0A0A0" />
        <text x="60" y="43" textAnchor="middle" fontSize="18" fontFamily="sans-serif" fill="#B0B0B0">🔒</text>
      </svg>
      <div className="text-[9px] text-[#BDBDBD] text-center">Hit 12/12 goals<br/>to unlock</div>
    </div>
  );
}

function EmptyPlot({ year }: { year: number }) {
  return (
    <div className="flex flex-col items-center gap-2 opacity-35">
      <div className="w-full aspect-square flex items-center justify-center">
        <svg viewBox="0 0 360 348" className="w-full max-w-[120px] mx-auto">
          <ellipse cx={180} cy={334} rx={52} ry={7} fill="#7a3c10" opacity={0.08} />
          <path d="M149 272 L157 304 Q180 314 203 304 L211 272 Z" fill="#c07838" opacity={0.5} />
          <rect x={141} y={265} width={78} height={12} rx={5} fill="#9e5e26" opacity={0.5} />
          <ellipse cx={180} cy={271} rx={34} ry={6} fill="#4a2810" opacity={0.5} />
        </svg>
      </div>
      <div className="text-center">
        <div className="text-xs font-semibold text-[#9E9E9E]">{year}</div>
        <div className="text-[10px] text-[#BDBDBD] mt-0.5">Not started</div>
      </div>
    </div>
  );
}

export default function GardenDemo() {
  const { fmt } = useCurrency();
  const [, navigate] = useLocation();
  const totalSaved = DEMO_YEARS.reduce((s, d) => s + d.totalSaved, 0);
  const totalGoals = DEMO_YEARS.reduce((s, d) => s + d.goalsMetCount, 0);
  const bullionYears = DEMO_YEARS.filter(d => d.bullionEarned);

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="bg-[#2E7D32] text-white text-center text-sm py-2 px-4">
        Demo preview — <Link to="/signup" className="underline font-medium">Sign up free</Link> to grow your own garden
      </div>

      <header className="flex items-center justify-between px-6 py-3.5 bg-white border-b border-[#E8E8E8] sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <span className="text-xl">🌳</span>
          <span className="text-base font-bold text-[#1B5E20]">Money Tree</span>
        </div>
        <nav className="hidden md:flex items-center gap-1">
          {DEMO_NAV.map(n => (
            <Link key={n.to} to={n.to}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                n.to === "/garden-demo"
                  ? "bg-[#E8F5E9] text-[#2E7D32]"
                  : "text-[#546E7A] hover:bg-[#F5F5F5]"
              }`}
            >{n.label}</Link>
          ))}
        </nav>
        <Link to="/signup" className="text-sm bg-[#2E7D32] text-white px-4 py-2 rounded-lg hover:bg-[#1B5E20] transition font-medium">
          Get started
        </Link>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 pb-12 space-y-6">
        <div>
          <h1 className="text-xl font-bold text-[#1B5E20]">My Garden</h1>
          <p className="text-xs text-[#607D8B] mt-0.5">
            Every year you use Money Tree, a new tree grows in your garden.
          </p>
        </div>

        {/* All-time stats */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-3 gap-2">
          {[
            { label: "Years active",    value: String(DEMO_YEARS.length) },
            { label: "Goals hit",       value: String(totalGoals) },
            { label: "All-time saved",  value: fmt(totalSaved) },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-[#E8E8E8] p-3 text-center">
              <div className="text-base font-bold text-[#2E7D32]">{s.value}</div>
              <div className="text-[10px] text-[#607D8B] mt-0.5">{s.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Current year */}
        <div>
          <div className="text-xs font-semibold text-[#546E7A] uppercase tracking-wider mb-2">This year</div>
          <div className="max-w-[200px]">
            <TreePlot
              d={DEMO_YEARS.find(d => d.isCurrent)!}
              onClick={() => navigate("/summary-demo")}
            />
          </div>
        </div>

        {/* Past years */}
        <div>
          <div className="text-xs font-semibold text-[#546E7A] uppercase tracking-wider mb-2">Past years</div>
          <div className="grid grid-cols-3 gap-3">
            {DEMO_YEARS.filter(d => !d.isCurrent).map(d => (
              <TreePlot key={d.year} d={d} onClick={() => navigate("/summary-demo")} />
            ))}
          </div>
        </div>

        {/* Future plots */}
        <div>
          <div className="text-xs font-semibold text-[#546E7A] uppercase tracking-wider mb-2">Future plots</div>
          <div className="grid grid-cols-3 gap-3">
            {FUTURE_YEARS.map(y => <EmptyPlot key={y} year={y} />)}
            <div className="flex flex-col items-center gap-2 opacity-20">
              <div className="w-full aspect-square flex items-center justify-center">
                <div className="w-16 h-16 rounded-full border-2 border-dashed border-[#9E9E9E] flex items-center justify-center text-2xl text-[#9E9E9E]">+</div>
              </div>
              <div className="text-[10px] text-[#c0d0c0] text-center">And more…</div>
            </div>
          </div>
        </div>

        {/* Bullion Collection */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-[#fffbe6] to-[#fff3c0] rounded-2xl border border-[#e8d870] p-5"
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">🏅</span>
            <h2 className="text-sm font-bold text-[#8B6914]">Gold Bullion Collection</h2>
            {bullionYears.length > 0 && (
              <span className="ml-auto text-[10px] font-bold text-[#D4AF37] bg-[#fff8cc] border border-[#e8d870] rounded-full px-2 py-0.5">
                {bullionYears.length} bar{bullionYears.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
          <p className="text-[11px] text-[#a08030] mb-4">
            Earn a gold bar by hitting all 12 monthly savings goals in a year.
          </p>

          {bullionYears.length > 0 ? (
            <div className="flex flex-wrap gap-5 justify-start">
              {bullionYears.map(d => (
                <GoldBullion key={d.year} year={d.year} saved={d.totalSaved} />
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <LockedBullion />
              <div className="text-xs text-[#b09040]">
                <div className="font-semibold mb-0.5">No bullion yet</div>
                <div className="text-[#c0a050]">Hit all 12 goals in a calendar year to cast your first gold bar.</div>
              </div>
            </div>
          )}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="bg-gradient-to-r from-[#f0fbf0] to-[#E8F5E9] rounded-2xl border border-[#c8e8c8] p-5 text-center"
        >
          <div className="text-2xl mb-2">🌳</div>
          <div className="text-sm font-semibold text-[#1B5E20]">Build your garden year on year</div>
          <div className="text-xs text-[#546E7A] mt-1 mb-3">Each year you save, a new tree joins your garden.</div>
          <Link to="/signup" className="inline-block bg-[#2E7D32] text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-[#1B5E20] transition">
            Start your garden →
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
