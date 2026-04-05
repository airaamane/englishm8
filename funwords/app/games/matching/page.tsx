"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useGameStore } from "@/stores/gameStore";
import { useSound } from "@/hooks/useSound";
import { usePronunciation } from "@/hooks/usePronunciation";
import { useConfetti } from "@/hooks/useConfetti";
import { pageTransition } from "@/lib/animations";
import { cn } from "@/lib/cn";
import { Toast } from "@/components/ui/Toast";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { words } from "@/lib/words";

// ─── Level definitions ────────────────────────────────────────────────────────

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

const LEVEL_ICONS = ["🐣", "🐥", "🐦", "🦅", "🦁"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function lookupEmoji(word: string): string {
  const entry = words.find((w) => w.word === word);
  return entry?.emoji ?? "❓";
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function shuffleNoAlign(length: number): number[] {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const indices = Array.from({ length }, (_, i) => i);
    const shuffled = shuffle(indices);
    if (shuffled.every((v, i) => v !== i)) return shuffled;
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface CardItem {
  id: string;
  word: string;
  emoji: string;
  type: "word" | "emoji";
  index: number;
}

// ─── Animation constants ──────────────────────────────────────────────────────

const SHAKE_X: number[] = [-12, 12, -10, 10, -6, 6, 0];

const blockVariants = {
  hidden: { opacity: 0, scale: 0.4, y: 24 },
  visible: (d: number) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 420, damping: 18, delay: d },
  }),
};

// ─── Sparkle burst on correct match ──────────────────────────────────────────

const SPARKS = ["⭐", "✨", "🌟", "💫", "⭐", "✨"];
const SPARK_ANGLES = SPARKS.map((_, i) => (i / SPARKS.length) * Math.PI * 2);

function Sparkles() {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{ overflow: "visible", zIndex: 30 }}
    >
      {SPARKS.map((s, i) => (
        <motion.span
          key={i}
          className="absolute text-xs sm:text-sm"
          style={{
            top: "50%",
            left: "50%",
            marginLeft: "-0.5em",
            marginTop: "-0.5em",
          }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
          animate={{
            x: Math.cos(SPARK_ANGLES[i]) * 44,
            y: Math.sin(SPARK_ANGLES[i]) * 44 - 4,
            opacity: [1, 1, 0],
            scale: [0, 1.4, 0],
          }}
          transition={{ duration: 0.85, ease: "easeOut", delay: i * 0.06 }}
        >
          {s}
        </motion.span>
      ))}
    </div>
  );
}

// ─── DraggableWordCard ────────────────────────────────────────────────────────

interface WordCardProps {
  card: CardItem;
  isSelected: boolean;
  isWrong: boolean;
  isMatched: boolean;
  isCorrectAnim: boolean;
  onTap: (card: CardItem) => void;
}

function DraggableWordCard({
  card,
  isSelected,
  isWrong,
  isMatched,
  isCorrectAnim,
  onTap,
}: WordCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: card.id,
    disabled: isMatched,
    data: { card },
  });

  const dndStyle = transform ? { transform: CSS.Translate.toString(transform) } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={dndStyle}
      {...listeners}
      {...attributes}
      className="touch-none"
    >
      <motion.button
        custom={card.index * 0.07}
        variants={blockVariants}
        initial="hidden"
        animate={
          isWrong
            ? { x: SHAKE_X, transition: { duration: 0.45 } }
            : "visible"
        }
        whileTap={isMatched ? undefined : { scale: 0.9 }}
        onClick={() => onTap(card)}
        disabled={isMatched && !isCorrectAnim}
        className={cn(
          "relative w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center rounded-2xl",
          "cursor-grab active:cursor-grabbing select-none",
          "font-display font-bold text-sm sm:text-lg leading-tight text-center",
          "transition-colors duration-150",
          // Base
          "bg-candy-light border-4 border-candy text-candy",
          "shadow-[0_6px_0_theme(colors.candy-dark)]",
          // Selected
          isSelected &&
            !isCorrectAnim && [
              "bg-candy border-candy-dark text-white",
              "shadow-[0_0_0_4px_theme(colors.sun),0_6px_0_theme(colors.candy-dark)]",
            ],
          // Correct anim
          isCorrectAnim &&
            "bg-grass-light border-grass text-grass-dark shadow-[0_6px_0_theme(colors.grass-dark)]",
          // Matched — green "done" state
          isMatched && !isCorrectAnim && "bg-grass-light border-grass/40 text-grass/50 shadow-none pointer-events-none",
          // Ghost while dragging
          isDragging && "opacity-20",
        )}
        style={{ WebkitTapHighlightColor: "transparent" }}
      >
        {isCorrectAnim && <Sparkles />}

        {/* Wiggle label when selected */}
        <motion.span
          className="relative z-10"
          animate={
            isSelected && !isDragging && !isCorrectAnim
              ? {
                  rotate: [-4, 4, -4],
                  transition: { repeat: Infinity, duration: 0.5, ease: "easeInOut" },
                }
              : { rotate: 0 }
          }
        >
          {card.word}
        </motion.span>

        {/* Pulsing glow ring when selected */}
        {isSelected && !isCorrectAnim && (
          <motion.div
            className="absolute inset-0 rounded-xl border-[3px] border-sun"
            animate={{ opacity: [1, 0.15, 1], scale: [1, 1.06, 1] }}
            transition={{ repeat: Infinity, duration: 0.9 }}
          />
        )}

        {/* Matched checkmark badge */}
        {isMatched && !isCorrectAnim && (
          <span className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-grass rounded-full flex items-center justify-center text-[11px] text-white font-bold z-20 shadow-sm">✓</span>
        )}
      </motion.button>
    </div>
  );
}

// ─── DroppableEmojiCard ───────────────────────────────────────────────────────

interface EmojiCardProps {
  card: CardItem;
  isWrong: boolean;
  isMatched: boolean;
  isCorrectAnim: boolean;
  onTap: (card: CardItem) => void;
}

function DroppableEmojiCard({
  card,
  isWrong,
  isMatched,
  isCorrectAnim,
  onTap,
}: EmojiCardProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: card.id,
    disabled: isMatched,
    data: { card },
  });

  return (
    <motion.button
      ref={(node) => setNodeRef(node)}
      custom={card.index * 0.07 + 0.04}
      variants={blockVariants}
      initial="hidden"
      animate={
        isWrong
          ? { x: SHAKE_X, transition: { duration: 0.45 } }
          : "visible"
      }
      whileTap={isMatched ? undefined : { scale: 0.9 }}
      onClick={() => onTap(card)}
      disabled={isMatched && !isCorrectAnim}
      className={cn(
        "relative w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center rounded-2xl",
        "cursor-pointer select-none",
        "text-[2rem] sm:text-[2.5rem]",
        "transition-all duration-150",
        // Base
        "bg-ocean-light border-4 border-ocean",
        "shadow-[0_6px_0_theme(colors.ocean-dark)]",
        // Drag-over state
        isOver &&
          "bg-sun/30 border-sun scale-[1.08] shadow-[0_6px_0_theme(colors.sun-dark)]",
        // Correct anim
        isCorrectAnim &&
          "bg-grass-light border-grass shadow-[0_6px_0_theme(colors.grass-dark)]",
        // Matched — green "done" state
        isMatched && !isCorrectAnim && "bg-grass-light border-grass/40 shadow-none pointer-events-none opacity-60",
      )}
      style={{ WebkitTapHighlightColor: "transparent" }}
    >
      {isCorrectAnim && <Sparkles />}

      {/* Emoji — bounces bigger when a card is dragged over */}
      <motion.span
        className="relative z-10 leading-none"
        animate={
          isOver
            ? {
                scale: [1, 1.35, 1],
                transition: { repeat: Infinity, duration: 0.55 },
              }
            : { scale: 1 }
        }
      >
        {card.emoji}
      </motion.span>

      {/* Shimmering overlay on drag-over */}
      {isOver && (
        <motion.div
          className="absolute inset-0 rounded-xl bg-sun/20"
          animate={{ opacity: [0.8, 0.1, 0.8] }}
          transition={{ repeat: Infinity, duration: 0.55 }}
        />
      )}

      {/* Matched checkmark badge */}
      {isMatched && !isCorrectAnim && (
        <span className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-grass rounded-full flex items-center justify-center text-[11px] text-white font-bold z-20 shadow-sm">✓</span>
      )}
    </motion.button>
  );
}

// ─── Matched pairs shelf ────────────────────────────────────────────────────

function MatchedShelf({
  matched,
  total,
}: {
  matched: { word: string; emoji: string }[];
  total: number;
}) {
  if (matched.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md"
    >
      <div className="flex items-center gap-2 mb-2.5">
        <span className="text-lg">🏆</span>
        <span className="font-display text-sm font-bold text-grass-dark">
          Collected
        </span>
        <span className="font-body text-xs text-white bg-grass rounded-full px-2 py-0.5 font-bold">
          {matched.length} / {total}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {matched.map((m) => (
          <motion.div
            key={m.word}
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 18 }}
            className="flex items-center gap-1.5 bg-white/80 border-2 border-grass rounded-2xl px-3 py-1.5 shadow-[0_3px_0_theme(colors.grass-dark/30)]"
          >
            <span className="font-display font-bold text-sm text-grass-dark">
              {m.word}
            </span>
            <span className="text-xl leading-none">{m.emoji}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function MatchingGame() {
  const { addStars } = useGameStore();
  const { play } = useSound();
  const { speak } = usePronunciation();
  const { containerRef, fire: fireConfetti } = useConfetti();

  const [level, setLevel] = useState(0);
  const [matchedWords, setMatchedWords] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<string | null>(null);
  const [wrongPair, setWrongPair] = useState<[string, string] | null>(null);
  const [correctPair, setCorrectPair] = useState<[string, string] | null>(null);
  const [toast, setToast] = useState<{ message: string; emoji: string } | null>(null);
  const [levelComplete, setLevelComplete] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 10 } }),
  );

  const levelDef = LEVELS[level];

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
  const allCards = useMemo(() => [...wordCards, ...emojiCards], [wordCards, emojiCards]);
  const matchedList = useMemo(
    () => Array.from(matchedWords).map((w) => ({ word: w, emoji: lookupEmoji(w) })),
    [matchedWords],
  );

  // Toast auto-hide
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 1800);
    return () => clearTimeout(t);
  }, [toast]);

  // Level complete detection
  useEffect(() => {
    if (matchedWords.size === totalPairs && totalPairs > 0 && !levelComplete) {
      const t = setTimeout(() => {
        setLevelComplete(true);
        fireConfetti();
        play("confetti");
        addStars(3);
      }, 600);
      return () => clearTimeout(t);
    }
  }, [matchedWords.size, totalPairs, levelComplete, fireConfetti, play, addStars]);

  // Core match logic shared by tap and drag
  const doMatch = useCallback(
    (cardA: CardItem, cardB: CardItem) => {
      if (wrongPair || correctPair) return;
      if (cardA.type === cardB.type) return;

      const wordCard = cardA.type === "word" ? cardA : cardB;
      const emojiCard = cardA.type === "emoji" ? cardA : cardB;
      const isMatch = wordCard.word === emojiCard.word;

      if (isMatch) {
        setCorrectPair([wordCard.id, emojiCard.id]);
        setSelected(null);
        play("success");
        speak(wordCard.word);
        addStars(1);
        setToast({ message: `${wordCard.word} = ${emojiCard.emoji}`, emoji: "🌟" });
        setTimeout(() => {
          setMatchedWords((prev) => new Set(prev).add(wordCard.word));
          setCorrectPair(null);
        }, 750);
      } else {
        setWrongPair([wordCard.id, emojiCard.id]);
        play("wrong");
        setTimeout(() => {
          setWrongPair(null);
          setSelected(null);
        }, 500);
      }
    },
    [wrongPair, correctPair, play, speak, addStars],
  );

  // Tap/click handler (fallback for non-drag interaction)
  const handleTap = useCallback(
    (card: CardItem) => {
      if (matchedWords.has(card.word)) return;
      if (wrongPair || correctPair) return;

      play("tap");

      if (!selected) {
        setSelected(card.id);
        if (card.type === "word") speak(card.word);
        return;
      }
      if (selected === card.id) {
        setSelected(null);
        return;
      }

      const prevCard = allCards.find((c) => c.id === selected)!;
      if (prevCard.type === card.type) {
        setSelected(card.id);
        if (card.type === "word") speak(card.word);
        return;
      }

      doMatch(prevCard, card);
    },
    [selected, matchedWords, wrongPair, correctPair, allCards, play, speak, doMatch],
  );

  // DND drag start
  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const id = event.active.id as string;
      setActiveDragId(id);
      setSelected(id);
      const card = allCards.find((c) => c.id === id);
      if (card?.type === "word") speak(card.word);
      play("tap");
    },
    [allCards, speak, play],
  );

  // DND drag end
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveDragId(null);
      const { active, over } = event;

      if (!over) {
        setSelected(null);
        return;
      }

      const draggedCard = allCards.find((c) => c.id === active.id);
      const targetCard = allCards.find((c) => c.id === over.id);
      if (!draggedCard || !targetCard) {
        setSelected(null);
        return;
      }

      doMatch(draggedCard, targetCard);
    },
    [allCards, doMatch],
  );

  // Advance or finish
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
      setGameFinished(true);
      addStars(5);
      play("confetti");
      fireConfetti();
    }
  }, [level, play, addStars, fireConfetti]);

  const activeDragCard = activeDragId ? allCards.find((c) => c.id === activeDragId) : null;

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <motion.div
        variants={pageTransition}
        initial="initial"
        animate="animate"
        className="max-w-3xl mx-auto px-3 py-6 flex flex-col items-center gap-6 min-h-screen"
      >
        {/* Confetti container */}
        <div ref={containerRef} className="fixed inset-0 pointer-events-none z-[9999]" />

        {/* Match notification toast */}
        <Toast message={toast?.message ?? ""} emoji={toast?.emoji ?? "🌟"} visible={!!toast} />

        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="w-full max-w-lg flex flex-col items-center gap-3">
          <motion.div
            key={`level-header-${level}`}
            initial={{ scale: 0.7, opacity: 0, y: -20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 20 }}
            className="flex items-center gap-3"
          >
            <motion.span
              className="text-4xl"
              animate={{ rotate: [0, 12, -12, 0] }}
              transition={{ repeat: Infinity, duration: 3.2, ease: "easeInOut" }}
            >
              {LEVEL_ICONS[level]}
            </motion.span>
            <h1 className="font-display text-2xl sm:text-3xl font-bold">
              <span className="text-candy">Level {level + 1}</span>
              <span className="text-night/30 mx-2">·</span>
              <span className="text-ocean text-xl">{totalPairs} pairs</span>
            </h1>
          </motion.div>

          <ProgressBar progress={progress} segments={totalPairs} className="max-w-xs" />

          {/* First-level hint */}
          {level === 0 && matchedWords.size === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4 }}
              className="flex items-center gap-2 font-body text-sm text-night/60 bg-white/70 rounded-full px-4 py-1.5 shadow-sm"
            >
              <motion.span
                animate={{ x: [0, 6, 0] }}
                transition={{ repeat: Infinity, duration: 0.85 }}
              >
                👆
              </motion.span>
              Tap a word, then tap its picture — or drag it!
            </motion.div>
          )}
        </div>

        {/* ── Game board: two grids of square blocks ────────────────── */}
        <div className="w-full flex flex-row gap-5 sm:gap-10 justify-center items-start">
          {/* Word blocks */}
          <div className="flex flex-col items-center gap-2">
            <span className="font-display text-xs sm:text-sm font-bold uppercase tracking-wider text-candy/60">
              Words
            </span>
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              {wordCards.map((card) => (
                <DraggableWordCard
                  key={card.id}
                  card={card}
                  isSelected={selected === card.id}
                  isWrong={wrongPair?.includes(card.id) ?? false}
                  isMatched={matchedWords.has(card.word)}
                  isCorrectAnim={correctPair?.includes(card.id) ?? false}
                  onTap={handleTap}
                />
              ))}
            </div>
          </div>

          {/* Emoji blocks */}
          <div className="flex flex-col items-center gap-2">
            <span className="font-display text-xs sm:text-sm font-bold uppercase tracking-wider text-ocean/60">
              Pictures
            </span>
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              {emojiCards.map((card) => (
                <DroppableEmojiCard
                  key={card.id}
                  card={card}
                  isWrong={wrongPair?.includes(card.id) ?? false}
                  isMatched={matchedWords.has(card.word)}
                  isCorrectAnim={correctPair?.includes(card.id) ?? false}
                  onTap={handleTap}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ── Matched pairs shelf ────────────────────────────────────── */}
        <MatchedShelf matched={matchedList} total={totalPairs} />

        {/* ── Level complete / Champion / Finished ────────────────────── */}
        <AnimatePresence>
          {levelComplete && !gameFinished && level < LEVELS.length - 1 && (
            <motion.div
              key="next-level"
              initial={{ opacity: 0, scale: 0.5, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -20 }}
              transition={{ type: "spring", stiffness: 280, damping: 20 }}
              className="flex flex-col items-center gap-4 mt-2"
            >
              <div className="flex gap-1">
                {["🌟", "⭐", "🌟", "⭐", "🌟"].map((s, i) => (
                  <motion.span
                    key={i}
                    className="text-3xl"
                    animate={{ y: [0, -18, 0] }}
                    transition={{ repeat: Infinity, duration: 0.85, delay: i * 0.13 }}
                  >
                    {s}
                  </motion.span>
                ))}
              </div>
              <motion.p
                className="font-display text-2xl sm:text-3xl font-bold text-grass-dark"
                animate={{ scale: [1, 1.07, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                Amazing! 🎉
              </motion.p>
              <motion.button
                animate={{ y: [0, -7, 0] }}
                transition={{ repeat: Infinity, duration: 1.1 }}
                whileTap={{ scale: 0.91 }}
                onClick={handleNextLevel}
                className="px-10 py-4 rounded-button bg-sun font-display font-bold text-xl sm:text-2xl text-night shadow-btn cursor-pointer select-none"
              >
                Next Level ➡️
              </motion.button>
            </motion.div>
          )}

          {levelComplete && level === LEVELS.length - 1 && !gameFinished && (
            <motion.div
              key="final-level"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              className="flex flex-col items-center gap-4 mt-2"
            >
              <motion.span
                className="text-6xl"
                animate={{ rotate: [0, 16, -16, 0], scale: [1, 1.18, 1] }}
                transition={{ repeat: Infinity, duration: 1.6 }}
              >
                🏆
              </motion.span>
              <motion.button
                whileTap={{ scale: 0.91 }}
                onClick={handleNextLevel}
                className="px-10 py-4 rounded-button bg-sun font-display font-bold text-xl text-night shadow-btn cursor-pointer select-none"
              >
                You&apos;re a Star! ⭐ Finish!
              </motion.button>
            </motion.div>
          )}

          {gameFinished && (
            <motion.div
              key="finished"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 250, damping: 15 }}
              className="flex flex-col items-center gap-4 py-4"
            >
              <motion.span
                className="text-7xl"
                animate={{ y: [0, -20, 0], rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 1.8 }}
              >
                🏆
              </motion.span>
              <span className="font-display text-3xl sm:text-4xl font-bold text-candy text-center">
                Matching Champion!
              </span>
              <div className="flex gap-2">
                {["⭐", "🌟", "💫", "🌟", "⭐"].map((s, i) => (
                  <motion.span
                    key={i}
                    className="text-3xl"
                    animate={{ y: [0, -15, 0], rotate: [0, 22, -22, 0] }}
                    transition={{
                      repeat: Infinity,
                      duration: 1 + i * 0.16,
                      delay: i * 0.12,
                    }}
                  >
                    {s}
                  </motion.span>
                ))}
              </div>
              <span className="font-body text-lg text-night/70">+5 bonus stars! 🎊</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Floating card shown while dragging */}
      <DragOverlay dropAnimation={null}>
        {activeDragCard && (
          <motion.div
            initial={{ scale: 1, rotate: 0 }}
            animate={{ scale: 1.1, rotate: 3 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "flex items-center justify-center rounded-2xl",
              "w-20 h-20 sm:w-24 sm:h-24",
              "bg-candy border-4 border-candy-dark text-white",
              "font-display font-bold text-sm sm:text-lg",
              "shadow-[0_14px_28px_rgba(255,107,138,0.5)]",
              "cursor-grabbing select-none pointer-events-none",
            )}
          >
            {activeDragCard.word}
          </motion.div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
