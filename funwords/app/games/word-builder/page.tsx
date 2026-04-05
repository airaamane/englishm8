"use client";

import { motion } from "framer-motion";
import { pageTransition } from "@/lib/animations";

export default function WordBuilderGame() {
  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      className="max-w-4xl mx-auto px-4 py-8 text-center"
    >
      <h1 className="font-display text-4xl font-bold text-night mb-4">
        🧩 Word Builder
      </h1>
      <p className="font-body text-xl text-night/70">
        Drag and drop letters to build words! Coming soon...
      </p>
    </motion.div>
  );
}
