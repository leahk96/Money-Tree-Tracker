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
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      {/* Top nav — desktop */}
      <header className="hidden md:flex items-center justify-between px-6 py-3 bg-white border-b border-[#E8E8E8] sticky top-0 z-40">
        <Link to="/tree" className="flex items-center gap-2">
          <img src="/logo.png" className="h-8 w-8 object-contain" alt="Money Tree Tracker" />
          <span className="text-lg font-bold text-[#1B5E20]">Money Tree Tracker</span>
        </Link>

        <nav className="flex items-center gap-0.5">
          {NAV.map(item => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                isActive(item)
                  ? "bg-[#E8F5E9] text-[#17914A]"
                  : "text-[#546E7A] hover:bg-[#F5F5F5] hover:text-[#17914A]"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <button
          onClick={signOut}
          className="text-sm text-[#546E7A] hover:text-[#1B5E20] transition px-3 py-2 rounded-lg hover:bg-[#F5F5F5]"
        >
          Sign out
        </button>
      </header>

      {/* Content */}
      <main className="flex-1 pb-24 md:pb-0">
        {children}
      </main>

      {/* Bottom nav — mobile */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-[#E8E8E8] z-40">
        <div className="flex">
          {NAV.map(item => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition ${
                isActive(item)
                  ? "text-[#17914A]"
                  : "text-[#9E9E9E] hover:text-[#546E7A]"
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
