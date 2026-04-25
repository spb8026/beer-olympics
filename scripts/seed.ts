/**
 * Seed script — run once to populate Firestore with initial data.
 *
 * Usage:
 *   1. Fill in your .env.local with Firebase credentials
 *   2. npx ts-node --project tsconfig.json scripts/seed.ts
 *
 * Requires FIREBASE_SERVICE_ACCOUNT_KEY and NEXT_PUBLIC_FIREBASE_PROJECT_ID in env.
 */

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";

const serviceAccount = JSON.parse(
  process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string
);

if (!getApps().length) {
  initializeApp({ credential: cert(serviceAccount) });
}

const db = getFirestore();

const games = [
  {
    id: "beer-pong",
    name: "Beer Pong",
    slug: "beer-pong",
    order: 1,
    gameType: "team-bracket",
    description:
      "The classic. Two teams face off across a table, taking turns throwing a ping pong ball into the opposing team's cups.",
    rules: [
      "Teams of 4 stand at opposite ends of the table",
      "10 cups arranged in a triangle formation on each side",
      "Alternate throwing — sink a cup, opponents must drink it",
      "Bouncing is allowed but opponents can swat after one bounce",
      "Re-rack available once per game when 6 and 3 cups remain",
      "First team to eliminate all opponent cups wins",
    ],
  },
  {
    id: "baseball",
    name: "Baseball",
    slug: "baseball",
    order: 2,
    gameType: "paired-round-robin",
    description:
      "Beer Olympics edition of America's favorite pastime. Hit, run, drink.",
    rules: [
      "4 cups in a row per side representing bases (single, double, triple, home run)",
      "Flip a coin to decide who bats first",
      "Throw a ping pong ball — the cup it lands in determines the base hit",
      "Missing all cups is an out — 3 outs per inning",
      "9 innings total — most runs wins",
      "Runners on base must drink their cup before advancing",
    ],
  },
  {
    id: "rage-cage",
    name: "Rage Cage",
    slug: "rage-cage",
    order: 3,
    gameType: "player-game",
    description:
      "A fast-paced elimination game where speed and bouncing skills are everything.",
    rules: [
      "Fill a large number of cups with beer and place in the center",
      "Two players start on opposite sides, each with a full cup",
      "Drink your cup, then bounce a ping pong ball into your empty cup",
      "Once you sink it, pass your cup and ball clockwise",
      "If you sink it on the first try, you can pass to anyone",
      "If the player behind you sinks it before you, you stack your cup and they take one from the middle",
      "Last cup in the middle — the stacked player drinks it",
    ],
  },
  {
    id: "chandelier",
    name: "Chandelier",
    slug: "chandelier",
    order: 4,
    gameType: "player-game",
    description:
      "Everyone has a cup. One cup rules them all. Sink the center — everyone drinks.",
    rules: [
      "Each player has a cup of beer in front of them",
      "One large cup is placed in the center (the chandelier)",
      "Players take turns bouncing a ball off the table",
      "Sink it in another player's cup — that player drinks",
      "Sink it in the center chandelier — EVERYONE drinks",
      "Chandelier drinker is eliminated; last player standing wins",
      "You must drink before attempting your next bounce",
    ],
  },
  {
    id: "flip-cup",
    name: "Flip Cup",
    slug: "flip-cup",
    order: 5,
    gameType: "team-bracket",
    description:
      "Drink, flip, repeat. The ultimate team relay race.",
    rules: [
      "Two teams line up on opposite sides of the table",
      "Each player has a cup filled to the same level",
      "On 'go', first player drinks, then places cup face-up on edge of table and flips it upside down",
      "Once flipped successfully, the next teammate goes",
      "First team to have all cups flipped wins the round",
      "Best of 3 rounds determines the match winner",
    ],
  },
  {
    id: "hungry-hippo",
    name: "Hungry Hippo",
    slug: "hungry-hippo",
    order: 6,
    gameType: "round-robin",
    description:
      "Inspired by the childhood game — but with beer. Crawl, grab, drink.",
    rules: [
      "One player per team lies on a skateboard or flat surface",
      "Cups are scattered in the middle of the play area",
      "A teammate holds the player's legs and pulls them back and forth",
      "The player on the board grabs as many cups as possible",
      "Once all cups are grabbed, players drink everything they collected",
      "Team with the most cups wins",
      "No standing up — you must remain on the board",
    ],
  },
  {
    id: "bonus-points",
    name: "Bonus Points",
    slug: "bonus-points",
    order: 7,
    gameType: "none",
    description:
      "Extra points up for grabs throughout the day. Awarded by the host for spirit, costume, and special challenges.",
    rules: [
      "Best team theme/costume: +3 points",
      "Winning any side challenge issued by the host: +1 point",
      "Finishing a game without any team member spilling: +1 point",
      "Bonus points are awarded at the host's discretion",
      "Points are cumulative and count toward the overall standings",
    ],
  },
];

async function seed() {
  console.log("Seeding games...");
  for (const game of games) {
    await db.collection("games").doc(game.id).set(game);
    console.log(`  ✓ ${game.name}`);
  }

  console.log("Seeding config...");
  await db.collection("config").doc("site").set({
    accessCode: "BEERS2026",
    eventName: "Beer Olympics 2026",
    eventDate: Timestamp.fromDate(new Date("2026-04-25T12:00:00")),
    location: "Shawn's House",
    bracketsVisible: false,
  });
  console.log("  ✓ config/site");

  console.log("Done!");
}

seed().catch(console.error);
