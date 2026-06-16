import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/contexts/ProfileContext";
import { supabase } from "@/lib/supabase";

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
  const { signOut, user } = useAuth();
  const { isPremium } = useProfile();
  const [location] = useLocation();

  const isActive = (item: NavItem) =>
    item.match.some(p => location === p || location.startsWith(p + "/"));

  const handleSignOut = async () => {
    if (!isPremium && user) {
      await supabase.from("months").delete().eq("user_id", user.id);
    }
    await signOut();
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      {/* Top nav — desktop */}
      <header className="hidden md:flex flex-col sticky top-0 z-40">
        <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-[#E8E8E8]">
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
            onClick={handleSignOut}
            className="text-sm text-[#546E7A] hover:text-[#1B5E20] transition px-3 py-2 rounded-lg hover:bg-[#F5F5F5]"
          >
            Sign out
          </button>
        </div>

        {/* Upgrade banner — desktop */}
        {!isPremium && (
          <div className="flex items-center justify-between px-6 py-2 bg-[#17914A] text-white">
            <span className="text-sm">Upgrade to save your progress — pay once, yours forever.</span>
            <button className="ml-4 px-4 py-1.5 bg-white text-[#17914A] font-semibold rounded-lg text-xs hover:bg-gray-50 transition whitespace-nowrap">
              Upgrade
            </button>
          </div>
        )}
      </header>

      {/* Content */}
      <main className={`flex-1 md:pb-0 ${isPremium ? "pb-[72px]" : "pb-[120px]"}`}>
        {children}
      </main>

      {/* Upgrade banner — mobile, fixed above bottom nav */}
      {!isPremium && (
        <div className="md:hidden fixed bottom-[60px] inset-x-0 z-30 flex items-center justify-between px-4 py-2.5 bg-[#17914A] text-white">
          <span className="text-xs font-medium leading-tight">Pay once — save your progress forever.</span>
          <button className="ml-3 px-3 py-1.5 bg-white text-[#17914A] font-semibold rounded-lg text-xs whitespace-nowrap">
            Upgrade
          </button>
        </div>
      )}

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
