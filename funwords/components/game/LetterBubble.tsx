"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

interface LetterBubbleProps {
  letter: string;
  color?: string;
  onClick?: () => void;
  className?: string;
}

export function LetterBubble({ letter, color = "sky", onClick, className }: LetterBubbleProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 0.9 }}
      transition={{ type: "spring", stiffness: 400, damping: 15 }}
      onClick={onClick}
      className={cn(
        `w-16 h-16 rounded-bubble bg-${color} text-white font-display text-2xl font-bold flex items-center justify-center shadow-btn cursor-pointer`,
        className
      )}
      aria-label={`Letter ${letter}`}
    >
      {letter.toUpperCase()}
    </motion.button>
  );
}
