"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

const navItems = [
  { href: "/games/tracing", label: "Trace", emoji: "✍️", activeColor: "bg-mint/30", dotColor: "bg-mint" },
  { href: "/games/alphabet", label: "ABC", emoji: "🔤", activeColor: "bg-grass-light", dotColor: "bg-grass" },
  { href: "/games/matching", label: "Match", emoji: "🎯", activeColor: "bg-candy-light", dotColor: "bg-candy" },
  { href: "/games/spelling", label: "Spell", emoji: "🐝", activeColor: "bg-sun/20", dotColor: "bg-sun-dark" },
  { href: "/games/numbers", label: "Numbers", emoji: "🔢", activeColor: "bg-sky-light", dotColor: "bg-sky" },
  { href: "/games/categories", label: "Explore", emoji: "🗺️", activeColor: "bg-purple-light", dotColor: "bg-purple" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-2 py-2">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 min-w-[48px] min-h-[48px] justify-center rounded-button px-2 py-1 transition-colors",
                isActive ? item.activeColor : "hover:bg-cream"
              )}
            >
              <motion.span
                className="text-xl"
                whileTap={{ scale: 0.85 }}
                animate={isActive ? { scale: [1, 1.2, 1] } : {}}
              >
                {item.emoji}
              </motion.span>
              <span
                className={cn(
                  "text-xs font-body font-bold",
                  isActive ? "text-night" : "text-night/60"
                )}
              >
                {item.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="bottomNavDot"
                  className={cn("w-1.5 h-1.5 rounded-full", item.dotColor)}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
