"use client";

import { useGameStore } from "@/stores/gameStore";

export function useGameState() {
  const stars = useGameStore((s) => s.stars);
  const soundEnabled = useGameStore((s) => s.soundEnabled);
  const completedGames = useGameStore((s) => s.completedGames);
  const addStars = useGameStore((s) => s.addStars);
  const toggleSound = useGameStore((s) => s.toggleSound);
  const completeGame = useGameStore((s) => s.completeGame);
  const reset = useGameStore((s) => s.reset);

  return {
    stars,
    soundEnabled,
    completedGames,
    addStars,
    toggleSound,
    completeGame,
    reset,
  };
}
