"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/stores/gameStore";
import { useSound } from "@/hooks/useSound";
import { usePronunciation } from "@/hooks/usePronunciation";
import { useConfetti } from "@/hooks/useConfetti";
import {
  staggerContainer,
  bounceIn,
  pageTransition,
} from "@/lib/animations";
import { cn } from "@/lib/cn";
import { Toast } from "@/components/ui/Toast";
import { categories, getWordsByCategory } from "@/lib/words";
import type { WordEntry } from "@/lib/words";

// ---------------------------------------------------------------------------
// Color mapping helpers — Tailwind classes keyed by category color
// ---------------------------------------------------------------------------

const colorMap: Record<
  string,
  {
    bg: string;
    bgLight: string;
    border: string;
    text: string;
    shadow: string;
    ring: string;
  }
> = {
  candy: {
    bg: "bg-candy",
    bgLight: "bg-candy-light",
    border: "border-candy",
    text: "text-candy",
    shadow: "shadow-[0_4px_0_theme(colors.candy-dark)]",
    ring: "ring-candy",
  },
  orange: {
    bg: "bg-orange",
    bgLight: "bg-orange-light",
    border: "border-orange",
    text: "text-orange",
    shadow: "shadow-[0_4px_0_theme(colors.orange-dark)]",
    ring: "ring-orange",
  },
  purple: {
    bg: "bg-purple",
    bgLight: "bg-purple-light",
    border: "border-purple",
    text: "text-purple",
    shadow: "shadow-[0_4px_0_theme(colors.purple-dark)]",
    ring: "ring-purple",
  },
  sky: {
    bg: "bg-sky",
    bgLight: "bg-sky-light",
    border: "border-sky",
    text: "text-sky",
    shadow: "shadow-[0_4px_0_theme(colors.sky-dark)]",
    ring: "ring-sky",
  },
  grass: {
    bg: "bg-grass",
    bgLight: "bg-grass-light",
    border: "border-grass",
    text: "text-grass",
    shadow: "shadow-[0_4px_0_theme(colors.grass-dark)]",
    ring: "ring-grass",
  },
  sun: {
    bg: "bg-sun",
    bgLight: "bg-[#FFF8E0]",
    border: "border-sun",
    text: "text-sun-dark",
    shadow: "shadow-[0_4px_0_theme(colors.sun-dark)]",
    ring: "ring-sun",
  },
};

// ---------------------------------------------------------------------------
// Wobble animation for unrevealed cards
// ---------------------------------------------------------------------------

const wobble = {
  idle: {
    rotate: [0, -3, 3, -2, 2, 0],
    transition: {
      duration: 2.5,
      repeat: Infinity,
      ease: "easeInOut" as const,
    },
  },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function CategoriesGame() {
  const { addStars } = useGameStore();
  const { play } = useSound();
  const { speak } = usePronunciation();
  const { containerRef, fire: fireConfetti } = useConfetti();

  // Active category
  const [activeCategory, setActiveCategory] = useState<string>(categories[0].id);

  // Revealed cards per category: { [categoryId]: Set<word> }
  const [revealedMap, setRevealedMap] = useState<Record<string, Set<string>>>(
    () => {
      const map: Record<string, Set<string>> = {};
      for (const cat of categories) {
        map[cat.id] = new Set();
      }
      return map;
    }
  );

  // Track which categories are "complete" (all revealed) so we only fire confetti once
  const [completedCategories, setCompletedCategories] = useState<Set<string>>(
    new Set()
  );

  // Toast state
  const [toast, setToast] = useState<{
    message: string;
    emoji: string;
  } | null>(null);

  // Auto-hide toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  // Current category data
  const activeCategoryData = useMemo(
    () => categories.find((c) => c.id === activeCategory)!,
    [activeCategory]
  );

  const categoryWords: WordEntry[] = useMemo(
    () => getWordsByCategory(activeCategory),
    [activeCategory]
  );

  const revealed = revealedMap[activeCategory];
  const totalRevealed = Object.values(revealedMap).reduce(
    (sum, set) => sum + set.size,
    0
  );

  // Check category completion
  useEffect(() => {
    if (
      categoryWords.length > 0 &&
      revealed.size === categoryWords.length &&
      !completedCategories.has(activeCategory)
    ) {
      const t = setTimeout(() => {
        fireConfetti();
        play("confetti");
        addStars(3);
        setCompletedCategories((prev) => new Set(prev).add(activeCategory));
        setToast({
          message: `You discovered all the ${activeCategoryData.name.toLowerCase()}!`,
          emoji: activeCategoryData.emoji,
        });
      }, 400);
      return () => clearTimeout(t);
    }
  }, [
    revealed.size,
    categoryWords.length,
    activeCategory,
    completedCategories,
    fireConfetti,
    play,
    addStars,
    activeCategoryData,
  ]);

  // -----------------------------------------------------------------------
  // Category pill tap
  // -----------------------------------------------------------------------
  const handleCategoryTap = useCallback(
    (catId: string) => {
      if (catId === activeCategory) return;
      play("whoosh");
      setActiveCategory(catId);
    },
    [activeCategory, play]
  );

  // -----------------------------------------------------------------------
  // Card flip
  // -----------------------------------------------------------------------
  const handleCardFlip = useCallback(
    (word: WordEntry) => {
      const isRevealed = revealed.has(word.word);

      play("whoosh");

      if (isRevealed) {
        // Flip back — unrevealing
        setRevealedMap((prev) => {
          const next = { ...prev };
          const newSet = new Set(next[activeCategory]);
          newSet.delete(word.word);
          next[activeCategory] = newSet;
          return next;
        });
      } else {
        // Reveal
        setRevealedMap((prev) => {
          const next = { ...prev };
          const newSet = new Set(next[activeCategory]);
          newSet.add(word.word);
          next[activeCategory] = newSet;
          return next;
        });

        // First reveal: award 1 star
        addStars(1);
        play("star");
      }
    },
    [activeCategory, revealed, play, addStars]
  );

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  const colors = colorMap[activeCategoryData.color] ?? colorMap.candy;

  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      className="max-w-4xl mx-auto px-4 py-6 flex flex-col items-center gap-5 min-h-screen"
    >
      {/* Confetti container */}
      <div
        ref={containerRef}
        className="fixed inset-0 pointer-events-none z-[9999]"
      />

      {/* Toast */}
      <Toast
        message={toast?.message ?? ""}
        emoji={toast?.emoji ?? "🌟"}
        visible={!!toast}
      />

      {/* Title */}
      <h1 className="font-display text-2xl sm:text-3xl font-bold text-night">
        Word Explorer
      </h1>

      {/* ------- Category Pills ------- */}
      <div className="w-full overflow-x-auto scrollbar-none -mx-4 px-4">
        <motion.div
          className="flex gap-3 pb-2 min-w-max mx-auto justify-center"
          layout
        >
          {categories.map((cat) => {
            const isActive = cat.id === activeCategory;
            const catColors = colorMap[cat.color] ?? colorMap.candy;
            const catRevealed = revealedMap[cat.id].size;
            const catTotal = getWordsByCategory(cat.id).length;

            return (
              <motion.button
                key={cat.id}
                layout
                onClick={() => handleCategoryTap(cat.id)}
                whileTap={{ scale: 0.93 }}
                className={cn(
                  "relative flex items-center gap-2 rounded-full px-5 py-2 font-display font-bold text-base cursor-pointer select-none transition-colors duration-200 min-h-[48px]",
                  isActive
                    ? [catColors.bg, "text-white", catColors.shadow]
                    : [
                        "bg-white border-[2.5px]",
                        catColors.border,
                        catColors.text,
                      ]
                )}
                style={{ WebkitTapHighlightColor: "transparent" }}
              >
                <span className="text-lg">{cat.emoji}</span>
                <span>{cat.name}</span>

                {/* Word count badge */}
                {catRevealed > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={cn(
                      "absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                      isActive
                        ? "bg-white text-night"
                        : [catColors.bg, "text-white"]
                    )}
                  >
                    {catRevealed === catTotal ? "✓" : catRevealed}
                  </motion.span>
                )}
              </motion.button>
            );
          })}
        </motion.div>
      </div>

      {/* ------- Flip Card Grid ------- */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategory}
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          exit={{ opacity: 0, transition: { duration: 0.15 } }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 w-full max-w-2xl"
        >
          {categoryWords.map((word, index) => {
            const isRevealed = revealed.has(word.word);

            return (
              <motion.div
                key={word.word}
                variants={bounceIn}
                custom={index}
                className="perspective-[800px]"
              >
                <motion.button
                  onClick={() => handleCardFlip(word)}
                  className="relative w-full cursor-pointer select-none"
                  style={{
                    minHeight: 160,
                    transformStyle: "preserve-3d",
                    WebkitTapHighlightColor: "transparent",
                  }}
                  animate={{
                    rotateY: isRevealed ? 180 : 0,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  {/* FRONT — Mystery "?" card */}
                  <motion.div
                    variants={isRevealed ? undefined : wobble}
                    animate={isRevealed ? undefined : "idle"}
                    className={cn(
                      "absolute inset-0 rounded-card flex items-center justify-center backface-hidden",
                      colors.bg,
                      colors.shadow
                    )}
                    style={{ backfaceVisibility: "hidden" }}
                  >
                    <span className="font-display text-5xl text-white/90 select-none">
                      ?
                    </span>
                  </motion.div>

                  {/* BACK — Revealed content */}
                  <div
                    className={cn(
                      "absolute inset-0 rounded-card flex flex-col items-center justify-center gap-1.5 backface-hidden bg-white border-[3px]",
                      colors.border,
                      "shadow-card"
                    )}
                    style={{
                      backfaceVisibility: "hidden",
                      transform: "rotateY(180deg)",
                    }}
                  >
                    <span className="text-[2.5rem] leading-none">
                      {word.emoji}
                    </span>
                    <span className="font-display font-bold text-[1.4rem] text-night">
                      {word.word}
                    </span>
                    <SpeakerButton
                      word={word.word}
                      speak={speak}
                      play={play}
                      color={activeCategoryData.color}
                    />
                  </div>
                </motion.button>
              </motion.div>
            );
          })}
        </motion.div>
      </AnimatePresence>

      {/* ------- Bottom: Word Counter ------- */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 300, damping: 20 }}
        className="mt-auto pb-6 pt-4"
      >
        <div className="bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-card flex items-center gap-2">
          <span className="text-xl">⭐</span>
          <span className="font-display font-bold text-lg text-night">
            I learned {totalRevealed} word{totalRevealed !== 1 ? "s" : ""}!
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Speaker button (stops event propagation so the card doesn't flip)
// ---------------------------------------------------------------------------

function SpeakerButton({
  word,
  speak,
  play,
  color,
}: {
  word: string;
  speak: (text: string) => void;
  play: (name: string) => void;
  color: string;
}) {
  const colors = colorMap[color] ?? colorMap.candy;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        play("pop");
        speak(word);
      }}
      className={cn(
        "mt-1 w-12 h-12 min-w-[48px] min-h-[48px] rounded-full flex items-center justify-center cursor-pointer transition-transform active:scale-90",
        colors.bgLight,
        colors.border,
        "border-2"
      )}
      aria-label={`Hear ${word}`}
    >
      <span className="text-xl">🔊</span>
    </button>
  );
}
