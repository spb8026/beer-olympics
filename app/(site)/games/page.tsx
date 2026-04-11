"use client";

import { useGames } from "@/hooks/useGames";
import GameCard from "@/components/games/GameCard";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function GamesPage() {
  const { games, loading } = useGames();

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-black text-yellow-400 mb-2">Games & Rules</h1>
        <p className="text-slate-400">
          Everything you need to know before game day. Study up.
        </p>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : games.length === 0 ? (
        <p className="text-slate-500 text-center py-20">Games coming soon.</p>
      ) : (
        <div className="grid gap-5">
          {games.map((game, i) => (
            <GameCard key={game.id} game={game} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
