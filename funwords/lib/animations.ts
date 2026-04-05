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
