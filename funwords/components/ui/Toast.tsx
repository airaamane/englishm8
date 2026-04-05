"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/cn";

interface ToastProps {
  message: string;
  emoji?: string;
  visible: boolean;
  className?: string;
}

export function Toast({ message, emoji = "🌟", visible, className }: ToastProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className={cn(
            "fixed top-20 left-1/2 -translate-x-1/2 z-[60] bg-white shadow-card rounded-card px-6 py-3 flex items-center gap-3",
            className
          )}
        >
          <span className="text-2xl">{emoji}</span>
          <span className="font-display font-bold text-lg text-night">{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
