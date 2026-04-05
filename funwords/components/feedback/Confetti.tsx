"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

interface ConfettiProps {
  trigger: boolean;
}

export function Confetti({ trigger }: ConfettiProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!trigger || !containerRef.current) return;
    const container = containerRef.current;
    const colors = ["#FFD93D", "#FF6B8A", "#4ECB71", "#6EC6FF", "#A29BFE", "#FF9F43"];

    for (let i = 0; i < 40; i++) {
      const dot = document.createElement("div");
      dot.style.position = "absolute";
      dot.style.width = `${8 + Math.random() * 8}px`;
      dot.style.height = `${8 + Math.random() * 8}px`;
      dot.style.borderRadius = Math.random() > 0.5 ? "50%" : "2px";
      dot.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      dot.style.pointerEvents = "none";
      container.appendChild(dot);

      gsap.set(dot, { x: "50%", y: "50%" });
      gsap.to(dot, {
        x: `${50 + (Math.random() - 0.5) * 100}%`,
        y: `${(Math.random() - 0.5) * 100}%`,
        rotation: Math.random() * 720,
        opacity: 0,
        scale: Math.random() * 2 + 0.5,
        duration: 1 + Math.random() * 0.5,
        ease: "power2.out",
        onComplete: () => dot.remove(),
      });
    }
  }, [trigger]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-[100] overflow-hidden"
      aria-hidden="true"
    />
  );
}
