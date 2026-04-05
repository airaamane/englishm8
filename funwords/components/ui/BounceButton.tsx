"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { useSound } from "@/hooks/useSound";

interface BounceButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "success" | "danger";
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  "aria-label"?: string;
}

const variantClasses = {
  primary: "bg-sky text-white shadow-btn hover:shadow-btn-hover active:shadow-btn-active",
  secondary: "bg-sun text-night shadow-btn hover:shadow-btn-hover active:shadow-btn-active",
  success: "bg-grass text-white shadow-btn hover:shadow-btn-hover active:shadow-btn-active",
  danger: "bg-candy text-white shadow-btn hover:shadow-btn-hover active:shadow-btn-active",
};

export function BounceButton({
  children,
  variant = "primary",
  className,
  onClick,
  disabled,
  type,
  "aria-label": ariaLabel,
}: BounceButtonProps) {
  const { play } = useSound();

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.92, y: 2 }}
      transition={{ type: "spring", stiffness: 400, damping: 15 }}
      className={cn(
        "px-6 py-3 rounded-button font-display font-bold text-lg min-w-[48px] min-h-[48px] cursor-pointer transition-shadow",
        variantClasses[variant],
        className
      )}
      onClick={(e) => {
        play("tap");
        onClick?.(e);
      }}
      disabled={disabled}
      type={type}
      aria-label={ariaLabel}
    >
      {children}
    </motion.button>
  );
}
