"use client";

import { motion } from "framer-motion";
import { shake } from "@/lib/animations";

interface ShakeWrapperProps {
  shaking: boolean;
  children: React.ReactNode;
}

export function ShakeWrapper({ shaking, children }: ShakeWrapperProps) {
  return (
    <motion.div
      variants={shake}
      animate={shaking ? "wrong" : "idle"}
    >
      {children}
    </motion.div>
  );
}
