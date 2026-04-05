"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { bounceIn } from "@/lib/animations";

interface CategoryCardProps {
  id: string;
  name: string;
  emoji: string;
  color: string;
  wordCount: number;
  className?: string;
}

export function CategoryCard({ id, name, emoji, color, wordCount, className }: CategoryCardProps) {
  return (
    <Link href={`/games/categories?cat=${id}`}>
      <motion.div
        variants={bounceIn}
        whileHover={{ scale: 1.05, y: -4 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          `bg-${color}-light border-2 border-${color} rounded-card p-6 flex flex-col items-center gap-2 shadow-card cursor-pointer min-h-[120px]`,
          className
        )}
      >
        <span className="text-4xl">{emoji}</span>
        <span className="font-display font-bold text-lg text-night">{name}</span>
        <span className="text-sm font-body text-night/60">{wordCount} words</span>
      </motion.div>
    </Link>
  );
}
