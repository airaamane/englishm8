"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

interface ProgressBarProps {
  progress: number; // 0 to 1
  segments?: number;
  className?: string;
}

export function ProgressBar({ progress, segments = 10, className }: ProgressBarProps) {
  return (
    <div className={cn("flex gap-1 w-full", className)}>
      {Array.from({ length: segments }).map((_, i) => {
        const filled = progress >= (i + 1) / segments;
        return (
          <motion.div
            key={i}
            className={cn(
              "h-4 flex-1 rounded-full transition-colors",
              filled ? "bg-grass" : "bg-grass-light"
            )}
            initial={false}
            animate={filled ? { scale: [1, 1.2, 1] } : { scale: 1 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
          />
        );
      })}
    </div>
  );
}
