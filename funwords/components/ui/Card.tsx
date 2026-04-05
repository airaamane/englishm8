"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { flipCard } from "@/lib/animations";

interface CardProps {
  front: React.ReactNode;
  back: React.ReactNode;
  isFlipped?: boolean;
  className?: string;
  onClick?: () => void;
}

export function Card({ front, back, isFlipped = false, className, onClick }: CardProps) {
  return (
    <div
      className={cn("relative cursor-pointer perspective-[800px]", className)}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick?.()}
    >
      <motion.div
        className="relative w-full h-full"
        style={{ transformStyle: "preserve-3d" }}
        variants={flipCard}
        animate={isFlipped ? "back" : "front"}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <div className="absolute inset-0 backface-hidden rounded-card bg-white shadow-card p-4 flex items-center justify-center">
          {front}
        </div>
        <div
          className="absolute inset-0 backface-hidden rounded-card bg-white shadow-card p-4 flex items-center justify-center"
          style={{ transform: "rotateY(180deg)" }}
        >
          {back}
        </div>
      </motion.div>
    </div>
  );
}
