# Project Setup Prompt: FunWords! — Kids English Learning Platform

## Overview

Set up a Next.js project for **FunWords!**, an interactive English learning web app for non-English-speaking children aged 5–10. The app should feel like a colorful, animated playground — every interaction should be rewarding, tactile, and fun. Think bright colors, bouncy animations, big tap targets, emoji-heavy UI, and celebration effects everywhere.

## Tech Stack

### Core
- **Next.js 15** (App Router, TypeScript)
- **React 19**
- **Tailwind CSS 4** with a custom kid-friendly theme

### Animation & Interaction
- **Framer Motion** (`motion`) — page transitions, layout animations, spring physics, gesture-based interactions (drag, tap, hover), staggered reveals, shared layout animations
- **GSAP** (`gsap`) — complex timeline animations, confetti/particle effects, scroll-triggered animations, number counters, celebration sequences
- **Lottie React** (`@lottiefiles/dotlottie-react`) — animated characters, success/failure feedback, loading states, decorative ambient animations
- **@dnd-kit** (`@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`) — drag-and-drop letter tiles, word ordering games, matching exercises, sentence building

### Audio
- **Howler.js** (`howler`) — pronunciation playback, UI sound effects (tap, success, failure, whoosh), background ambient sounds, reward jingles

### State Management
- **Zustand** — global game state: stars/points, current level, progress tracking, sound on/off toggle, user preferences

### Utilities
- **clsx** + **tailwind-merge** (`clsx`, `tailwind-merge`) — conditional class merging
- **usehooks-ts** — useful React hooks (useMediaQuery, useLocalStorage, useInterval)

## Project Structure

```
funwords/
├── app/
│   ├── layout.tsx                  # Root layout with fonts, providers, persistent UI
│   ├── page.tsx                    # Home/landing — animated hero, game selection grid
│   ├── games/
│   │   ├── matching/page.tsx       # Word-to-picture matching game
│   │   ├── spelling/page.tsx       # Spelling bee — tap letters to spell words
│   │   ├── word-builder/page.tsx   # Drag-and-drop sentence/word building
│   │   ├── alphabet/page.tsx       # Interactive alphabet with letter sounds & words
│   │   └── categories/page.tsx     # Learn words by category (animals, food, colors, etc.)
│   └── globals.css
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx              # Fixed top nav with logo, star counter, sound toggle
│   │   ├── PageTransition.tsx      # Framer Motion AnimatePresence wrapper for route transitions
│   │   └── BottomNav.tsx           # Mobile-friendly bottom navigation with game icons
│   ├── ui/
│   │   ├── BounceButton.tsx        # Reusable spring-animated button with tap sound
│   │   ├── StarCounter.tsx         # Animated star/points display with GSAP number pop
│   │   ├── ProgressBar.tsx         # Colorful segmented progress bar with fill animation
│   │   ├── Card.tsx                # Flip/reveal card component with Framer Motion
│   │   ├── Badge.tsx               # Achievement badges with unlock animation
│   │   ├── Toast.tsx               # Reward toast notification (slides in with emoji + message)
│   │   └── Modal.tsx               # Celebration modal for level completion
│   ├── game/
│   │   ├── MatchCard.tsx           # Tappable word/emoji card for matching game
│   │   ├── LetterBubble.tsx        # Alphabet bubble with pop animation
│   │   ├── LetterTile.tsx          # Draggable letter tile for spelling/word-builder (dnd-kit)
│   │   ├── DropZone.tsx            # Drop target for letter tiles (dnd-kit)
│   │   ├── WordSlot.tsx            # Individual letter slot in spelling game
│   │   └── CategoryCard.tsx        # Category selection card with icon and word count
│   ├── feedback/
│   │   ├── Confetti.tsx            # GSAP-powered confetti explosion on success
│   │   ├── LottieReward.tsx        # Lottie animation wrapper for success/stars/thumbs-up
│   │   ├── ShakeWrapper.tsx        # Wrapper that shakes children on wrong answer
│   │   └── SoundEffect.tsx         # Howler.js hook/component for playing sound effects
│   └── decorative/
│       ├── FloatingClouds.tsx      # Ambient floating cloud CSS animation
│       ├── AnimatedSun.tsx         # Pulsing sun with rays
│       ├── GrassFooter.tsx         # Decorative grass pattern at page bottom
│       └── BackgroundScene.tsx     # Composable sky/clouds/sun/grass background
├── hooks/
│   ├── useSound.ts                 # Howler.js wrapper hook — play(name), toggle mute
│   ├── useGameState.ts             # Zustand store hook — stars, progress, current game
│   ├── useConfetti.ts              # Trigger confetti from anywhere
│   └── usePronunciation.ts         # Text-to-speech / audio playback for word pronunciation
├── lib/
│   ├── sounds.ts                   # Sound registry — maps sound names to file paths
│   ├── words.ts                    # Word database — words, categories, difficulty levels, emoji mappings
│   ├── cn.ts                       # clsx + tailwind-merge utility
│   └── animations.ts               # Reusable Framer Motion variant presets (bounce, pop, shake, stagger, flip)
├── stores/
│   └── gameStore.ts                # Zustand store definition
├── public/
│   ├── sounds/
│   │   ├── tap.mp3
│   │   ├── success.mp3
│   │   ├── wrong.mp3
│   │   ├── whoosh.mp3
│   │   ├── pop.mp3
│   │   ├── confetti.mp3
│   │   └── star.mp3
│   ├── lotties/
│   │   ├── success-star.lottie
│   │   ├── thumbs-up.lottie
│   │   ├── confetti-burst.lottie
│   │   ├── loading-bounce.lottie
│   │   └── waving-character.lottie
│   └── images/
│       └── (placeholder for any static images)
├── tailwind.config.ts
├── tsconfig.json
├── next.config.ts
└── package.json
```

## Setup Tasks

### 1. Initialize project

```bash
npx create-next-app@latest funwords --typescript --tailwind --eslint --app --src=false --import-alias "@/*"
```

### 2. Install all dependencies

```bash
npm install framer-motion gsap @lottiefiles/dotlottie-react @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities howler zustand clsx tailwind-merge usehooks-ts
npm install -D @types/howler
```

### 3. Configure Tailwind theme

Extend the Tailwind config with this kid-friendly design system:

```ts
// tailwind.config.ts
import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary palette — bright, saturated, high contrast
        sun: { DEFAULT: "#FFD93D", dark: "#E6C235" },
        sky: { DEFAULT: "#6EC6FF", dark: "#4A90D9", light: "#B4E7FF" },
        grass: { DEFAULT: "#4ECB71", dark: "#3DA85D", light: "#C8F7C5" },
        candy: { DEFAULT: "#FF6B8A", dark: "#E55A76", light: "#FFE0E6" },
        ocean: { DEFAULT: "#4A90D9", dark: "#3A7BC4", light: "#E3F1FF" },
        orange: { DEFAULT: "#FF9F43", dark: "#E68A30", light: "#FFF0E0" },
        purple: { DEFAULT: "#A29BFE", dark: "#8B84E0", light: "#EDE8FF" },
        mint: { DEFAULT: "#55EFC4", dark: "#3DD4A7", light: "#E0FFF5" },
        coral: { DEFAULT: "#FF7675", dark: "#E06665", light: "#FFE5E5" },
        // Neutrals
        cream: "#FFF8F0",
        night: "#2D3436",
      },
      fontFamily: {
        // Display — big headings, game titles, scores
        display: ['"Baloo 2"', "cursive"],
        // Body — instructions, descriptions, general text
        body: ['"Comic Neue"', "cursive"],
        // Handwritten — hints, labels, friendly notes
        hand: ['"Patrick Hand"', "cursive"],
      },
      borderRadius: {
        bubble: "50%",
        card: "20px",
        button: "16px",
        section: "28px",
      },
      boxShadow: {
        "btn": "0 4px 0 rgba(0,0,0,0.15)",
        "btn-hover": "0 6px 0 rgba(0,0,0,0.15)",
        "btn-active": "0 2px 0 rgba(0,0,0,0.15)",
        "card": "0 8px 32px rgba(0,0,0,0.08)",
        "glow-yellow": "0 0 60px rgba(255, 217, 61, 0.4)",
        "glow-pink": "0 0 40px rgba(255, 107, 138, 0.3)",
        "glow-blue": "0 0 40px rgba(110, 198, 255, 0.3)",
      },
      animation: {
        "bounce-slow": "bounce 2s infinite",
        "float": "float 3s ease-in-out infinite",
        "wiggle": "wiggle 2s ease-in-out infinite",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        wiggle: {
          "0%, 100%": { transform: "rotate(-3deg)" },
          "50%": { transform: "rotate(3deg)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(255, 217, 61, 0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(255, 217, 61, 0.6)" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
```

### 4. Configure fonts in root layout

```tsx
// app/layout.tsx
import { Baloo_2, Comic_Neue, Patrick_Hand } from "next/font/google";

const baloo = Baloo_2({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "600", "700", "800"],
});

const comicNeue = Comic_Neue({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "700"],
});

const patrickHand = Patrick_Hand({
  subsets: ["latin"],
  variable: "--font-hand",
  weight: ["400"],
});
```

Apply `${baloo.variable} ${comicNeue.variable} ${patrickHand.variable}` to the `<body>` className.

### 5. Create the utility function

```ts
// lib/cn.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### 6. Create the Zustand store

```ts
// stores/gameStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface GameState {
  stars: number;
  soundEnabled: boolean;
  completedGames: string[];
  addStars: (n: number) => void;
  toggleSound: () => void;
  completeGame: (gameId: string) => void;
  reset: () => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      stars: 0,
      soundEnabled: true,
      completedGames: [],
      addStars: (n) => set((s) => ({ stars: s.stars + n })),
      toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
      completeGame: (id) =>
        set((s) => ({
          completedGames: s.completedGames.includes(id)
            ? s.completedGames
            : [...s.completedGames, id],
        })),
      reset: () => set({ stars: 0, completedGames: [] }),
    }),
    { name: "funwords-progress" }
  )
);
```

### 7. Create reusable Framer Motion animation variants

```ts
// lib/animations.ts
import type { Variants } from "framer-motion";

export const bounceIn: Variants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 400, damping: 15 },
  },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

export const slideUp: Variants = {
  hidden: { y: 40, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 20 },
  },
};

export const shake: Variants = {
  idle: { x: 0 },
  wrong: {
    x: [-10, 10, -8, 8, -4, 4, 0],
    transition: { duration: 0.4 },
  },
};

export const pop: Variants = {
  idle: { scale: 1 },
  tap: { scale: 0.92 },
  hover: { scale: 1.08 },
};

export const flipCard: Variants = {
  front: { rotateY: 0 },
  back: { rotateY: 180 },
};

export const pageTransition: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
};
```

### 8. Create the sound hook

```ts
// hooks/useSound.ts
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
```

### 9. Create the word database

```ts
// lib/words.ts
export interface WordEntry {
  word: string;
  emoji: string;
  category: string;
  difficulty: 1 | 2 | 3; // 1 = easy (3-4 letters), 2 = medium (5-6), 3 = hard (7+)
  hint: string;
}

export const words: WordEntry[] = [
  // Animals
  { word: "cat", emoji: "🐱", category: "animals", difficulty: 1, hint: "A furry pet that says meow" },
  { word: "dog", emoji: "🐕", category: "animals", difficulty: 1, hint: "A loyal friend that says woof" },
  { word: "fish", emoji: "🐟", category: "animals", difficulty: 1, hint: "It swims in the water" },
  { word: "bird", emoji: "🐦", category: "animals", difficulty: 1, hint: "It flies in the sky" },
  { word: "frog", emoji: "🐸", category: "animals", difficulty: 1, hint: "It jumps and says ribbit" },
  { word: "lion", emoji: "🦁", category: "animals", difficulty: 1, hint: "The king of the jungle" },
  { word: "bear", emoji: "🐻", category: "animals", difficulty: 1, hint: "A big furry animal" },
  { word: "turtle", emoji: "🐢", category: "animals", difficulty: 2, hint: "It carries its house on its back" },
  { word: "rabbit", emoji: "🐰", category: "animals", difficulty: 2, hint: "It has long ears and hops" },
  { word: "penguin", emoji: "🐧", category: "animals", difficulty: 2, hint: "A bird that cannot fly but swims" },
  { word: "dolphin", emoji: "🐬", category: "animals", difficulty: 2, hint: "A smart animal in the ocean" },
  { word: "elephant", emoji: "🐘", category: "animals", difficulty: 3, hint: "The biggest land animal" },
  { word: "butterfly", emoji: "🦋", category: "animals", difficulty: 3, hint: "It has colorful wings" },

  // Food
  { word: "apple", emoji: "🍎", category: "food", difficulty: 2, hint: "A red fruit" },
  { word: "cake", emoji: "🎂", category: "food", difficulty: 1, hint: "You eat it on your birthday" },
  { word: "pizza", emoji: "🍕", category: "food", difficulty: 2, hint: "Round and cheesy" },
  { word: "banana", emoji: "🍌", category: "food", difficulty: 2, hint: "A yellow fruit monkeys love" },
  { word: "cookie", emoji: "🍪", category: "food", difficulty: 2, hint: "A sweet round snack" },
  { word: "bread", emoji: "🍞", category: "food", difficulty: 2, hint: "You make sandwiches with it" },
  { word: "egg", emoji: "🥚", category: "food", difficulty: 1, hint: "Chickens lay these" },
  { word: "milk", emoji: "🥛", category: "food", difficulty: 1, hint: "A white drink from cows" },

  // Colors
  { word: "red", emoji: "🔴", category: "colors", difficulty: 1, hint: "The color of fire trucks" },
  { word: "blue", emoji: "🔵", category: "colors", difficulty: 1, hint: "The color of the sky" },
  { word: "green", emoji: "🟢", category: "colors", difficulty: 2, hint: "The color of grass" },
  { word: "yellow", emoji: "🟡", category: "colors", difficulty: 2, hint: "The color of the sun" },
  { word: "orange", emoji: "🟠", category: "colors", difficulty: 2, hint: "A color and a fruit" },
  { word: "purple", emoji: "🟣", category: "colors", difficulty: 2, hint: "Mix red and blue" },
  { word: "pink", emoji: "💗", category: "colors", difficulty: 1, hint: "A light red color" },

  // Body
  { word: "hand", emoji: "✋", category: "body", difficulty: 1, hint: "You wave with this" },
  { word: "eye", emoji: "👁️", category: "body", difficulty: 1, hint: "You see with these" },
  { word: "nose", emoji: "👃", category: "body", difficulty: 1, hint: "You smell with this" },
  { word: "ear", emoji: "👂", category: "body", difficulty: 1, hint: "You hear with these" },
  { word: "foot", emoji: "🦶", category: "body", difficulty: 1, hint: "You walk with these" },

  // Nature
  { word: "sun", emoji: "☀️", category: "nature", difficulty: 1, hint: "It shines bright in the sky" },
  { word: "moon", emoji: "🌙", category: "nature", difficulty: 1, hint: "You see it at night" },
  { word: "star", emoji: "⭐", category: "nature", difficulty: 1, hint: "It twinkles in the sky" },
  { word: "tree", emoji: "🌳", category: "nature", difficulty: 1, hint: "It has leaves and branches" },
  { word: "flower", emoji: "🌸", category: "nature", difficulty: 2, hint: "It smells nice and is colorful" },
  { word: "rain", emoji: "🌧️", category: "nature", difficulty: 1, hint: "Water falling from clouds" },
  { word: "rainbow", emoji: "🌈", category: "nature", difficulty: 3, hint: "Colorful arc after rain" },
  { word: "cloud", emoji: "☁️", category: "nature", difficulty: 2, hint: "White and fluffy in the sky" },

  // Objects
  { word: "ball", emoji: "⚽", category: "objects", difficulty: 1, hint: "You kick or throw it" },
  { word: "book", emoji: "📖", category: "objects", difficulty: 1, hint: "You read stories in it" },
  { word: "house", emoji: "🏠", category: "objects", difficulty: 2, hint: "You live in one" },
  { word: "car", emoji: "🚗", category: "objects", difficulty: 1, hint: "It has four wheels" },
  { word: "boat", emoji: "⛵", category: "objects", difficulty: 1, hint: "It floats on water" },
  { word: "clock", emoji: "🕐", category: "objects", difficulty: 2, hint: "It tells you the time" },
  { word: "phone", emoji: "📱", category: "objects", difficulty: 2, hint: "You call people with it" },
  { word: "umbrella", emoji: "☂️", category: "objects", difficulty: 3, hint: "Keeps you dry in the rain" },
];

export const categories = [
  { id: "animals", name: "Animals", emoji: "🐾", color: "candy" },
  { id: "food", name: "Food", emoji: "🍎", color: "orange" },
  { id: "colors", name: "Colors", emoji: "🎨", color: "purple" },
  { id: "body", name: "My Body", emoji: "🧍", color: "sky" },
  { id: "nature", name: "Nature", emoji: "🌿", color: "grass" },
  { id: "objects", name: "Things", emoji: "📦", color: "sun" },
] as const;

export function getWordsByCategory(category: string) {
  return words.filter((w) => w.category === category);
}

export function getWordsByDifficulty(difficulty: 1 | 2 | 3) {
  return words.filter((w) => w.difficulty === difficulty);
}
```

### 10. Create placeholder audio and Lottie files

Create empty placeholder files so imports don't break during development. For sounds, generate simple placeholder MP3 files or download free sound effects from freesound.org or mixkit.co. For Lottie animations, download free .lottie files from lottiefiles.com — search for: "success star", "thumbs up", "confetti", "loading bounce", "waving character". Place them in the corresponding `public/` directories.

### 11. Set up the root layout with all providers

The root layout should:
- Apply all three font CSS variables to `<body>`
- Set a default background gradient (sky blue → light blue → cream → light green)
- Include the `Navbar` component with the logo and star counter
- Wrap page content in `AnimatePresence` from Framer Motion for route transitions
- Set appropriate meta tags (viewport for mobile, theme-color, title)

### 12. Create a basic home page

The home page should show:
- An animated hero section with the FunWords! logo (each letter a different color, animated)
- A row of bouncing emoji characters
- A grid of 5 game cards (matching, spelling, word builder, alphabet, categories) — each card has an emoji icon, game name, and a short description. Cards should stagger-animate in on load and have a spring hover effect.

## Design Guidelines

- **Minimum tap target**: 48x48px — these are small fingers
- **Font sizes**: body 18px+, headings 28px+, game text 24px+
- **Border radius**: generous everywhere — 16px+ on cards, full round on bubbles/buttons
- **Buttons**: always have a visible box-shadow "depth" (3D press effect), active state pushes down
- **Colors**: use the bright palette defined in Tailwind — never use gray or muted tones for interactive elements
- **Feedback**: EVERY tap/interaction should have visual feedback (scale, color change, sound). Correct = green + confetti + sound. Wrong = red + shake + sound.
- **Animations**: use spring physics (Framer Motion `type: "spring"`) for anything the child interacts with. Use CSS animations for ambient/decorative elements (clouds, sun, floating).
- **Rewards**: Stars are the currency. Award 1 star per correct answer, 3–5 bonus stars for completing a game. Show confetti on game completion.
- **Accessibility**: all interactive elements must be keyboard accessible and have visible focus states. Use semantic HTML. Images/emoji should have alt text.

## Summary of What to Create

After running these setup steps, the project should:
1. Build and run with `npm run dev` with zero errors
2. Have all dependencies installed and configured
3. Have the Tailwind theme with the full kid-friendly color/font/animation system
4. Have the Zustand store, sound hook, animation variants, cn utility, and word database all ready to import
5. Have the complete folder structure with placeholder files for all components
6. Have a working home page with the animated hero and game selection grid
7. Have route stubs for all 5 game pages (can be empty with just a heading)

Do NOT build out the full game logic yet — just set up the foundation so we can build each game incrementally.