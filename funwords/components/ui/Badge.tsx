"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

interface BadgeProps {
  emoji: string;
  label: string;
  unlocked?: boolean;
  className?: string;
}

export function Badge({ emoji, label, unlocked = false, className }: BadgeProps) {
  return (
    <motion.div
      initial={false}
      animate={unlocked ? { scale: [0, 1.3, 1], rotate: [0, 10, -10, 0] } : { scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 15 }}
      className={cn(
        "flex flex-col items-center gap-1 p-3 rounded-card",
        unlocked ? "bg-sun/20" : "bg-night/5 grayscale opacity-50",
        className
      )}
    >
      <span className="text-3xl">{emoji}</span>
      <span className="text-xs font-body font-bold text-night">{label}</span>
    </motion.div>
  );
}
