"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Beer, Trophy, Users, Gamepad2, Medal, UtensilsCrossed, Camera } from "lucide-react";
import type { SiteConfig } from "@/types";

const ringColors = ["#0085C7", "#F4C300", "#DF0024", "#009F6B"];

const staticLinks = [
  { href: "/home", label: "Home", icon: Beer },
  { href: "/games", label: "Games", icon: Gamepad2 },
  { href: "/teams", label: "Teams", icon: Users },
  { href: "/brackets", label: "Brackets", icon: Trophy },
  { href: "/leaderboard", label: "Leaderboard", icon: Medal },
  { href: "/potluck", label: "Potluck", icon: UtensilsCrossed },
];

export default function Navbar() {
  const pathname = usePathname();
  const [photosVisible, setPhotosVisible] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "config", "site"), (snap) => {
      if (snap.exists()) {
        setPhotosVisible((snap.data() as SiteConfig).photosVisible ?? false);
      }
    });
    return unsub;
  }, []);

  const links = photosVisible
    ? [...staticLinks, { href: "/photos", label: "Photos", icon: Camera }]
    : staticLinks;

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
          <li>
            <a
              href="https://venmo.com/u/Shawnbroderick65"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition text-slate-300 hover:bg-white/8 hover:text-white"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M19.5 2C20.7 4.3 21 6.1 21 8.3c0 5.8-4.9 13.3-8.9 18.6H4.9L2 3.8l7.3-.7 1.5 12.3c1.4-2.4 3.1-6.1 3.1-8.7 0-1.4-.2-2.4-.6-3.2L19.5 2z"/>
              </svg>
              <span className="hidden sm:inline">Venmo</span>
            </a>
          </li>
        </ul>
      </nav>
    </header>
  );
}
