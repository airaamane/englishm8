"use client";

import { cn } from "@/lib/cn";

interface WordSlotProps {
  letter?: string;
  filled?: boolean;
  active?: boolean;
  className?: string;
}

export function WordSlot({ letter, filled, active, className }: WordSlotProps) {
  return (
    <div
      className={cn(
        "w-14 h-14 rounded-button border-3 font-display text-2xl font-bold flex items-center justify-center transition-all",
        filled ? "border-grass bg-grass-light text-night" : "border-sky/40 bg-white",
        active && "border-sun shadow-glow-yellow animate-pulse-glow",
        className
      )}
    >
      {letter?.toUpperCase()}
    </div>
  );
}
