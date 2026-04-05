"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/cn";
import { BounceButton } from "./BounceButton";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  emoji?: string;
  children?: React.ReactNode;
  className?: string;
}

export function Modal({ open, onClose, title, emoji = "🎉", children, className }: ModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-night/40" onClick={onClose} />
          <motion.div
            className={cn(
              "relative bg-white rounded-section shadow-card p-8 max-w-sm w-full text-center",
              className
            )}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            <span className="text-6xl block mb-4">{emoji}</span>
            <h2 className="font-display text-3xl font-bold text-night mb-4">{title}</h2>
            {children}
            <BounceButton variant="success" onClick={onClose} className="mt-4">
              Continue! 🚀
            </BounceButton>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
