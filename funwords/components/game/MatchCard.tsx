"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { bounceIn } from "@/lib/animations";

interface MatchCardProps {
  content: string;
  emoji?: string;
  isSelected?: boolean;
  isMatched?: boolean;
  isWrong?: boolean;
  onClick?: () => void;
  className?: string;
}

export function MatchCard({
  content,
  emoji,
  isSelected,
  isMatched,
  isWrong,
  onClick,
  className,
}: MatchCardProps) {
  return (
    <motion.button
      variants={bounceIn}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.92 }}
      onClick={onClick}
      disabled={isMatched}
      className={cn(
        "min-w-[48px] min-h-[48px] p-4 rounded-card shadow-card font-display text-xl font-bold flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors",
        isMatched && "bg-grass-light border-2 border-grass",
        isSelected && !isMatched && "bg-sky-light border-2 border-sky",
        isWrong && "bg-candy-light border-2 border-candy",
        !isSelected && !isMatched && !isWrong && "bg-white hover:bg-cream",
        className
      )}
      aria-label={content}
    >
      {emoji && <span className="text-3xl">{emoji}</span>}
      <span>{content}</span>
    </motion.button>
  );
}
