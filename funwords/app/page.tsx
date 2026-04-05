"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { staggerContainer, bounceIn, slideUp } from "@/lib/animations";
import { useGameStore } from "@/stores/gameStore";

const titleLetters = [
  { char: "F", color: "text-candy" },
  { char: "u", color: "text-orange" },
  { char: "n", color: "text-sun" },
  { char: "W", color: "text-grass" },
  { char: "o", color: "text-sky" },
  { char: "r", color: "text-purple" },
  { char: "d", color: "text-mint" },
  { char: "s", color: "text-coral" },
  { char: "!", color: "text-candy" },
];

const bouncingEmojis = ["🎈", "🌟", "🎉", "📚", "🦄", "🌈", "🐾"];

const games = [
  {
    href: "/games/alphabet",
    emoji: "🔤",
    name: "ABC",
    description: "Learn letters and sounds!",
    color: "bg-grass-light border-grass",
  },
  {
    href: "/games/matching",
    emoji: "🎯",
    name: "Match",
    description: "Match words with pictures!",
    color: "bg-candy-light border-candy",
  },
  {
    href: "/games/spelling",
    emoji: "🐝",
    name: "Spell",
    description: "Spell words letter by letter!",
    color: "bg-sun-dark/10 border-sun",
  },
  {
    href: "/games/numbers",
    emoji: "🔢",
    name: "Numbers",
    description: "Learn to count in English!",
    color: "bg-sky-light border-sky",
  },
  {
    href: "/games/categories",
    emoji: "🗺️",
    name: "Explore",
    description: "Discover words by topic!",
    color: "bg-purple-light border-purple",
  },
];

export default function HomePage() {
  const stars = useGameStore((s) => s.stars);
  const streakDays = useGameStore((s) => s.streakDays);
  const completedGames = useGameStore((s) => s.completedGames);
  const updateStreak = useGameStore((s) => s.updateStreak);

  useEffect(() => {
    updateStreak();
  }, [updateStreak]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Hero Section */}
      <motion.div
        className="text-center mb-8"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* Animated Title */}
        <motion.h1 className="font-display text-5xl sm:text-7xl font-extrabold mb-4 flex justify-center flex-wrap">
          {titleLetters.map((l, i) => (
            <motion.span
              key={i}
              variants={bounceIn}
              className={`${l.color} inline-block`}
              whileHover={{ scale: 1.3, rotate: [-5, 5, 0] }}
            >
              {l.char}
            </motion.span>
          ))}
        </motion.h1>

        <motion.p
          variants={slideUp}
          className="font-hand text-2xl sm:text-3xl text-night/70 mb-6"
        >
          Learn English the Fun Way! 🎉
        </motion.p>

        {/* Bouncing Emojis */}
        <motion.div
          className="flex justify-center gap-4 mb-8"
          variants={staggerContainer}
        >
          {bouncingEmojis.map((emoji, i) => (
            <motion.span
              key={i}
              variants={bounceIn}
              className="text-3xl sm:text-4xl animate-bounce-slow"
              style={{ animationDelay: `${i * 0.2}s` }}
              role="img"
              aria-hidden="true"
            >
              {emoji}
            </motion.span>
          ))}
        </motion.div>
      </motion.div>

      {/* Stats Section */}
      <motion.div
        className="flex justify-center gap-4 sm:gap-6 mb-10"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          variants={bounceIn}
          className="flex items-center gap-2 bg-sun/20 px-4 py-2.5 rounded-full shadow-card"
        >
          <span className="text-2xl">⭐</span>
          <span className="font-display font-bold text-lg text-night">
            {stars}
          </span>
        </motion.div>
        <motion.div
          variants={bounceIn}
          className="flex items-center gap-2 bg-candy/20 px-4 py-2.5 rounded-full shadow-card"
        >
          <span className="text-2xl">🔥</span>
          <span className="font-display font-bold text-lg text-night">
            {streakDays}
          </span>
        </motion.div>
        <motion.div
          variants={bounceIn}
          className="flex items-center gap-2 bg-grass/20 px-4 py-2.5 rounded-full shadow-card"
        >
          <span className="text-2xl">✅</span>
          <span className="font-display font-bold text-lg text-night">
            {completedGames.length}
          </span>
        </motion.div>
      </motion.div>

      {/* Game Selection Grid */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {games.map((game) => (
          <motion.div key={game.href} variants={slideUp}>
            <Link href={game.href}>
              <motion.div
                whileHover={{ scale: 1.05, y: -6 }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                className={`${game.color} border-2 rounded-card p-6 shadow-card cursor-pointer flex flex-col items-center text-center gap-3 min-h-[180px] justify-center`}
              >
                <span className="text-5xl">{game.emoji}</span>
                <h2 className="font-display text-2xl font-bold text-night">
                  {game.name}
                </h2>
                <p className="font-body text-base text-night/70">
                  {game.description}
                </p>
              </motion.div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
