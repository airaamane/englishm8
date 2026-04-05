"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import {
  DndContext,
  useDraggable,
  useDroppable,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
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
import { words, type WordEntry } from "@/lib/words";

// ─── Types ────────────────────────────────────────────────────────

type Tier = "easy" | "medium" | "hard";

interface TileData {
  id: string;
  letter: string;
  isDistractor: boolean;
}

interface SlotState {
  index: number;
  tileId: string | null;
  letter: string | null;
  correct: boolean;
}

// ─── Tier configuration ──────────────────────────────────────────

const TIER_CONFIG: Record<Tier, { label: string; emoji: string; distractors: number }> = {
  easy: { label: "Easy", emoji: "🌱", distractors: 2 },
  medium: { label: "Medium", emoji: "🌿", distractors: 2 },
  hard: { label: "Hard", emoji: "🌳", distractors: 3 },
};

const WORDS_PER_TIER = 8;

// ─── Word selection per tier from lib/words.ts ───────────────────

const TIER_WORDS: Record<Tier, string[]> = {
  easy: ["cat", "dog", "sun", "red", "egg", "ear", "car", "ball"],
  medium: ["fish", "bird", "frog", "apple", "green", "cake", "milk", "book"],
  hard: ["banana", "turtle", "rabbit", "flower", "cookie", "penguin", "dolphin", "rainbow"],
};

function getWordEntry(word: string): WordEntry {
  return words.find((w) => w.word === word)!;
}

// ─── Helpers ─────────────────────────────────────────────────────

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const DISTRACTOR_POOL = "abcdefghijklmnopqrstuvwxyz";

function generateDistractors(word: string, count: number): string[] {
  const existing = new Set(word.split(""));
  const available = DISTRACTOR_POOL.split("").filter((l) => !existing.has(l));
  return shuffleArray(available).slice(0, count);
}

function buildTiles(word: string, distractorCount: number): TileData[] {
  const wordLetters: TileData[] = word.split("").map((letter, i) => ({
    id: `word-${i}-${letter}`,
    letter,
    isDistractor: false,
  }));
  const distractors = generateDistractors(word, distractorCount).map((letter, i) => ({
    id: `distractor-${i}-${letter}`,
    letter,
    isDistractor: true,
  }));
  return shuffleArray([...wordLetters, ...distractors]);
}

// ─── Draggable Tile ──────────────────────────────────────────────

function DraggableTile({
  tile,
  disabled,
  onTap,
}: {
  tile: TileData;
  disabled: boolean;
  onTap: (tile: TileData) => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: tile.id,
    disabled,
    data: tile,
  });

  return (
    <motion.button
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      variants={bounceIn}
      onClick={() => !disabled && onTap(tile)}
      disabled={disabled}
      className={cn(
        "relative select-none font-display font-bold text-[1.5rem] text-purple rounded-[14px] cursor-pointer",
        "w-[42px] h-[46px] sm:w-[50px] sm:h-[54px]",
        "border-[3px] border-purple bg-purple-light",
        "transition-all duration-150 min-w-[48px] min-h-[48px] flex items-center justify-center",
        isDragging && "opacity-40",
        disabled && "opacity-30 cursor-default",
        !disabled && "hover:scale-105 active:scale-95"
      )}
      style={{
        boxShadow: disabled ? "none" : "0 4px 0 var(--color-purple-dark)",
      }}
      aria-label={`Letter ${tile.letter}`}
    >
      {tile.letter.toUpperCase()}
    </motion.button>
  );
}

// ─── Droppable Slot ──────────────────────────────────────────────

function DroppableSlot({
  slot,
  shaking,
  flashRed,
}: {
  slot: SlotState;
  shaking: boolean;
  flashRed: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `slot-${slot.index}`,
    data: { slotIndex: slot.index },
  });

  const isFilled = slot.letter !== null;
  const isCorrect = slot.correct;

  return (
    <motion.div
      ref={setNodeRef}
      variants={shaking ? shake : undefined}
      animate={shaking ? "wrong" : "idle"}
      className={cn(
        "flex items-center justify-center rounded-[14px] font-display font-bold text-[1.5rem] select-none",
        "w-[42px] h-[50px] sm:w-[52px] sm:h-[60px]",
        "transition-colors duration-200",
        !isFilled && "border-[3px] border-dashed border-[#ddd] bg-[#fafafa]",
        isFilled && !isCorrect && "border-[3px] border-solid border-sky bg-ocean-light text-night",
        isFilled && isCorrect && "border-[3px] border-solid border-grass bg-grass-light text-night",
        isOver && !isFilled && "border-sky bg-sky-light/50 scale-105",
        flashRed && "!border-candy !bg-candy-light"
      )}
    >
      {isFilled && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 15 }}
        >
          {slot.letter!.toUpperCase()}
        </motion.span>
      )}
    </motion.div>
  );
}

// ─── Drag Overlay Content ────────────────────────────────────────

function TileOverlay({ letter }: { letter: string }) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-[14px] font-display font-bold text-[1.5rem] text-purple",
        "w-[50px] h-[54px] border-[3px] border-purple bg-purple-light",
        "rotate-3 scale-110"
      )}
      style={{ boxShadow: "0 8px 16px rgba(0,0,0,0.2)" }}
    >
      {letter.toUpperCase()}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────

export default function SpellingGame() {
  const { play } = useSound();
  const { speak } = usePronunciation();
  const { containerRef: confettiRef, fire: fireConfetti } = useConfetti();
  const { addStars } = useGameStore();

  // Game progression state
  const [currentTier, setCurrentTier] = useState<Tier>("easy");
  const [wordIndex, setWordIndex] = useState(0);
  const [tierComplete, setTierComplete] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);

  // Current word state
  const currentWord = useMemo(() => {
    const wordStr = TIER_WORDS[currentTier][wordIndex];
    return wordStr ? getWordEntry(wordStr) : null;
  }, [currentTier, wordIndex]);

  const [tiles, setTiles] = useState<TileData[]>([]);
  const [slots, setSlots] = useState<SlotState[]>([]);
  const [usedTileIds, setUsedTileIds] = useState<Set<string>>(new Set());
  const [shakingSlot, setShakingSlot] = useState<number | null>(null);
  const [flashRedSlot, setFlashRedSlot] = useState<number | null>(null);
  const [wordComplete, setWordComplete] = useState(false);
  const [skipping, setSkipping] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const [activeDragTile, setActiveDragTile] = useState<TileData | null>(null);

  const advanceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const completionFiredRef = useRef(false);

  // Sensors for drag: require 8px movement before drag starts (so taps work)
  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: { distance: 8 },
  });
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: { distance: 8 },
  });
  const sensors = useSensors(pointerSensor, touchSensor);

  // ─── Toast helper ──────────────────────────────────────────────

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2500);
  }, []);

  // ─── Advance to next word/tier ─────────────────────────────────

  const advanceToNext = useCallback(() => {
    const nextIndex = wordIndex + 1;
    if (nextIndex < WORDS_PER_TIER) {
      setWordIndex(nextIndex);
    } else {
      // Tier complete
      play("confetti");
      fireConfetti();
      addStars(5);

      const tiers: Tier[] = ["easy", "medium", "hard"];
      const currentTierIndex = tiers.indexOf(currentTier);

      if (currentTierIndex < tiers.length - 1) {
        setTierComplete(true);
        showToast(`${TIER_CONFIG[currentTier].label} complete! +5 bonus stars`);
      } else {
        setGameFinished(true);
        showToast("You finished all levels! +5 bonus stars");
      }
    }
  }, [wordIndex, currentTier, play, fireConfetti, addStars, showToast]);

  // ─── Initialize word ────────────────────────────────────────────

  const initWord = useCallback(() => {
    const wordStr = TIER_WORDS[currentTier][wordIndex];
    if (!wordStr) return;
    const entry = getWordEntry(wordStr);
    const distractorCount = TIER_CONFIG[currentTier].distractors;
    const newTiles = buildTiles(entry.word, distractorCount);
    const newSlots: SlotState[] = entry.word.split("").map((_, i) => ({
      index: i,
      tileId: null,
      letter: null,
      correct: false,
    }));
    setTiles(newTiles);
    setSlots(newSlots);
    setUsedTileIds(new Set());
    setWordComplete(false);
    setSkipping(false);
    setShakingSlot(null);
    setFlashRedSlot(null);
    completionFiredRef.current = false;
  }, [currentTier, wordIndex]);

  useEffect(() => {
    if (!tierComplete && !gameFinished) {
      initWord();
    }
  }, [initWord, tierComplete, gameFinished]);

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      if (advanceTimeoutRef.current) clearTimeout(advanceTimeoutRef.current);
    };
  }, []);

  // ─── Word completion effect ─────────────────────────────────────

  useEffect(() => {
    if (!wordComplete || !currentWord || skipping) return;
    play("success");
    addStars(2);
    setTimeout(() => speak(currentWord.word), 500);
    showToast("Great spelling! +2 stars");
    advanceTimeoutRef.current = setTimeout(() => {
      advanceToNext();
    }, 1500);
  }, [wordComplete]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Find next empty slot ───────────────────────────────────────

  const getNextEmptySlotIndex = useCallback((): number | null => {
    const idx = slots.findIndex((s) => s.letter === null);
    return idx === -1 ? null : idx;
  }, [slots]);

  // ─── Place letter in slot ──────────────────────────────────────

  const placeLetter = useCallback(
    (tile: TileData, slotIndex: number) => {
      if (!currentWord) return;
      const expectedLetter = currentWord.word[slotIndex];
      const isCorrect = tile.letter === expectedLetter;

      if (isCorrect) {
        play("pop");
        setUsedTileIds((prev) => new Set([...prev, tile.id]));
        setSlots((prev) => {
          const updated = prev.map((s) =>
            s.index === slotIndex
              ? { ...s, tileId: tile.id, letter: tile.letter, correct: true }
              : s
          );
          // Check if all slots are now correct
          if (updated.every((s) => s.correct) && !completionFiredRef.current) {
            completionFiredRef.current = true;
            setTimeout(() => {
              setWordComplete(true);
            }, 300);
          }
          return updated;
        });
      } else {
        // Wrong letter
        play("wrong");
        setShakingSlot(slotIndex);
        setFlashRedSlot(slotIndex);
        setTimeout(() => {
          setShakingSlot(null);
          setFlashRedSlot(null);
        }, 400);
      }
    },
    [currentWord, play]
  );

  // ─── Tap handler (primary interaction) ─────────────────────────

  const handleTileTap = useCallback(
    (tile: TileData) => {
      if (wordComplete || skipping) return;
      if (usedTileIds.has(tile.id)) return;

      const nextSlot = getNextEmptySlotIndex();
      if (nextSlot === null) return;

      placeLetter(tile, nextSlot);
    },
    [wordComplete, skipping, usedTileIds, getNextEmptySlotIndex, placeLetter]
  );

  // ─── Drag handlers ─────────────────────────────────────────────

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const tile = event.active.data.current as TileData | undefined;
    if (tile) setActiveDragTile(tile);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveDragTile(null);
      const { active, over } = event;
      if (!over) return;

      const tile = active.data.current as TileData | undefined;
      if (!tile) return;
      if (usedTileIds.has(tile.id)) return;

      const slotData = over.data.current as { slotIndex?: number } | undefined;
      if (slotData?.slotIndex == null) return;
      const slotIndex = slotData.slotIndex;

      // Only drop into empty slots
      if (slots[slotIndex]?.letter !== null) return;

      placeLetter(tile, slotIndex);
    },
    [usedTileIds, slots, placeLetter]
  );

  // ─── Next tier ─────────────────────────────────────────────────

  const handleNextTier = useCallback(() => {
    const tiers: Tier[] = ["easy", "medium", "hard"];
    const nextTierIndex = tiers.indexOf(currentTier) + 1;
    if (nextTierIndex < tiers.length) {
      setCurrentTier(tiers[nextTierIndex]);
      setWordIndex(0);
      setTierComplete(false);
    }
  }, [currentTier]);

  // ─── Restart ───────────────────────────────────────────────────

  const handleRestart = useCallback(() => {
    setCurrentTier("easy");
    setWordIndex(0);
    setTierComplete(false);
    setGameFinished(false);
  }, []);

  // ─── Skip ──────────────────────────────────────────────────────

  const handleSkip = useCallback(() => {
    if (!currentWord || wordComplete || skipping) return;
    setSkipping(true);

    // Cascade fill letters one by one
    const letters = currentWord.word.split("");
    letters.forEach((letter, i) => {
      setTimeout(() => {
        setSlots((prev) =>
          prev.map((s) =>
            s.index === i ? { ...s, letter, correct: true, tileId: `skip-${i}` } : s
          )
        );
        play("pop");
      }, i * 300);
    });

    // After all letters revealed
    setTimeout(() => {
      speak(currentWord.word);
      advanceTimeoutRef.current = setTimeout(() => {
        advanceToNext();
      }, 2000);
    }, letters.length * 300 + 200);
  }, [currentWord, wordComplete, skipping, play, speak, advanceToNext]);

  // ─── Render: Tier Complete Screen ──────────────────────────────

  if (tierComplete) {
    return (
      <motion.div
        variants={pageTransition}
        initial="initial"
        animate="animate"
        className="max-w-lg mx-auto px-4 py-12 text-center flex flex-col items-center gap-6"
      >
        <div ref={confettiRef} className="fixed inset-0 pointer-events-none z-[9999]" />
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 12 }}
          className="text-[5rem]"
        >
          🐝
        </motion.div>
        <h2 className="font-display text-3xl font-bold text-night">
          {TIER_CONFIG[currentTier].label} Complete!
        </h2>
        <p className="font-body text-lg text-night/70">
          You spelled all {WORDS_PER_TIER} words! +5 bonus stars
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleNextTier}
          className={cn(
            "font-display font-bold text-xl text-white px-8 py-4 rounded-button",
            "bg-grass hover:bg-grass-dark transition-colors",
            "min-w-[48px] min-h-[48px]"
          )}
          style={{ boxShadow: "var(--shadow-btn)" }}
        >
          Next Level 🐝
        </motion.button>
        <Toast message={toastMessage} visible={toastVisible} emoji="🎉" />
      </motion.div>
    );
  }

  // ─── Render: Game Finished Screen ──────────────────────────────

  if (gameFinished) {
    return (
      <motion.div
        variants={pageTransition}
        initial="initial"
        animate="animate"
        className="max-w-lg mx-auto px-4 py-12 text-center flex flex-col items-center gap-6"
      >
        <div ref={confettiRef} className="fixed inset-0 pointer-events-none z-[9999]" />
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 12 }}
          className="text-[5rem]"
        >
          🏆
        </motion.div>
        <h2 className="font-display text-3xl font-bold text-night">
          You Finished!
        </h2>
        <p className="font-body text-lg text-night/70">
          Amazing job! You are a Spelling Bee champion!
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleRestart}
          className={cn(
            "font-display font-bold text-xl text-white px-8 py-4 rounded-button",
            "bg-purple hover:bg-purple-dark transition-colors",
            "min-w-[48px] min-h-[48px]"
          )}
          style={{ boxShadow: "var(--shadow-btn)" }}
        >
          Play Again 🏆
        </motion.button>
        <Toast message={toastMessage} visible={toastVisible} emoji="🏆" />
      </motion.div>
    );
  }

  if (!currentWord) return null;

  const progressPercent = ((wordIndex + 1) / WORDS_PER_TIER) * 100;

  // ─── Render: Game Screen ───────────────────────────────────────

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <motion.div
        variants={pageTransition}
        initial="initial"
        animate="animate"
        className="max-w-lg mx-auto px-4 py-6 flex flex-col items-center gap-5 min-h-[80vh]"
      >
        {/* Confetti container */}
        <div ref={confettiRef} className="fixed inset-0 pointer-events-none z-[9999]" />

        {/* Toast */}
        <Toast message={toastMessage} visible={toastVisible} emoji="🌟" />

        {/* ─── Top: Tier + Progress ─────────────────────────────── */}
        <div className="w-full flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="font-display font-bold text-sm text-night/60">
              {TIER_CONFIG[currentTier].emoji} {TIER_CONFIG[currentTier].label}
            </span>
            <span className="font-body text-sm text-night/60">
              Word {wordIndex + 1} of {WORDS_PER_TIER}
            </span>
          </div>
          <div className="w-full h-3 bg-white/60 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-grass rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
            />
          </div>
        </div>

        {/* ─── Emoji + Hint ─────────────────────────────────────── */}
        <div className="flex flex-col items-center gap-2 mt-2">
          <motion.div
            className="text-[5rem] leading-none select-none"
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          >
            {currentWord.emoji}
          </motion.div>
          <p className="font-body text-base sm:text-lg text-night/70 text-center max-w-xs">
            {currentWord.hint}
          </p>
        </div>

        {/* ─── Letter Slots ─────────────────────────────────────── */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="flex gap-2 sm:gap-3 justify-center flex-wrap"
        >
          {slots.map((slot) => (
            <motion.div key={slot.index} variants={bounceIn}>
              <DroppableSlot
                slot={slot}
                shaking={shakingSlot === slot.index}
                flashRed={flashRedSlot === slot.index}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* ─── Scrambled Tiles ──────────────────────────────────── */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="flex gap-2 sm:gap-3 justify-center flex-wrap mt-4"
        >
          {tiles.map((tile) => (
            <motion.div key={tile.id} variants={bounceIn}>
              <DraggableTile
                tile={tile}
                disabled={usedTileIds.has(tile.id) || wordComplete || skipping}
                onTap={handleTileTap}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* ─── Skip Link ────────────────────────────────────────── */}
        <div className="mt-auto pt-6 pb-4">
          <button
            onClick={handleSkip}
            disabled={wordComplete || skipping}
            className={cn(
              "font-body text-sm text-night/40 hover:text-night/60 transition-colors underline",
              "min-w-[48px] min-h-[48px] flex items-center justify-center",
              (wordComplete || skipping) && "opacity-0 pointer-events-none"
            )}
          >
            Skip this word
          </button>
        </div>

        {/* ─── Drag Overlay ─────────────────────────────────────── */}
        <DragOverlay>
          {activeDragTile ? <TileOverlay letter={activeDragTile.letter} /> : null}
        </DragOverlay>
      </motion.div>
    </DndContext>
  );
}
