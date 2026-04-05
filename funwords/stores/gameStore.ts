import { create } from "zustand";
import { persist } from "zustand/middleware";

interface GameState {
  stars: number;
  soundEnabled: boolean;
  completedGames: string[];
  streakDays: number;
  lastPlayedDate: string;
  addStars: (n: number) => void;
  toggleSound: () => void;
  completeGame: (gameId: string) => void;
  updateStreak: () => void;
  reset: () => void;
}

function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

function getYesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
}

export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      stars: 0,
      soundEnabled: true,
      completedGames: [],
      streakDays: 0,
      lastPlayedDate: "",
      addStars: (n) => set((s) => ({ stars: s.stars + n })),
      toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
      completeGame: (id) =>
        set((s) => ({
          completedGames: s.completedGames.includes(id)
            ? s.completedGames
            : [...s.completedGames, id],
        })),
      updateStreak: () =>
        set((s) => {
          const today = getToday();
          const yesterday = getYesterday();

          if (s.lastPlayedDate === today) {
            return s;
          }

          if (s.lastPlayedDate === yesterday) {
            return { streakDays: s.streakDays + 1, lastPlayedDate: today };
          }

          return { streakDays: 1, lastPlayedDate: today };
        }),
      reset: () =>
        set({ stars: 0, completedGames: [], streakDays: 0, lastPlayedDate: "" }),
    }),
    { name: "funwords-progress" }
  )
);
