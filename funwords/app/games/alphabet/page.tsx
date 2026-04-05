"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/stores/gameStore";
import { useSound } from "@/hooks/useSound";
import { usePronunciation } from "@/hooks/usePronunciation";
import { useConfetti } from "@/hooks/useConfetti";
import {
  bounceIn,
  staggerContainer,
  slideUp,
  pageTransition,
} from "@/lib/animations";
import { cn } from "@/lib/cn";
import { Toast } from "@/components/ui/Toast";

// ── Word data ──────────────────────────────────────────────────────────
const LETTER_DATA: { letter: string; word: string; emoji: string }[] = [
  { letter: "A", word: "Apple", emoji: "🍎" },
  { letter: "B", word: "Bear", emoji: "🐻" },
  { letter: "C", word: "Cat", emoji: "🐱" },
  { letter: "D", word: "Dog", emoji: "🐕" },
  { letter: "E", word: "Elephant", emoji: "🐘" },
  { letter: "F", word: "Frog", emoji: "🐸" },
  { letter: "G", word: "Grapes", emoji: "🍇" },
  { letter: "H", word: "House", emoji: "🏠" },
  { letter: "I", word: "Ice Cream", emoji: "🍦" },
  { letter: "J", word: "Jellyfish", emoji: "🪼" },
  { letter: "K", word: "Kite", emoji: "🪁" },
  { letter: "L", word: "Lion", emoji: "🦁" },
  { letter: "M", word: "Moon", emoji: "🌙" },
  { letter: "N", word: "Nest", emoji: "🪺" },
  { letter: "O", word: "Octopus", emoji: "🐙" },
  { letter: "P", word: "Penguin", emoji: "🐧" },
  { letter: "Q", word: "Queen", emoji: "👑" },
  { letter: "R", word: "Rainbow", emoji: "🌈" },
  { letter: "S", word: "Sunflower", emoji: "🌻" },
  { letter: "T", word: "Tiger", emoji: "🐯" },
  { letter: "U", word: "Umbrella", emoji: "☂️" },
  { letter: "V", word: "Violin", emoji: "🎻" },
  { letter: "W", word: "Whale", emoji: "🐋" },
  { letter: "X", word: "Xylophone", emoji: "🎶" },
  { letter: "Y", word: "Yarn", emoji: "🧶" },
  { letter: "Z", word: "Zebra", emoji: "🦓" },
];

// ── Bubble color palette (cycling) ─────────────────────────────────────
const BUBBLE_COLORS = [
  "bg-candy",
  "bg-ocean",
  "bg-grass",
  "bg-orange",
  "bg-purple",
  "bg-mint",
  "bg-coral",
  "bg-sun",
  "bg-sky",
];

const BUBBLE_SHADOW_COLORS = [
  "rgba(255,107,138,0.35)",
  "rgba(74,144,217,0.35)",
  "rgba(78,203,113,0.35)",
  "rgba(255,159,67,0.35)",
  "rgba(162,155,254,0.35)",
  "rgba(85,239,196,0.35)",
  "rgba(255,118,117,0.35)",
  "rgba(255,217,61,0.35)",
  "rgba(110,198,255,0.35)",
];

// ── Component ──────────────────────────────────────────────────────────
export default function AlphabetGame() {
  const [tappedLetters, setTappedLetters] = useState<Set<string>>(new Set());
  const [activeLetter, setActiveLetter] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [completed, setCompleted] = useState(false);
  const completedRef = useRef(false);

  const addStars = useGameStore((s) => s.addStars);
  const { play } = useSound();
  const { speak } = usePronunciation();
  const { containerRef, fire } = useConfetti();

  const tappedCount = tappedLetters.size;
  const activeData = activeLetter
    ? LETTER_DATA.find((d) => d.letter === activeLetter)!
    : null;

  // ── Tap handler ────────────────────────────────────────────────────
  const handleTap = useCallback(
    (letter: string) => {
      play("pop");
      setActiveLetter(letter);

      setTappedLetters((prev) => {
        if (prev.has(letter)) return prev;

        const next = new Set(prev);
        next.add(letter);

        // Award 1 star for first tap
        addStars(1);
        play("star");

        // Check completion
        if (next.size === 26 && !completedRef.current) {
          completedRef.current = true;
          setCompleted(true);
          addStars(5);
          setTimeout(() => {
            fire();
            play("confetti");
            setShowToast(true);
            setTimeout(() => setShowToast(false), 4000);
          }, 400);
        }

        return next;
      });
    },
    [addStars, play, fire]
  );

  // ── Reset handler ──────────────────────────────────────────────────
  const handleReset = useCallback(() => {
    setTappedLetters(new Set());
    setActiveLetter(null);
    setCompleted(false);
    completedRef.current = false;
    setShowToast(false);
  }, []);

  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      className="max-w-4xl mx-auto px-4 py-6 sm:py-8 text-center relative"
    >
      {/* Confetti container */}
      <div ref={containerRef} className="fixed inset-0 pointer-events-none z-[9999]" />

      {/* Toast */}
      <Toast
        message="You learned all the letters!"
        emoji="🎉"
        visible={showToast}
      />

      {/* ── Progress indicator ─────────────────────────────────────── */}
      <div className="mb-6">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-night mb-2">
          ABC Alphabet
        </h1>
        <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur-sm rounded-card px-4 py-2 shadow-card">
          <span className="text-2xl">⭐</span>
          <span className="font-display font-extrabold text-xl text-night">
            {tappedCount} / 26
          </span>
        </div>
      </div>

      {/* ── Letter grid ────────────────────────────────────────────── */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="flex flex-wrap justify-center gap-2.5 sm:gap-3 mb-6 max-w-[600px] mx-auto"
      >
        {LETTER_DATA.map((item, i) => {
          const colorIdx = i % BUBBLE_COLORS.length;
          const isTapped = tappedLetters.has(item.letter);
          const isActive = activeLetter === item.letter;

          return (
            <motion.button
              key={item.letter}
              variants={bounceIn}
              whileHover={{
                scale: 1.15,
                transition: { type: "spring", stiffness: 400, damping: 12 },
              }}
              whileTap={{
                scale: 0.92,
                transition: { type: "spring", stiffness: 400, damping: 15 },
              }}
              onTap={() => handleTap(item.letter)}
              className={cn(
                "relative flex items-center justify-center rounded-full",
                "w-[50px] h-[50px] sm:w-[64px] sm:h-[64px] md:w-[68px] md:h-[68px]",
                "min-w-[48px] min-h-[48px]",
                "font-display font-extrabold text-white text-lg sm:text-2xl",
                "cursor-pointer select-none",
                "transition-shadow duration-150",
                BUBBLE_COLORS[colorIdx],
                isActive && "ring-4 ring-white ring-offset-2",
                isTapped && "opacity-90"
              )}
              style={{
                boxShadow: isActive
                  ? `0 4px 0 rgba(0,0,0,0.15), 0 0 20px ${BUBBLE_SHADOW_COLORS[colorIdx]}`
                  : "0 4px 0 rgba(0,0,0,0.15)",
                textShadow: "0 1px 2px rgba(0,0,0,0.2)",
              }}
              aria-label={`Letter ${item.letter}`}
            >
              {item.letter}
              {isTapped && (
                <span className="absolute -top-1 -right-1 text-xs">
                  ✓
                </span>
              )}
            </motion.button>
          );
        })}
      </motion.div>

      {/* ── Word display area ──────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {activeData && (
          <motion.div
            key={activeData.letter}
            variants={slideUp}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="bg-white/80 backdrop-blur-sm rounded-card shadow-card p-6 sm:p-8 max-w-md mx-auto"
          >
            {/* Emoji */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 15, delay: 0.1 }}
              className="text-5xl sm:text-6xl mb-3"
            >
              {activeData.emoji}
            </motion.div>

            {/* Word */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="font-display font-extrabold text-2xl sm:text-3xl text-night mb-2"
            >
              {activeData.word}
            </motion.p>

            {/* Sentence */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="font-body text-lg sm:text-xl text-night/70 mb-4"
            >
              <span className="font-bold text-candy">{activeData.letter}</span>{" "}
              is for{" "}
              <span className="font-bold text-night">{activeData.word}</span>
            </motion.p>

            {/* Speaker button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => speak(activeData.word)}
              className={cn(
                "inline-flex items-center gap-2 px-5 py-2.5",
                "bg-sky rounded-button font-display font-bold text-white",
                "min-w-[48px] min-h-[48px] cursor-pointer",
                "shadow-btn active:shadow-btn-active"
              )}
              aria-label={`Hear ${activeData.word}`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-6 h-6"
              >
                <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM18.584 5.106a.75.75 0 011.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 01-1.06-1.06 8.25 8.25 0 000-11.668.75.75 0 010-1.06z" />
                <path d="M15.932 7.757a.75.75 0 011.061 0 6 6 0 010 8.486.75.75 0 01-1.06-1.061 4.5 4.5 0 000-6.364.75.75 0 010-1.06z" />
              </svg>
              <span className="text-base">Listen</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Completion / Play Again ─────────────────────────────────── */}
      <AnimatePresence>
        {completed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.5 }}
            className="mt-6"
          >
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleReset}
              className={cn(
                "px-8 py-3 rounded-button font-display font-bold text-xl text-white",
                "bg-grass shadow-btn active:shadow-btn-active",
                "min-w-[48px] min-h-[48px] cursor-pointer"
              )}
            >
              Play Again
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
