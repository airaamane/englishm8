# FunWords! MVP Specification

## Product Overview

**FunWords!** is an interactive English learning web app for non-English-speaking children aged 5–10. The MVP consists of 5 game screens plus a home dashboard, built on a shared reward and feedback system. Every interaction is designed to be tactile, rewarding, and zero-friction — no login, no onboarding, no settings maze.

**Target user:** A child aged 5–10 whose first language is not English, likely using a parent's phone or tablet. They may not be able to read instructions, so the UI must be self-explanatory through visuals, audio, and animation.

**Core learning loop:** See a word → hear it spoken → associate it with a picture → practice spelling it → earn stars → repeat.

---

## Screen Map

```
┌─────────────────────────────────────┐
│          HOME DASHBOARD             │
│  Avatar · Stars · Streak · Progress │
│                                     │
│  ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐    │
│  │ABC│ │🎯 │ │🐝 │ │123│ │🗺️ │    │
│  └───┘ └───┘ └───┘ └───┘ └───┘    │
└──┬───────┬───────┬───────┬───────┬──┘
   │       │       │       │       │
   ▼       ▼       ▼       ▼       ▼
Screen1  Screen2  Screen3  Screen4  Screen5
ABC      Match    Spell    Numbers  Explorer
```

---

## Screen 1: ABC Alphabet

**Route:** `/games/alphabet`

**Purpose:** Learn the 26 English letters, their sounds, and a starter word for each.

### Layout

- Top: progress indicator showing how many letters the child has tapped this session (e.g., "12 / 26")
- Center: a grid of 26 circular letter bubbles arranged in rows (7-7-7-5 or responsive wrap)
- Bottom: word display area that appears when a letter is tapped

### Letter Bubbles

- Each bubble is 62–70px diameter on desktop, 50–56px on mobile
- Each letter gets a distinct background color cycling through the kid palette (candy, ocean, grass, orange, purple, mint, coral, sun, sky)
- The letter is displayed in `font-display` (Baloo 2), 800 weight, white text with subtle text shadow
- Bubbles have a 3D press effect: `box-shadow: 0 4px 0 rgba(0,0,0,0.15)` resting, `0 2px 0` on active
- Hover: scale(1.15) with spring transition
- Active/tap: scale(0.92) then spring back

### Tap Interaction

When a child taps a letter:

1. **Sound:** Play the phonetic sound of the letter via Howler.js (e.g., `/sounds/letters/a.mp3`)
2. **Animation:** The bubble does a Framer Motion spring pop (scale 1 → 1.3 → 1)
3. **Word display:** Below the grid, animate in (slide up + fade) a word card showing:
   - The emoji large (3rem): 🍎
   - The word in display font (2rem): **Apple**
   - The letter highlighted: **A** is for **A**pple
   - A small speaker icon button — tap to hear the word spoken via Web Speech API (`speechSynthesis`)
4. **Lottie:** Play a small success Lottie (star burst or sparkle) near the tapped bubble
5. **Stars:** Award 1 star, animate the star counter in the navbar

### Completion

When all 26 letters have been tapped at least once:
- Confetti burst (GSAP particle system)
- Lottie celebration animation (full screen, 2 seconds)
- Toast: "🎉 You learned all the letters!"
- Award 5 bonus stars
- Show a "Play Again" button that resets the session

### Word Data

Each letter maps to one word:

| Letter | Word | Emoji |
|--------|------|-------|
| A | Apple | 🍎 |
| B | Bear | 🐻 |
| C | Cat | 🐱 |
| D | Dog | 🐕 |
| E | Elephant | 🐘 |
| F | Frog | 🐸 |
| G | Grapes | 🍇 |
| H | House | 🏠 |
| I | Ice Cream | 🍦 |
| J | Jellyfish | 🪼 |
| K | Kite | 🪁 |
| L | Lion | 🦁 |
| M | Moon | 🌙 |
| N | Nest | 🪺 |
| O | Octopus | 🐙 |
| P | Penguin | 🐧 |
| Q | Queen | 👑 |
| R | Rainbow | 🌈 |
| S | Sunflower | 🌻 |
| T | Tiger | 🐯 |
| U | Umbrella | ☂️ |
| V | Violin | 🎻 |
| W | Whale | 🐋 |
| X | Xylophone | 🎶 |
| Y | Yarn | 🧶 |
| Z | Zebra | 🦓 |

---

## Screen 2: Match Words

**Route:** `/games/matching`

**Purpose:** Build word-to-picture association by matching English words to their emoji representations.

### Layout

- Top: level indicator ("Level 1 — 4 pairs") + progress bar
- Center: two columns side by side
  - Left column: English word cards
  - Right column: emoji picture cards (shuffled order)
- Bottom: "Next Level" button (appears after completing a level)

### Levels

| Level | Pairs | Words |
|-------|-------|-------|
| 1 | 4 | cat, sun, fish, star |
| 2 | 4 | dog, cake, tree, ball |
| 3 | 6 | apple, bird, moon, frog, book, car |
| 4 | 6 | bear, flower, rain, hand, milk, boat |
| 5 | 8 | turtle, banana, cloud, cookie, phone, rabbit, eye, clock |

Words are drawn from `lib/words.ts`. Emoji column is always shuffled randomly.

### Card Design

**Word cards (left column):**
- Background: light pink gradient (`candy-light` to white)
- Border: 3px solid `candy`
- Text: `font-display`, 700 weight, `candy` color, 1.3rem
- Box shadow: `0 4px 0` candy-dark (3D depth)
- Border radius: 18px
- Padding: 14px 20px
- Min height: 52px (for tap target)

**Emoji cards (right column):**
- Background: light blue gradient (`ocean-light` to white)
- Border: 3px solid `ocean`
- Emoji: 2rem centered
- Same shadow and radius as word cards

### Interaction Flow

1. **Tap a word card** → it gets a `selected` state: scale(1.06), yellow ring glow (`0 0 0 4px sun`), slight lift
2. **Tap an emoji card** → check for match:
   - **Correct match:**
     - Both cards transition to green (grass-light bg, grass border)
     - Framer Motion `correctPop` animation: scale 1 → 1.2 → 1
     - Play `success.mp3`
     - Award 1 star
     - Cards become non-interactive (pointer-events: none, slight opacity)
     - Show toast: "✅ Cat = 🐱" (word = emoji)
   - **Wrong match:**
     - Both cards do `shake` animation (Framer Motion variant): x [-10, 10, -8, 8, -4, 4, 0] over 400ms
     - Play `wrong.mp3`
     - Both deselect after 500ms
     - No star penalty (never punish wrong answers for kids)
3. **Tap a second word card** while one is already selected → deselect the first, select the new one
4. **All pairs matched:**
   - 1 second delay
   - Confetti burst
   - Award 3 bonus stars
   - If more levels remain: show "Next Level ➡️" button with bounce animation
   - If final level: full celebration with Lottie, toast "🏆 Matching Champion!", award 5 bonus stars

### Important UX Rules

- The child can tap in any order — word first or emoji first, either works
- Never show a "wrong" counter or negative score
- Shuffled emoji order must never accidentally align with the word order (re-shuffle if it does)
- On mobile, if the screen is narrow, stack columns vertically with a divider emoji row between them

---

## Screen 3: Spelling Bee

**Route:** `/games/spelling`

**Purpose:** Practice spelling English words by dragging letter tiles into the correct order.

### Layout

- Top: level indicator + progress bar (e.g., "Word 3 of 8")
- Center top: large emoji (5rem) floating animation + hint text below
- Center middle: letter slots (empty dashed boxes in a row)
- Center bottom: scrambled letter tiles (draggable)
- Bottom: "Skip" button (small, de-emphasized)

### Difficulty Tiers

| Tier | Word Length | Example Words | Extra Letters |
|------|-----------|---------------|---------------|
| Easy | 3 letters | cat, dog, sun, red, egg | +2 distractors |
| Medium | 4-5 letters | fish, bird, frog, apple, green | +2 distractors |
| Hard | 6+ letters | banana, turtle, rabbit, flower, cookie | +3 distractors |

The child starts on Easy. After completing all words in a tier, they unlock the next tier. Each tier has 8 words drawn from `lib/words.ts`.

### Letter Slots

- Each slot is 52×60px (desktop) or 42×50px (mobile)
- Border: 3px dashed `#ddd` (empty state)
- Border radius: 14px
- Background: `#fafafa`
- When a letter is placed: border becomes solid `sky`, background becomes `ocean-light`, letter appears with `slotFill` animation (scale 0.8 → 1)
- When the full word is correct: all slots transition to `grass` border and `grass-light` background

### Letter Tiles (Draggable)

- Each tile is 50×54px (desktop) or 42×46px (mobile)
- Border: 3px solid `purple`
- Background: `purple-light`
- Text: `font-display`, 700 weight, `purple` color, 1.5rem
- Box shadow: `0 4px 0 purple-dark`
- **Drag behavior (dnd-kit):**
  - `DragOverlay` shows the tile following the finger/cursor at scale(1.1) with a slight rotation (3deg)
  - Drop zones are the letter slots
  - On successful drop into the correct next slot: tile snaps into place with spring animation
  - On drop into wrong slot or release outside: tile springs back to its original position with `wrong` shake animation
- **Tap fallback:** If the child taps (not drags) a tile, it auto-fills the next empty slot. This is critical for younger children who may struggle with drag-and-drop.

### Interaction Flow

1. Child sees emoji + hint (e.g., 🐱 "A furry pet that says meow!")
2. Letter tiles are scrambled below (correct letters + distractor letters)
3. Child drags or taps letters into slots left-to-right
4. **Correct letter placement:**
   - Tile snaps into slot
   - Play `pop.mp3`
   - Tile source position becomes empty/disabled (opacity 0.3, non-interactive)
5. **Wrong letter:**
   - Tile bounces back
   - Slot briefly flashes red (200ms)
   - Play `wrong.mp3`
   - No penalty
6. **Word complete:**
   - All slots glow green
   - Play `success.mp3`
   - Word is spoken aloud via Web Speech API
   - Award 2 stars
   - 1.5 second pause, then auto-advance to next word
7. **Tier complete:**
   - Confetti
   - Lottie celebration
   - Award 5 bonus stars
   - "Next Level 🐝" button or "You finished! 🏆" if all tiers done

### Skip Behavior

- "Skip" button at the bottom, styled as a subtle text link (not a big button — don't encourage skipping)
- Tapping skip reveals the answer: letters fill in one by one with a quick cascade animation
- The word is spoken aloud
- No stars awarded
- Auto-advance after 2 seconds

---

## Screen 4: Numbers 1-20

**Route:** `/games/numbers`

**Purpose:** Learn English number words (one through twenty) by counting objects and hearing the numbers spoken.

### Layout

- Top: progress bar (e.g., "Round 5 of 15")
- Center top: a cluster of emoji objects displayed on screen (e.g., 4 bananas)
- Center: the question in large text — "How many?" with a speaker icon (tap to hear "How many bananas?")
- Center bottom: a row of number bubbles (answer choices)
- Bottom: the English word for the correct number appears after answering (e.g., "Four")

### Round Generation

Each round:
1. Pick a random number between 1 and 20
2. Pick a random emoji from a set: 🍎🍌🐟⭐🌸🐱🐕🌳⚽📖
3. Display that many emojis scattered in a playful cluster (not a grid — slight random offsets for a natural, spilled-on-table feel)
4. Generate 4 answer choices: the correct number + 3 distractors (within ±3 of the correct answer, clamped to 1-20, no duplicates)
5. Shuffle the answer choices

15 rounds per session. Numbers are selected to ensure coverage — don't repeat the same number until all 1-20 have appeared at least once across sessions (tracked in Zustand).

### Emoji Cluster Display

- Each emoji is 2.5rem with a slight random rotation (-15deg to +15deg) and random offset (-8px to +8px)
- They should be contained in a ~300×200px area, centered
- For numbers 1-5: spread loosely
- For numbers 6-10: medium density
- For numbers 11-20: tighter packing
- Each emoji has a subtle entry animation (Framer Motion stagger: pop in one by one over 0.5-1s)

### Number Bubbles (Answer Choices)

- 4 circular bubbles, 64px diameter, arranged in a horizontal row
- Each shows a numeral (1-20) in `font-display`, 800 weight, 1.8rem
- Colors cycle through the kid palette
- Same 3D shadow and spring hover as alphabet bubbles

### Interaction Flow

1. Emojis stagger in, question appears with audio prompt: "How many [object]s?"
2. Child taps a number bubble:
   - **Correct:**
     - Bubble turns green, pops
     - All emojis do a celebration wiggle
     - Play `success.mp3`
     - Below the cluster, animate in the English word: "Four" in `font-display` 2rem with Framer Motion bounceIn
     - The word is spoken aloud
     - Award 1 star
     - 1.5s pause, then auto-advance
   - **Wrong:**
     - Tapped bubble shakes and briefly turns red
     - Play `wrong.mp3`
     - The wrong bubble becomes disabled (opacity 0.4)
     - The child can try again (remaining bubbles stay active)
     - Second wrong attempt: auto-reveal the correct answer (correct bubble pulses green, word appears, spoken aloud, no stars)
3. **Session complete (15 rounds):**
   - Confetti
   - Lottie celebration
   - Summary: "You learned X number words!"
   - Award 5 bonus stars

### Audio

Every number (1-20) should have:
- A pronunciation audio file, OR
- Web Speech API synthesis: `speechSynthesis.speak(new SpeechSynthesisUtterance("four"))`

The question prompt "How many [object]s?" is also spoken aloud when the round starts and when the speaker icon is tapped.

---

## Screen 5: Word Explorer (Categories)

**Route:** `/games/categories`

**Purpose:** Free-play vocabulary exploration organized by topic. No right/wrong, just discovery and repetition.

### Layout

- Top: category selector (horizontal scrollable row of category pills)
- Center: a grid of flip cards for the selected category
- Bottom: "I learned X words!" counter for this session

### Category Pills

| Category | Emoji | Color | Word Count |
|----------|-------|-------|------------|
| Animals | 🐾 | candy | 13 |
| Food | 🍎 | orange | 8 |
| Colors | 🎨 | purple | 7 |
| My Body | 🧍 | sky | 5 |
| Nature | 🌿 | grass | 8 |
| Things | 📦 | sun | 8 |

- Each pill: rounded full (border-radius: 30px), padding 8px 20px
- Active pill: filled with its category color, white text
- Inactive pill: white bg, colored border and text
- Tap a pill: Framer Motion layout animation transitions the active state
- The word count badge sits on the pill as a small circle

### Flip Cards

- Arranged in a responsive grid: 2 columns on mobile, 3-4 on desktop
- Each card is ~140×160px
- **Front (initial state):** shows a "?" in the center with the category color as background, slight wobble animation to invite tapping
- **Back (revealed):** flips with a 3D rotateY Framer Motion animation to show:
  - Emoji (2.5rem, centered top)
  - English word below (`font-display`, 1.4rem, 700 weight)
  - Small speaker button at the bottom (tap to hear pronunciation)
- Cards stay revealed once flipped — the child can flip them back by tapping again
- Each card flip plays `whoosh.mp3`
- First time a card is revealed: award 1 star

### Interaction Flow

1. Child opens the screen — Animals category is selected by default
2. Grid shows face-down cards with "?" — cards stagger in with Framer Motion
3. Child taps cards to reveal words
4. Child taps the speaker icon on a revealed card to hear pronunciation
5. Child can switch categories at any time via the pills
6. Previously revealed cards in a category stay revealed (tracked in component state per session)
7. **Category complete (all cards revealed):**
   - Subtle celebration: confetti burst + toast "🐾 You discovered all the animals!"
   - Award 3 bonus stars
   - No forced progression — child can keep tapping speaker icons to practice

### No Wrong Answers

This screen has no wrong answers, no scoring pressure, no timers. It's designed for free exploration. The only gamification is the star reward for discovering new words and the per-category completion celebration.

---

## Shared Systems

These systems run across all screens and are initialized in the root layout.

### 1. Navigation Bar

**Component:** `Navbar.tsx`
**Position:** Fixed top, z-index 100

Contents (left to right):
- **Logo:** "FunWords!" with each letter a different color from the palette, `font-display` 800 weight. Preceded by a 📚 emoji with a subtle wave animation (`rotate(-15deg)` to `rotate(15deg)`, 2s loop).
- **Star counter:** Yellow pill badge (`sun` bg), shows ⭐ icon + current star count. When stars are added, the count does a GSAP scale pop (1 → 1.6 → 1, elastic ease).
- **Sound toggle:** A 🔊 / 🔇 button that toggles global sound on/off via Zustand.

Styling:
- Background: `rgba(255, 255, 255, 0.85)` with `backdrop-filter: blur(12px)`
- Bottom border: 4px solid `sun`
- Box shadow: `0 4px 20px rgba(0,0,0,0.08)`
- Height: ~56px

### 2. Bottom Navigation (Mobile)

**Component:** `BottomNav.tsx`
**Position:** Fixed bottom, visible only on screens < 768px

5 icon buttons in a row, one per game:
- 🔤 ABC
- 🎯 Match
- 🐝 Spell
- 🔢 Numbers
- 🗺️ Explore

Active tab uses the game's theme color for the icon + a small dot indicator below. Inactive tabs are gray. Tap any tab to navigate to that game with a page transition.

### 3. Page Transitions

**Component:** `PageTransition.tsx`

Wrap the `{children}` in the root layout with Framer Motion `AnimatePresence`:
- **Enter:** opacity 0 → 1, y 20 → 0, duration 400ms, ease out
- **Exit:** opacity 1 → 0, y 0 → -20, duration 200ms
- Mode: `wait` (old page exits before new enters)

### 4. Star / Reward System

**Store:** `gameStore.ts` (Zustand with `persist` middleware → localStorage)

State shape:
```
{
  stars: number,              // Total accumulated stars
  soundEnabled: boolean,      // Global sound toggle
  completedGames: string[],   // IDs of completed game levels
  streakDays: number,         // Consecutive days the app was opened
  lastPlayedDate: string,     // ISO date string
}
```

Star award rules:
| Action | Stars |
|--------|-------|
| Correct answer (any game) | 1 |
| Complete a spelling word | 2 |
| Complete a game level | 3 |
| Complete all levels of a game | 5 |
| Discover a new word (explorer) | 1 |
| Complete a category (explorer) | 3 |
| First time opening the app | 5 |

Stars are never deducted. Wrong answers cost 0 stars. This is deliberate — negative reinforcement damages motivation in young learners.

### 5. Confetti System

**Component:** `Confetti.tsx`
**Hook:** `useConfetti.ts`

Triggered on: game level completion, game full completion, and category completion in explorer.

Implementation: GSAP-powered particle system
- 40 confetti pieces with random colors from the kid palette
- Random shapes: circles (50%) and squares (50%)
- Random sizes: 8-18px
- Fall from top of viewport with gravity + random horizontal drift
- Duration: 2 seconds
- Staggered start: random delay 0-600ms per piece
- Clean up DOM elements after animation completes

The `useConfetti` hook exposes a `fire()` function that can be called from any component.

### 6. Toast Notifications

**Component:** `Toast.tsx`

A notification that slides in from the top center of the screen:
- Background: white, border-radius 20px, box-shadow
- Border: 3px solid `grass` (for success) or `sky` (for info)
- Content: emoji + short message in `font-display` 700 weight
- Entry: translateY(-120px) → translateY(0) with spring ease
- Auto-dismiss after 2 seconds
- Only one toast at a time — new toasts replace the current one

### 7. Lottie Feedback Animations

**Component:** `LottieReward.tsx`

Used for:
- **Success star burst:** plays when a game level is completed, positioned center screen, 200×200px, plays once then unmounts
- **Thumbs up:** plays on correct match or correct spelling, positioned near the interaction, 80×80px
- **Confetti burst:** alternative to the GSAP confetti for lighter celebrations
- **Try again:** a gentle encouraging animation (waving character) when the child gets something wrong, positioned bottom center

Source: free .lottie files from lottiefiles.com, placed in `public/lotties/`.

### 8. Sound System

**Hook:** `useSound.ts`

Sound map:
| Name | File | Used For |
|------|------|----------|
| tap | `/sounds/tap.mp3` | Any button/card tap |
| success | `/sounds/success.mp3` | Correct answer |
| wrong | `/sounds/wrong.mp3` | Wrong answer |
| whoosh | `/sounds/whoosh.mp3` | Card flip, page transition |
| pop | `/sounds/pop.mp3` | Bubble pop, letter placement |
| confetti | `/sounds/confetti.mp3` | Celebration moment |
| star | `/sounds/star.mp3` | Star awarded |

All sounds are short (< 1 second) and child-friendly (no harsh tones).
Volume: 0.6 (not full blast — parents will thank us).
Respects the global `soundEnabled` toggle from Zustand.

### 9. Pronunciation System

**Hook:** `usePronunciation.ts`

Two modes:
1. **Pre-recorded audio** (preferred): MP3 files in `/sounds/words/[word].mp3` — clearer and more consistent
2. **Web Speech API fallback**: `speechSynthesis.speak()` with `lang: "en-US"`, `rate: 0.85` (slightly slower for learners)

The hook exposes: `speak(word: string)` — checks for a pre-recorded file first, falls back to synthesis.

Used on:
- Letter tap (alphabet screen)
- Correct match reveal
- Word completion (spelling screen)
- Correct number answer
- Speaker icon tap (explorer screen)

### 10. Background Scene

**Component:** `BackgroundScene.tsx`

A decorative background rendered behind all content:
- **Sky gradient:** `#87CEEB` (top) → `#B4E7FF` → `#E8F8FF` → `#C8F7C5` → `#8BC34A` (bottom)
- **Floating clouds:** 3 CSS-animated cloud shapes floating left-to-right at different speeds (25s, 30s, 35s). Pure CSS — no JS.
- **Sun:** Fixed top-right, 90px yellow circle with pulsing box-shadow glow and 8 animated rays. Contains a 😊 emoji face.
- **Grass footer:** Fixed bottom, 40px tall, repeating green gradient pattern.

All decorative elements are `pointer-events: none` and low z-index so they never interfere with game interactions.

---

## Design Tokens (Quick Reference)

### Colors
| Token | Hex | Usage |
|-------|-----|-------|
| sun | #FFD93D | Star counter, highlights, sunny elements |
| sky | #6EC6FF | Filled letter slots, info states |
| grass | #4ECB71 | Correct states, success feedback |
| candy | #FF6B8A | Word cards, animals category |
| ocean | #4A90D9 | Emoji cards, headings |
| orange | #FF9F43 | Food category, warm accents |
| purple | #A29BFE | Letter tiles, colors category |
| mint | #55EFC4 | Fresh accents, tertiary elements |
| coral | #FF7675 | Wrong states (brief), nature category |
| cream | #FFF8F0 | Page backgrounds, card fills |
| night | #2D3436 | Primary text color |

### Typography
| Role | Font | Weight | Size |
|------|------|--------|------|
| Headings, game text, scores | Baloo 2 (`font-display`) | 700-800 | 28-40px |
| Body text, instructions | Comic Neue (`font-body`) | 400-700 | 18-22px |
| Hints, labels, friendly notes | Patrick Hand (`font-hand`) | 400 | 16-20px |

### Spacing & Sizing
| Element | Size |
|---------|------|
| Minimum tap target | 48×48px |
| Button border radius | 16px |
| Card border radius | 20px |
| Section border radius | 28px |
| Button box shadow (resting) | 0 4px 0 rgba(0,0,0,0.15) |
| Button box shadow (hover) | 0 6px 0 rgba(0,0,0,0.15) |
| Button box shadow (active) | 0 2px 0 rgba(0,0,0,0.15) |

### Animation Constants
| Animation | Library | Config |
|-----------|---------|--------|
| Spring tap | Framer Motion | `type: "spring", stiffness: 400, damping: 15` |
| Bounce in | Framer Motion | `type: "spring", stiffness: 300, damping: 20` |
| Shake wrong | Framer Motion | `x: [-10, 10, -8, 8, -4, 4, 0], duration: 0.4` |
| Pop correct | Framer Motion | `scale: [1, 1.2, 1], duration: 0.5` |
| Stagger children | Framer Motion | `staggerChildren: 0.1` |
| Confetti fall | GSAP | `y: 100vh, rotation: 720, duration: 2, ease: "power2.in"` |
| Star count pop | GSAP | `scale: 1.6 → 1, duration: 0.4, ease: "elastic.out(1, 0.4)"` |
| Float ambient | CSS | `translateY(0) → translateY(-10px), 3s ease-in-out infinite` |
| Cloud drift | CSS | `left: -200px → 110%, 25-35s linear infinite` |

---

## Accessibility Requirements

- All interactive elements must be keyboard focusable with visible focus rings
- All emoji used as content (not decoration) must have `aria-label` attributes
- Drag-and-drop (dnd-kit) must have keyboard alternatives (arrow keys to select + enter to place)
- The tap-to-place fallback on spelling tiles ensures touch accessibility for young children who can't drag
- Audio controls must be clearly labeled
- Color is never the sole indicator — always paired with shape, icon, or animation
- Text contrast: all text meets WCAG AA against its background (the kid palette on white/cream passes)
- Reduced motion: wrap all decorative animations in `@media (prefers-reduced-motion: no-preference)`. Game-critical animations (correct/wrong feedback) use simpler alternatives (opacity change instead of spring).

---

## What Is NOT in MVP

These are explicitly out of scope for the first version:

- User accounts / authentication
- Parent dashboard / analytics
- Multiple languages for the UI (the UI is in English — the child learns by immersion)
- Leaderboards or social features
- Custom avatars or profile editing
- Timed challenges or competitive modes
- In-app purchases or premium tiers
- Backend / API / database (everything is client-side with localStorage persistence)
- PWA / offline mode (nice to have later)
- RTL language support for the UI
- Achievements / badge system beyond stars

---

## Build Order

Recommended implementation sequence:

1. **Shared systems first:** Zustand store, sound hook, cn utility, animation variants, word database, BackgroundScene, Navbar, PageTransition, Toast, Confetti, LottieReward
2. **Home dashboard:** game selection grid, star display, basic routing to all 5 game routes (stub pages)
3. **Screen 1: ABC Alphabet** — simplest game, validates the sound + animation + star reward pipeline end-to-end
4. **Screen 5: Word Explorer** — no wrong answers, validates the flip card + category system + pronunciation
5. **Screen 2: Match Words** — validates the two-card selection + match/mismatch logic + level progression
6. **Screen 4: Numbers** — validates the emoji cluster + multiple choice + audio question pipeline
7. **Screen 3: Spelling Bee** — most complex, validates dnd-kit integration + slot filling + difficulty tiers
8. **Bottom navigation** — add after all screens work
9. **Polish pass:** transitions between screens, edge cases, mobile responsive fixes, sound file integration, Lottie file integration