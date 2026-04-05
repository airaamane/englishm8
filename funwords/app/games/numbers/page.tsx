"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/stores/gameStore";
import { useSound } from "@/hooks/useSound";
import { usePronunciation } from "@/hooks/usePronunciation";
import { useConfetti } from "@/hooks/useConfetti";
import { bounceIn, staggerContainer, pageTransition } from "@/lib/animations";
import { cn } from "@/lib/cn";
import { Toast } from "@/components/ui/Toast";

/* ── constants ───────────────────────────────────────── */

const TOTAL_ROUNDS = 15;
const EMOJIS = ["🍎", "🍌", "🐟", "⭐", "🌸", "🐱", "🐕", "🌳", "⚽", "📖"] as const;
const EMOJI_NAMES: Record<string, string> = {
  "🍎": "apple",
  "🍌": "banana",
  "🐟": "fish",
  "⭐": "star",
  "🌸": "flower",
  "🐱": "cat",
  "🐕": "dog",
  "🌳": "tree",
  "⚽": "ball",
  "📖": "book",
};
const EMOJI_PLURALS: Record<string, string> = {
  "🍎": "apples",
  "🍌": "bananas",
  "🐟": "fish",
  "⭐": "stars",
  "🌸": "flowers",
  "🐱": "cats",
  "🐕": "dogs",
  "🌳": "trees",
  "⚽": "balls",
  "📖": "books",
};

const NUMBER_WORDS: Record<number, string> = {
  1: "One",
  2: "Two",
  3: "Three",
  4: "Four",
  5: "Five",
  6: "Six",
  7: "Seven",
  8: "Eight",
  9: "Nine",
  10: "Ten",
  11: "Eleven",
  12: "Twelve",
  13: "Thirteen",
  14: "Fourteen",
  15: "Fifteen",
  16: "Sixteen",
  17: "Seventeen",
  18: "Eighteen",
  19: "Nineteen",
  20: "Twenty",
};

const BUBBLE_COLORS = [
  { bg: "bg-sky", border: "border-sky-dark", shadow: "shadow-[0_4px_0_#4A90D9]" },
  { bg: "bg-candy", border: "border-candy-dark", shadow: "shadow-[0_4px_0_#E55A76]" },
  { bg: "bg-sun", border: "border-sun-dark", shadow: "shadow-[0_4px_0_#E6C235]" },
  { bg: "bg-grass", border: "border-grass-dark", shadow: "shadow-[0_4px_0_#3DA85D]" },
  { bg: "bg-purple", border: "border-purple-dark", shadow: "shadow-[0_4px_0_#8B84E0]" },
  { bg: "bg-orange", border: "border-orange-dark", shadow: "shadow-[0_4px_0_#E68A30]" },
  { bg: "bg-coral", border: "border-coral-dark", shadow: "shadow-[0_4px_0_#E06665]" },
  { bg: "bg-mint", border: "border-mint-dark", shadow: "shadow-[0_4px_0_#3DD4A7]" },
];

const SHAKE_X = [-10, 10, -8, 8, -4, 4, 0];

/* ── helpers ─────────────────────────────────────────── */

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface RoundData {
  number: number;
  emoji: string;
  choices: number[];
  emojiPositions: { x: number; y: number; rotate: number }[];
}

/**
 * Lay out `count` emojis in rows of up to 5, centred inside the 300×200
 * display stage.  Every position is calculated — never random — so the
 * on-screen count is always exact and nothing overlaps.
 * A tiny jitter (±4 px, ±10°) is added so it looks hand-placed rather
 * than mechanical.
 */
function gridPositions(
  count: number,
): { x: number; y: number; rotate: number }[] {
  const COLS = 5;
  const rows = Math.ceil(count / COLS);

  // Shrink spacing slightly for larger grids so everything fits the stage
  const gap = count <= 5 ? 54 : count <= 10 ? 50 : 44;

  const gridW = (Math.min(count, COLS) - 1) * gap;
  const gridH = (rows - 1) * gap;

  return Array.from({ length: count }, (_, i) => {
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    // Centre-align the last (possibly partial) row
    const rowCount = row === rows - 1 ? count - row * COLS : COLS;
    const rowOffset = ((COLS - rowCount) / 2) * gap;

    return {
      x: col * gap - gridW / 2 + rowOffset + (Math.random() - 0.5) * 8,
      y: row * gap - gridH / 2 + (Math.random() - 0.5) * 8,
      rotate: (Math.random() - 0.5) * 20,
    };
  });
}

function generateRound(): RoundData {
  const number = rand(1, 20);
  const emoji = EMOJIS[rand(0, EMOJIS.length - 1)];

  // Generate 3 distractors within ±3, clamped 1–20, no duplicates
  const distractors = new Set<number>();
  while (distractors.size < 3) {
    const d = rand(Math.max(1, number - 3), Math.min(20, number + 3));
    if (d !== number) distractors.add(d);
  }
  const choices = shuffle([number, ...distractors]);

  return { number, emoji, choices, emojiPositions: gridPositions(number) };
}

/* ── sparkle burst on correct ──────────────────────── */

const SPARKS = ["⭐", "✨", "🌟", "💫", "⭐", "✨", "🌟", "💫"];
const SPARK_ANGLES = SPARKS.map((_, i) => (i / SPARKS.length) * Math.PI * 2);

function BubbleSparkles() {
  return (
    <div className="absolute inset-0 pointer-events-none" style={{ overflow: "visible", zIndex: 30 }}>
      {SPARKS.map((s, i) => (
        <motion.span
          key={i}
          className="absolute text-sm"
          style={{ top: "50%", left: "50%", marginLeft: "-0.4em", marginTop: "-0.4em" }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
          animate={{
            x: Math.cos(SPARK_ANGLES[i]) * 48,
            y: Math.sin(SPARK_ANGLES[i]) * 48,
            opacity: [1, 1, 0],
            scale: [0, 1.3, 0],
          }}
          transition={{ duration: 0.7, ease: "easeOut", delay: i * 0.04 }}
        >
          {s}
        </motion.span>
      ))}
    </div>
  );
}

/* ── component ───────────────────────────────────────── */

export default function NumbersGame() {
  const { play } = useSound();
  const { speak } = usePronunciation();
  const { containerRef, fire } = useConfetti();
  const { addStars, completeGame, updateStreak } = useGameStore();

  const [round, setRound] = useState(1);
  const [roundData, setRoundData] = useState<RoundData | null>(null);
  const [answered, setAnswered] = useState(false);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [disabledChoices, setDisabledChoices] = useState<Set<number>>(new Set());
  const [correctChoice, setCorrectChoice] = useState<number | null>(null);
  const [wrongChoice, setWrongChoice] = useState<number | null>(null);
  const [showWord, setShowWord] = useState(false);
  const [earnedStar, setEarnedStar] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [sessionStars, setSessionStars] = useState(0);
  const [wordsLearned, setWordsLearned] = useState<Set<string>>(new Set());
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [celebrateEmojis, setCelebrateEmojis] = useState(false);
  const [revealedCorrect, setRevealedCorrect] = useState(false);

  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Generate first round on mount (avoids hydration mismatch from Math.random)
  useEffect(() => {
    if (!roundData) setRoundData(generateRound());
  }, [roundData]);

  // Speak the question on round start
  useEffect(() => {
    if (!roundData) return;
    const name = roundData.number === 1
      ? EMOJI_NAMES[roundData.emoji]
      : EMOJI_PLURALS[roundData.emoji];
    const timer = setTimeout(() => {
      speak(`How many ${name}?`);
    }, 800);
    return () => clearTimeout(timer);
  }, [roundData, speak]);

  const speakQuestion = useCallback(() => {
    if (!roundData) return;
    const name = roundData.number === 1
      ? EMOJI_NAMES[roundData.emoji]
      : EMOJI_PLURALS[roundData.emoji];
    speak(`How many ${name}?`);
  }, [roundData, speak]);

  const advanceRound = useCallback(() => {
    if (round >= TOTAL_ROUNDS) {
      // Session complete
      setSessionComplete(true);
      addStars(5); // bonus stars
      completeGame("numbers");
      updateStreak();
      play("confetti");
      fire();
      return;
    }
    setRound((r) => r + 1);
    setRoundData(generateRound());
    setAnswered(false);
    setWrongAttempts(0);
    setDisabledChoices(new Set());
    setCorrectChoice(null);
    setWrongChoice(null);
    setShowWord(false);
    setEarnedStar(false);
    setCelebrateEmojis(false);
    setRevealedCorrect(false);
  }, [round, addStars, completeGame, updateStreak, play, fire]);

  const handleChoice = useCallback(
    (choice: number) => {
      if (!roundData || answered || disabledChoices.has(choice)) return;

      play("tap");

      if (choice === roundData.number) {
        // Correct!
        setCorrectChoice(choice);
        setAnswered(true);
        setCelebrateEmojis(true);
        play("success");
        fire(); // confetti burst on every correct answer

        const word = NUMBER_WORDS[roundData.number];
        const gotStar = wrongAttempts === 0;

        if (gotStar) {
          setEarnedStar(true);
          addStars(1);
          setSessionStars((s) => s + 1);
        }

        setWordsLearned((prev) => new Set([...prev, word]));

        setTimeout(() => {
          setShowWord(true);
          speak(word);
        }, 500);

        // Auto-advance after 2.5s to let celebration breathe
        advanceTimerRef.current = setTimeout(() => {
          advanceRound();
        }, 2500);
      } else {
        // Wrong — just shake
        setWrongChoice(choice);
        play("wrong");

        const newAttempts = wrongAttempts + 1;
        setWrongAttempts(newAttempts);

        setTimeout(() => {
          setWrongChoice(null);
          setDisabledChoices((prev) => new Set([...prev, choice]));

          if (newAttempts >= 2) {
            // Auto-reveal correct answer
            setAnswered(true);
            setRevealedCorrect(true);
            setCorrectChoice(roundData.number);

            const word = NUMBER_WORDS[roundData.number];
            setWordsLearned((prev) => new Set([...prev, word]));

            setTimeout(() => {
              setShowWord(true);
              speak(word);
            }, 400);

            advanceTimerRef.current = setTimeout(() => {
              advanceRound();
            }, 2000);
          }
        }, 500);
      }
    },
    [answered, disabledChoices, roundData, wrongAttempts, play, speak, addStars, advanceRound, fire]
  );

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    };
  }, []);

  // Not yet mounted — render nothing to avoid hydration mismatch
  if (!roundData) return null;

  const emojiName = roundData.number === 1
    ? EMOJI_NAMES[roundData.emoji]
    : EMOJI_PLURALS[roundData.emoji];

  const word = NUMBER_WORDS[roundData.number];
  const progressPercent = ((round - 1) / TOTAL_ROUNDS) * 100;

  /* ── session complete screen ───────────────────────── */
  if (sessionComplete) {
    return (
      <motion.div
        variants={pageTransition}
        initial="initial"
        animate="animate"
        className="max-w-lg mx-auto px-4 py-8 text-center flex flex-col items-center gap-6 min-h-[80vh] justify-center"
      >
        <div ref={containerRef} className="fixed inset-0 pointer-events-none z-[9999]" />
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.2 }}
          className="text-7xl"
        >
          🎉
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="font-display text-3xl font-bold text-night"
        >
          Amazing Job!
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="font-body text-xl text-night/70"
        >
          You learned {wordsLearned.size} number words!
        </motion.p>
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, type: "spring" }}
          className="flex items-center gap-2 bg-sun/20 px-6 py-3 rounded-card"
        >
          <span className="text-3xl">⭐</span>
          <span className="font-display text-2xl font-bold text-night">
            {sessionStars + 5} stars earned!
          </span>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="flex flex-wrap justify-center gap-2 mt-2"
        >
          {[...wordsLearned].map((w) => (
            <span
              key={w}
              className="bg-purple-light text-purple-dark font-display font-bold text-sm px-3 py-1 rounded-button"
            >
              {w}
            </span>
          ))}
        </motion.div>
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setSessionComplete(false);
            setRound(1);
            setRoundData(generateRound());
            setAnswered(false);
            setWrongAttempts(0);
            setDisabledChoices(new Set());
            setCorrectChoice(null);
            setWrongChoice(null);
            setShowWord(false);
            setEarnedStar(false);
            setSessionStars(0);
            setWordsLearned(new Set());
            setCelebrateEmojis(false);
            setRevealedCorrect(false);
          }}
          className="bg-sky text-white font-display font-bold text-lg px-8 py-3 rounded-button shadow-btn hover:shadow-btn-hover active:shadow-btn-active mt-4 min-h-[48px] min-w-[48px]"
        >
          Play Again
        </motion.button>
      </motion.div>
    );
  }

  /* ── game screen ───────────────────────────────────── */
  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      className="max-w-lg mx-auto px-4 py-6 flex flex-col items-center gap-4 min-h-[80vh]"
    >
      <div ref={containerRef} className="fixed inset-0 pointer-events-none z-[9999]" />

      {/* Progress bar */}
      <div className="w-full max-w-sm">
        <div className="flex justify-between items-center mb-1">
          <span className="font-body text-sm text-night/60">
            Round {round} of {TOTAL_ROUNDS}
          </span>
          <div className="flex items-center gap-1">
            <span className="text-sm">⭐</span>
            <span className="font-display text-sm font-bold text-night/60">
              {sessionStars}
            </span>
          </div>
        </div>
        <div className="w-full h-3 bg-white/50 rounded-full overflow-hidden shadow-inner">
          <motion.div
            className="h-full bg-gradient-to-r from-sky to-grass rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
          />
        </div>
      </div>

      {/* Emoji cluster */}
      <div className="relative flex items-center justify-center mt-4" style={{ width: 300, height: 200 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={`cluster-${round}`}
            className="relative w-full h-full"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {roundData.emojiPositions.map((pos, i) => (
              <motion.span
                key={`${round}-emoji-${i}`}
                variants={bounceIn}
                className="absolute text-[2.5rem] select-none"
                animate={
                  celebrateEmojis
                    ? {
                        y: [0, -18, 0],
                        scale: [1, 1.2, 1],
                        rotate: [pos.rotate, pos.rotate + 15, pos.rotate],
                      }
                    : {}
                }
                transition={
                  celebrateEmojis
                    ? {
                        duration: 0.5,
                        delay: i * 0.03,
                        ease: "easeOut",
                      }
                    : undefined
                }
                style={{
                  left: `calc(50% + ${pos.x}px)`,
                  top: `calc(50% + ${pos.y}px)`,
                  transform: `translate(-50%, -50%) rotate(${pos.rotate}deg)`,
                }}
              >
                {roundData.emoji}
              </motion.span>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Question */}
      <div className="flex items-center gap-3 mt-2">
        <motion.h2
          key={`question-${round}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-2xl font-bold text-night"
        >
          How many {emojiName}?
        </motion.h2>
        <motion.button
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          onClick={speakQuestion}
          className="text-2xl min-w-[48px] min-h-[48px] flex items-center justify-center rounded-full hover:bg-white/40 transition-colors"
          aria-label="Listen to question"
        >
          🔊
        </motion.button>
      </div>

      {/* Answer bubbles */}
      <motion.div
        key={`choices-${round}`}
        className="flex items-center justify-center gap-4 mt-4"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {roundData.choices.map((choice, i) => {
          const color = BUBBLE_COLORS[i % BUBBLE_COLORS.length];
          const isCorrect = correctChoice === choice;
          const isWrong = wrongChoice === choice;
          const isDisabled = disabledChoices.has(choice);
          const isRevealed = revealedCorrect && choice === roundData.number;

          let bgClass = color.bg;
          let borderClass = color.border;
          let shadowClass = color.shadow;
          if (isCorrect && !isRevealed) {
            bgClass = "bg-grass";
            borderClass = "border-grass-dark";
            shadowClass = "shadow-[0_4px_0_#3DA85D]";
          } else if (isRevealed) {
            bgClass = "bg-grass";
            borderClass = "border-grass-dark";
            shadowClass = "shadow-[0_4px_0_#3DA85D]";
          } else if (isWrong) {
            bgClass = "bg-coral";
            borderClass = "border-coral-dark";
            shadowClass = "shadow-[0_4px_0_#E06665]";
          }

          return (
            <motion.button
              key={`${round}-choice-${choice}`}
              variants={bounceIn}
              whileHover={!answered && !isDisabled ? { scale: 1.12, y: -4 } : {}}
              whileTap={!answered && !isDisabled ? { scale: 0.92, y: 2 } : {}}
              animate={
                isWrong
                  ? { x: SHAKE_X, transition: { duration: 0.4 } }
                  : isCorrect && !isRevealed
                  ? {
                      scale: [1, 1.35, 1.15],
                      y: [0, -12, -4],
                      transition: { duration: 0.5, ease: "easeOut" },
                    }
                  : isRevealed
                  ? {
                      scale: [1, 1.15, 1, 1.15, 1],
                      transition: { duration: 0.8, repeat: Infinity, repeatDelay: 0.5 },
                    }
                  : {}
              }
              onClick={() => handleChoice(choice)}
              disabled={answered || isDisabled}
              className={cn(
                "relative w-16 h-16 rounded-full flex items-center justify-center border-2 transition-colors",
                bgClass,
                shadowClass,
                borderClass,
                "font-display font-[800] text-[1.8rem] text-white",
                "min-w-[48px] min-h-[48px]",
                isDisabled && !isRevealed && "opacity-30 pointer-events-none scale-90",
                answered && !isCorrect && !isRevealed && "opacity-40 scale-90",
                !answered && !isDisabled && "cursor-pointer active:translate-y-[2px] active:shadow-btn-active"
              )}
              aria-label={`${choice}`}
            >
              {/* Sparkle burst on correct */}
              {isCorrect && !isRevealed && <BubbleSparkles />}
              <span className="relative z-10">{choice}</span>
            </motion.button>
          );
        })}
      </motion.div>

      {/* English word reveal — celebratory banner */}
      <div className="h-24 flex items-center justify-center mt-2">
        <AnimatePresence>
          {showWord && (
            <motion.div
              initial={{ scale: 0, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 16 }}
              className={cn(
                "flex items-center gap-3 px-6 py-3 rounded-2xl",
                revealedCorrect
                  ? "bg-ocean-light border-2 border-ocean"
                  : "bg-grass-light border-2 border-grass shadow-[0_4px_0_theme(colors.grass-dark/30)]",
              )}
            >
              <motion.span
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.15, type: "spring", stiffness: 500 }}
                className="text-3xl"
              >
                {revealedCorrect ? "💡" : "🎉"}
              </motion.span>
              <div className="flex flex-col items-start">
                <span className={cn(
                  "font-display text-3xl font-bold",
                  revealedCorrect ? "text-ocean-dark" : "text-grass-dark",
                )}>
                  {word}
                </span>
                {earnedStar && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3, type: "spring" }}
                    className="flex items-center gap-1"
                  >
                    <motion.span
                      animate={{ rotate: [0, 20, -20, 0], scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.6, delay: 0.4 }}
                      className="text-lg"
                    >
                      ⭐
                    </motion.span>
                    <span className="font-display text-sm font-bold text-sun-dark">+1 star!</span>
                  </motion.div>
                )}
                {revealedCorrect && (
                  <span className="font-body text-xs text-ocean-dark/60">
                    The answer was {roundData.number}
                  </span>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Toast */}
      <Toast message={toastMessage} visible={toastVisible} />
    </motion.div>
  );
}
