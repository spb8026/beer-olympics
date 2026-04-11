"use client";

import { useState, useEffect } from "react";
import { useGames } from "@/hooks/useGames";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import BracketView from "@/components/brackets/BracketView";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { Lock, Trophy } from "lucide-react";
import type { SiteConfig } from "@/types";

export default function BracketsPage() {
  const { games, loading: gamesLoading } = useGames();
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "config", "site"), (snap) => {
      if (snap.exists()) setConfig(snap.data() as SiteConfig);
    });
    return unsub;
  }, []);

  if (!config?.bracketsVisible) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <div
            className="rounded-full p-5"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <Lock className="w-10 h-10 text-slate-500" />
          </div>
          <h1 className="text-2xl font-black text-white">Brackets Not Live Yet</h1>
          <p className="text-slate-500 text-center max-w-sm">
            Brackets will be revealed on game day. Come back then for live results!
          </p>
        </div>
      </div>
    );
  }

  const bracketGames = games.filter((g) => g.slug !== "bonus-points");
  const activeGame = bracketGames.find((g) => g.id === selectedGame) ?? bracketGames[0];
  const ringColors = ["#0085C7", "#F4C300", "#DF0024", "#009F6B", "#0085C7"];

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-black text-yellow-400 mb-2 flex items-center gap-2">
          <Trophy className="w-8 h-8" /> Live Brackets
        </h1>
        <p className="text-slate-400">Updates live as games are played.</p>
      </div>

      {gamesLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          <div className="flex flex-wrap gap-2 mb-8">
            {bracketGames.map((game, i) => {
              const isActive = (selectedGame ?? bracketGames[0]?.id) === game.id;
              const color = ringColors[i % ringColors.length];
              return (
                <button
                  key={game.id}
                  onClick={() => setSelectedGame(game.id)}
                  className="px-4 py-2 rounded-xl text-sm font-bold transition"
                  style={
                    isActive
                      ? { background: color, color: "#040a1a" }
                      : {
                          background: "rgba(255,255,255,0.05)",
                          border: `1px solid rgba(255,255,255,0.1)`,
                          color: "#94a3b8",
                        }
                  }
                >
                  {game.name}
                </button>
              );
            })}
          </div>

          {activeGame && (
            <div
              className="rounded-2xl p-6"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <h2 className="text-xl font-black text-white mb-6">{activeGame.name}</h2>
              <BracketView game={activeGame} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
