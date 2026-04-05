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
