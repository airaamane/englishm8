"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/stores/gameStore";
import { useSound } from "@/hooks/useSound";
import { usePronunciation } from "@/hooks/usePronunciation";
import { useConfetti } from "@/hooks/useConfetti";
import {
  bounceIn,
  staggerContainer,
  shake,
  pageTransition,
} from "@/lib/animations";
import { cn } from "@/lib/cn";
import { Toast } from "@/components/ui/Toast";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { words } from "@/lib/words";

// ---------------------------------------------------------------------------
// Level definitions
// ---------------------------------------------------------------------------

interface LevelDef {
  pairs: number;
  wordNames: string[];
}

const LEVELS: LevelDef[] = [
  { pairs: 4, wordNames: ["cat", "sun", "fish", "star"] },
  { pairs: 4, wordNames: ["dog", "cake", "tree", "ball"] },
  { pairs: 6, wordNames: ["apple", "bird", "moon", "frog", "book", "car"] },
  { pairs: 6, wordNames: ["bear", "flower", "rain", "hand", "milk", "boat"] },
  {
    pairs: 8,
    wordNames: [
      "turtle",
      "banana",
      "cloud",
      "cookie",
      "phone",
      "rabbit",
      "eye",
      "clock",
    ],
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function lookupEmoji(word: string): string {
  const entry = words.find((w) => w.word === word);
  return entry?.emoji ?? "❓";
}

/** Fisher-Yates shuffle (returns new array). */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Shuffle emoji indices such that no emoji aligns with its matching word index.
 * Keeps re-shuffling (derangement) until the constraint is satisfied.
 */
function shuffleNoAlign(length: number): number[] {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const indices = Array.from({ length }, (_, i) => i);
    const shuffled = shuffle(indices);
    if (shuffled.every((v, i) => v !== i)) return shuffled;
  }
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CardItem {
  id: string;
  word: string;
  emoji: string;
  type: "word" | "emoji";
  index: number; // position within its column
}

type SelectionId = string | null;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function MatchingGame() {
  const { addStars } = useGameStore();
  const { play } = useSound();
  const { speak } = usePronunciation();
  const { containerRef, fire: fireConfetti } = useConfetti();

  // State ------------------------------------------------------------------
  const [level, setLevel] = useState(0);
  const [matchedWords, setMatchedWords] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<SelectionId>(null);
  const [wrongPair, setWrongPair] = useState<[string, string] | null>(null);
  const [correctPair, setCorrectPair] = useState<[string, string] | null>(null);
  const [toast, setToast] = useState<{ message: string; emoji: string } | null>(
    null
  );
  const [levelComplete, setLevelComplete] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);

  // Derived data -----------------------------------------------------------
  const levelDef = LEVELS[level];

  // Build cards (memoised per level)
  const { wordCards, emojiCards } = useMemo(() => {
    const emojiOrder = shuffleNoAlign(levelDef.pairs);
    const wCards: CardItem[] = levelDef.wordNames.map((w, i) => ({
      id: `word-${w}`,
      word: w,
      emoji: lookupEmoji(w),
      type: "word" as const,
      index: i,
    }));
    const eCards: CardItem[] = emojiOrder.map((srcIdx, i) => {
      const w = levelDef.wordNames[srcIdx];
      return {
        id: `emoji-${w}`,
        word: w,
        emoji: lookupEmoji(w),
        type: "emoji" as const,
        index: i,
      };
    });
    return { wordCards: wCards, emojiCards: eCards };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level]);

  const totalPairs = levelDef.pairs;
  const progress = matchedWords.size / totalPairs;

  // Toast auto-hide --------------------------------------------------------
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 1800);
    return () => clearTimeout(t);
  }, [toast]);

  // Level complete detection -----------------------------------------------
  useEffect(() => {
    if (matchedWords.size === totalPairs && totalPairs > 0 && !levelComplete) {
      const t = setTimeout(() => {
        setLevelComplete(true);
        fireConfetti();
        play("confetti");
        addStars(3);
      }, 1000);
      return () => clearTimeout(t);
    }
  }, [
    matchedWords.size,
    totalPairs,
    levelComplete,
    fireConfetti,
    play,
    addStars,
  ]);

  // -----------------------------------------------------------------------
  // Card tap handler
  // -----------------------------------------------------------------------
  const handleTap = useCallback(
    (card: CardItem) => {
      if (matchedWords.has(card.word) && selected !== card.id) return;
      if (wrongPair) return; // mid-shake
      if (correctPair) return; // mid-pop

      play("tap");

      // Nothing selected yet — select this card
      if (!selected) {
        setSelected(card.id);
        if (card.type === "word") speak(card.word);
        return;
      }

      // Tapping the same card — deselect
      if (selected === card.id) {
        setSelected(null);
        return;
      }

      // Find the previously selected card
      const allCards = [...wordCards, ...emojiCards];
      const prevCard = allCards.find((c) => c.id === selected)!;

      // Both same type? Swap selection
      if (prevCard.type === card.type) {
        setSelected(card.id);
        if (card.type === "word") speak(card.word);
        return;
      }

      // We have one word + one emoji — check match
      const isMatch = prevCard.word === card.word;

      if (isMatch) {
        const pair: [string, string] = [prevCard.id, card.id];
        setCorrectPair(pair);
        setSelected(null);
        play("success");
        speak(card.word);
        addStars(1);
        setToast({
          message: `${card.word} = ${card.emoji}`,
          emoji: "✅",
        });

        setTimeout(() => {
          setMatchedWords((prev) => new Set(prev).add(card.word));
          setCorrectPair(null);
        }, 600);
      } else {
        const pair: [string, string] = [prevCard.id, card.id];
        setWrongPair(pair);
        play("wrong");

        setTimeout(() => {
          setWrongPair(null);
          setSelected(null);
        }, 500);
      }
    },
    [
      selected,
      matchedWords,
      wrongPair,
      correctPair,
      wordCards,
      emojiCards,
      play,
      speak,
      addStars,
    ]
  );

  // -----------------------------------------------------------------------
  // Advance level
  // -----------------------------------------------------------------------
  const handleNextLevel = useCallback(() => {
    if (level < LEVELS.length - 1) {
      play("whoosh");
      setLevel((l) => l + 1);
      setMatchedWords(new Set());
      setSelected(null);
      setWrongPair(null);
      setCorrectPair(null);
      setLevelComplete(false);
      setGameFinished(false);
    } else {
      // Final level already complete
      setGameFinished(true);
      addStars(5);
      play("confetti");
      fireConfetti();
    }
  }, [level, play, addStars, fireConfetti]);

  // -----------------------------------------------------------------------
  // Render helpers
  // -----------------------------------------------------------------------

  const isSelected = (id: string) => selected === id;
  const isWrong = (id: string) => wrongPair?.includes(id) ?? false;
  const isCorrectAnim = (id: string) => correctPair?.includes(id) ?? false;
  const isMatched = (word: string) => matchedWords.has(word);

  function renderCard(card: CardItem) {
    const matched = isMatched(card.word);
    const sel = isSelected(card.id);
    const wrong = isWrong(card.id);
    const correctAnim = isCorrectAnim(card.id);
    const disabled = matched && !correctAnim;

    const isWord = card.type === "word";

    return (
      <motion.button
        key={card.id}
        variants={wrong ? shake : bounceIn}
        initial="hidden"
        animate={wrong ? "wrong" : "visible"}
        whileTap={disabled ? undefined : { scale: 0.95 }}
        onClick={() => handleTap(card)}
        disabled={disabled}
        className={cn(
          "relative flex items-center justify-center rounded-[18px] min-h-[52px] min-w-[48px] px-5 py-3.5 cursor-pointer select-none transition-colors duration-200",
          // Word card base styles
          isWord && [
            "bg-candy-light border-[3px] border-candy",
            "font-display font-bold text-candy text-[1.3rem]",
            "shadow-[0_4px_0_theme(colors.candy-dark)]",
          ],
          // Emoji card base styles
          !isWord && [
            "bg-ocean-light border-[3px] border-ocean",
            "text-[2rem]",
            "shadow-[0_4px_0_theme(colors.ocean-dark)]",
          ],
          // Selected state
          sel && !correctAnim && "scale-[1.06] shadow-[0_0_0_4px_theme(colors.sun)] -translate-y-0.5",
          // Correct animation
          correctAnim && [
            "bg-grass-light border-grass",
            "shadow-[0_4px_0_theme(colors.grass-dark)]",
          ],
          // Disabled / matched
          disabled && "opacity-40 pointer-events-none",
        )}
        style={{
          WebkitTapHighlightColor: "transparent",
        }}
      >
        {/* Pop scale on correct */}
        <motion.span
          animate={
            correctAnim
              ? { scale: [1, 1.2, 1] }
              : {}
          }
          transition={{ duration: 0.35, type: "spring" }}
        >
          {isWord ? card.word : card.emoji}
        </motion.span>
      </motion.button>
    );
  }

  // -----------------------------------------------------------------------
  // Main render
  // -----------------------------------------------------------------------

  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      className="max-w-4xl mx-auto px-4 py-6 flex flex-col items-center gap-6 min-h-screen"
    >
      {/* Confetti container */}
      <div ref={containerRef} className="fixed inset-0 pointer-events-none z-[9999]" />

      {/* Toast */}
      <Toast
        message={toast?.message ?? ""}
        emoji={toast?.emoji ?? "🌟"}
        visible={!!toast}
      />

      {/* ------- Top: Level indicator + progress bar ------- */}
      <div className="w-full max-w-md flex flex-col items-center gap-3">
        <h1 className="font-display text-2xl font-bold text-night">
          Level {level + 1} — {totalPairs} pairs
        </h1>
        <ProgressBar progress={progress} segments={totalPairs} className="max-w-xs" />
      </div>

      {/* ------- Center: Two columns of cards ------- */}
      <div className="w-full flex flex-col sm:flex-row gap-6 sm:gap-10 justify-center items-start">
        {/* Word column */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-3 flex-1 max-w-[220px] mx-auto sm:mx-0"
        >
          {wordCards.map((c) => renderCard(c))}
        </motion.div>

        {/* Emoji column */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-3 flex-1 max-w-[220px] mx-auto sm:mx-0"
        >
          {emojiCards.map((c) => renderCard(c))}
        </motion.div>
      </div>

      {/* ------- Bottom: Next Level / Champion ------- */}
      <AnimatePresence>
        {levelComplete && !gameFinished && level < LEVELS.length - 1 && (
          <motion.button
            key="next-level"
            initial={{ opacity: 0, y: 30 }}
            animate={{
              opacity: 1,
              y: [0, -6, 0],
              transition: {
                y: { repeat: Infinity, duration: 1.2, ease: "easeInOut" },
                opacity: { duration: 0.4 },
              },
            }}
            exit={{ opacity: 0, y: 30 }}
            whileTap={{ scale: 0.93 }}
            onClick={handleNextLevel}
            className="mt-2 px-8 py-4 rounded-button bg-sun font-display font-bold text-xl text-night shadow-btn hover:shadow-btn-hover active:shadow-btn-active cursor-pointer select-none"
          >
            Next Level ➡️
          </motion.button>
        )}

        {levelComplete && level === LEVELS.length - 1 && !gameFinished && (
          <motion.button
            key="champion"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{
              opacity: 1,
              scale: 1,
              transition: { type: "spring", stiffness: 300, damping: 15 },
            }}
            exit={{ opacity: 0 }}
            whileTap={{ scale: 0.93 }}
            onClick={handleNextLevel}
            className="mt-2 px-8 py-4 rounded-button bg-sun font-display font-bold text-xl text-night shadow-btn cursor-pointer select-none"
          >
            Finish ⭐
          </motion.button>
        )}

        {gameFinished && (
          <motion.div
            key="finished"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{
              opacity: 1,
              scale: 1,
              transition: { type: "spring", stiffness: 300, damping: 15 },
            }}
            className="flex flex-col items-center gap-2 mt-2"
          >
            <span className="font-display text-3xl font-bold text-candy">
              🏆 Matching Champion!
            </span>
            <span className="font-body text-lg text-night/70">
              +5 bonus stars!
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
