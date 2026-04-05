"use client";

import { useCallback, useRef } from "react";
import gsap from "gsap";

export function useConfetti() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const fire = useCallback(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const colors = ["#FFD93D", "#FF6B8A", "#4ECB71", "#6EC6FF", "#A29BFE", "#FF9F43"];

    for (let i = 0; i < 30; i++) {
      const dot = document.createElement("div");
      dot.style.position = "fixed";
      dot.style.width = "10px";
      dot.style.height = "10px";
      dot.style.borderRadius = "50%";
      dot.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      dot.style.pointerEvents = "none";
      dot.style.zIndex = "9999";
      container.appendChild(dot);

      gsap.set(dot, {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      });

      gsap.to(dot, {
        x: window.innerWidth / 2 + (Math.random() - 0.5) * 600,
        y: window.innerHeight / 2 + (Math.random() - 0.5) * 600,
        opacity: 0,
        scale: Math.random() * 2 + 0.5,
        duration: 1 + Math.random(),
        ease: "power2.out",
        onComplete: () => dot.remove(),
      });
    }
  }, []);

  return { containerRef, fire };
}
