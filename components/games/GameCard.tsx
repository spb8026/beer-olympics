import { CheckCircle } from "lucide-react";
import type { Game } from "@/types";

const gameEmojis: Record<string, string> = {
  "beer-pong": "🏓",
  baseball: "⚾",
  "rage-cage": "🌪️",
  chandelier: "🔔",
  "flip-cup": "🥤",
  "hungry-hippo": "🦛",
  "bonus-points": "⭐",
};

const ringColors = ["#0085C7", "#F4C300", "#DF0024", "#009F6B", "#0085C7", "#F4C300", "#DF0024"];

export default function GameCard({ game, index = 0 }: { game: Game; index?: number }) {
  const emoji = gameEmojis[game.slug] ?? "🍺";
  const accentColor = ringColors[index % ringColors.length];

  return (
    <div
      className="rounded-2xl p-6 flex flex-col gap-4"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: `1px solid rgba(255,255,255,0.08)`,
        borderLeft: `4px solid ${accentColor}`,
      }}
    >
      <div className="flex items-start gap-4">
        <div className="text-4xl">{emoji}</div>
        <div>
          <h2 className="text-xl font-black text-white">{game.name}</h2>
          <p className="text-slate-400 text-sm mt-1">{game.description}</p>
        </div>
      </div>

      {game.rules.length > 0 && (
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">
            Rules
          </h3>
          <ul className="flex flex-col gap-2">
            {game.rules.map((rule, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: accentColor }} />
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
