"use client";

import { useCallback, useRef } from "react";
import { Howl } from "howler";
import { useGameStore } from "@/stores/gameStore";

const soundMap: Record<string, string> = {
  tap: "/sounds/tap.mp3",
  success: "/sounds/success.mp3",
  wrong: "/sounds/wrong.mp3",
  whoosh: "/sounds/whoosh.mp3",
  pop: "/sounds/pop.mp3",
  confetti: "/sounds/confetti.mp3",
  star: "/sounds/star.mp3",
};

export function useSound() {
  const soundEnabled = useGameStore((s) => s.soundEnabled);
  const cache = useRef<Record<string, Howl>>({});

  const play = useCallback(
    (name: keyof typeof soundMap) => {
      if (!soundEnabled) return;
      if (!cache.current[name]) {
        cache.current[name] = new Howl({ src: [soundMap[name]], volume: 0.6 });
      }
      cache.current[name].play();
    },
    [soundEnabled]
  );

  return { play };
}
