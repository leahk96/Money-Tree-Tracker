import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";

interface NavItem {
  to: string;
  label: string;
  icon: string;
  match: string[];
}

const NAV: NavItem[] = [
  { to: "/budget",   label: "Budget",   icon: "📋", match: ["/budget"]   },
  { to: "/tree",     label: "My Tree",  icon: "🌳", match: ["/tree"]     },
  { to: "/garden",   label: "Garden",   icon: "🌿", match: ["/garden"]   },
  { to: "/summary",  label: "Summary",  icon: "📊", match: ["/summary"]  },
  { to: "/settings", label: "Settings", icon: "⚙️", match: ["/settings"] },
];

export function AppLayout({ children }: { children: ReactNode }) {
  const { signOut } = useAuth();
  const [location] = useLocation();

  const isActive = (item: NavItem) =>
    item.match.some(p => location === p || location.startsWith(p + "/"));

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col">
      {/* Top nav — desktop */}
      <header className="hidden md:flex items-center justify-between px-6 py-3 bg-white border-b border-[#e8f0e8] sticky top-0 z-40">
        <Link to="/tree" className="flex items-center gap-2">
          <span className="text-2xl">🌳</span>
          <span className="text-lg font-bold text-[#1a4a1a]">Money Tree</span>
        </Link>

        <nav className="flex items-center gap-0.5">
          {NAV.map(item => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                isActive(item)
                  ? "bg-[#e8f5e8] text-[#228B22]"
                  : "text-[#5a7a5a] hover:bg-[#f0f8f0] hover:text-[#2d5a2d]"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <button
          onClick={signOut}
          className="text-sm text-[#5a7a5a] hover:text-[#1a4a1a] transition px-3 py-2 rounded-lg hover:bg-[#f0f8f0]"
        >
          Sign out
        </button>
      </header>

      {/* Content */}
      <main className="flex-1 pb-24 md:pb-0">
        {children}
      </main>

      {/* Bottom nav — mobile */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-[#e8f0e8] z-40">
        <div className="flex">
          {NAV.map(item => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition ${
                isActive(item)
                  ? "text-[#228B22]"
                  : "text-[#9ab89a] hover:text-[#5a7a5a]"
              }`}
            >
              <span className="text-lg leading-none">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
