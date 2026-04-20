"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Beer, Trophy, Users, Gamepad2, Medal, UtensilsCrossed } from "lucide-react";

const links = [
  { href: "/home", label: "Home", icon: Beer },
  { href: "/games", label: "Games", icon: Gamepad2 },
  { href: "/teams", label: "Teams", icon: Users },
  { href: "/brackets", label: "Brackets", icon: Trophy },
  { href: "/leaderboard", label: "Leaderboard", icon: Medal },
  { href: "/potluck", label: "Potluck", icon: UtensilsCrossed },
];

const ringColors = ["#0085C7", "#F4C300", "#DF0024", "#009F6B"];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header
      className="sticky top-0 z-50 backdrop-blur"
      style={{
        background: "rgba(4,10,26,0.92)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {/* Olympic ring accent bar */}
      <div className="h-0.5 w-full flex">
        {ringColors.map((color) => (
          <div key={color} className="flex-1" style={{ background: color }} />
        ))}
      </div>

      <nav className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
        <Link href="/home" className="flex items-center gap-2 font-black text-lg tracking-tight text-yellow-400">
          <Beer className="w-5 h-5" />
          Beer Olympics
        </Link>

        <ul className="flex items-center gap-1">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
                    active
                      ? "bg-yellow-400 text-slate-900"
                      : "text-slate-300 hover:bg-white/8 hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
