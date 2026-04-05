"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useGameStore } from "@/stores/gameStore";
import { StarCounter } from "@/components/ui/StarCounter";

const logoLetters = [
  { char: "F", color: "text-candy" },
  { char: "u", color: "text-orange" },
  { char: "n", color: "text-sun" },
  { char: "W", color: "text-grass" },
  { char: "o", color: "text-sky" },
  { char: "r", color: "text-purple" },
  { char: "d", color: "text-mint" },
  { char: "s", color: "text-coral" },
  { char: "!", color: "text-candy" },
];

export function Navbar() {
  const soundEnabled = useGameStore((s) => s.soundEnabled);
  const toggleSound = useGameStore((s) => s.toggleSound);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3"
      style={{
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "4px solid var(--color-sun)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
      }}
    >
      <Link href="/" className="flex items-center gap-2">
        <motion.span
          className="text-2xl"
          animate={{ rotate: [0, 14, 0, -14, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          role="img"
          aria-label="books"
        >
          📚
        </motion.span>
        <span className="font-display text-2xl font-bold flex">
          {logoLetters.map((l, i) => (
            <motion.span
              key={i}
              className={l.color}
              whileHover={{ scale: 1.2, rotate: [-5, 5, 0] }}
            >
              {l.char}
            </motion.span>
          ))}
        </span>
      </Link>

      <div className="flex items-center gap-4">
        <StarCounter />
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={toggleSound}
          className="text-2xl p-2 rounded-button bg-sun/20 hover:bg-sun/40 transition-colors min-w-[48px] min-h-[48px] flex items-center justify-center"
          aria-label={soundEnabled ? "Mute sounds" : "Unmute sounds"}
        >
          {soundEnabled ? "🔊" : "🔇"}
        </motion.button>
      </div>
    </nav>
  );
}
