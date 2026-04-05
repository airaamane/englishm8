"use client";

import { useEffect, useRef } from "react";
import { useGameStore } from "@/stores/gameStore";
import gsap from "gsap";

export function StarCounter() {
  const stars = useGameStore((s) => s.stars);
  const displayRef = useRef<HTMLSpanElement>(null);
  const prevStars = useRef(stars);

  useEffect(() => {
    if (displayRef.current && prevStars.current !== stars) {
      gsap.fromTo(
        displayRef.current,
        { scale: 1.4 },
        { scale: 1, duration: 0.4, ease: "elastic.out(1, 0.3)" }
      );
      prevStars.current = stars;
    }
  }, [stars]);

  return (
    <div className="flex items-center gap-1.5 bg-sun/20 px-3 py-1.5 rounded-full">
      <span className="text-xl" role="img" aria-label="stars">⭐</span>
      <span ref={displayRef} className="font-display font-bold text-lg text-night">
        {stars}
      </span>
    </div>
  );
}
