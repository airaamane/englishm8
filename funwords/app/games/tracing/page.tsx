"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/stores/gameStore";
import { useSound } from "@/hooks/useSound";
import { usePronunciation } from "@/hooks/usePronunciation";
import { useConfetti } from "@/hooks/useConfetti";
import { pageTransition, bounceIn } from "@/lib/animations";
import { cn } from "@/lib/cn";
import { Toast } from "@/components/ui/Toast";

const ALPHABET = [
  { letter: "A", soundAlt: "ah" },
  { letter: "B", soundAlt: "buh" },
  { letter: "C", soundAlt: "kuh" },
  { letter: "D", soundAlt: "duh" },
  { letter: "E", soundAlt: "eh" },
  { letter: "F", soundAlt: "ff" },
  { letter: "G", soundAlt: "guh" },
  { letter: "H", soundAlt: "huh" },
  { letter: "I", soundAlt: "ih" },
  { letter: "J", soundAlt: "juh" },
  { letter: "K", soundAlt: "kuh" },
  { letter: "L", soundAlt: "lll" },
  { letter: "M", soundAlt: "mmm" },
  { letter: "N", soundAlt: "nnn" },
  { letter: "O", soundAlt: "aw" },
  { letter: "P", soundAlt: "puh" },
  { letter: "Q", soundAlt: "kwuh" },
  { letter: "R", soundAlt: "rrr" },
  { letter: "S", soundAlt: "sss" },
  { letter: "T", soundAlt: "tuh" },
  { letter: "U", soundAlt: "uh" },
  { letter: "V", soundAlt: "vvv" },
  { letter: "W", soundAlt: "wuh" },
  { letter: "X", soundAlt: "ks" },
  { letter: "Y", soundAlt: "yuh" },
  { letter: "Z", soundAlt: "zzz" },
];

export default function TracingGame() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mode, setMode] = useState<"name" | "sound">("name");
  const [showToast, setShowToast] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  const addStars = useGameStore((s) => s.addStars);
  const completeGame = useGameStore((s) => s.completeGame);
  const { play } = useSound();
  const { speak } = usePronunciation();
  const { containerRef, fire } = useConfetti();

  const currentData = ALPHABET[currentIndex];

  // Initialize Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Support Retina
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    // Set actual size in memory (scaled to account for extra pixel density)
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    // Normalize coordinate system to use css pixels
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 16;
    ctx.strokeStyle = "#4ECB71"; // grass color

    ctxRef.current = ctx;
  }, []);

  // Play sound when letter or mode changes
  const playLetterSound = useCallback(() => {
    if (mode === "name") {
      speak(currentData.letter);
    } else {
      speak(currentData.soundAlt);
    }
  }, [mode, currentData, speak]);

  useEffect(() => {
    playLetterSound();
  }, [playLetterSound]);

  // Drawing Handlers
  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault(); // prevent scrolling
    const canvas = canvasRef.current;
    if (!canvas || !ctxRef.current) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctxRef.current.beginPath();
    ctxRef.current.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing || !ctxRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctxRef.current.lineTo(x, y);
    ctxRef.current.stroke();
  };

  const stopDrawing = () => {
    if (ctxRef.current) {
      ctxRef.current.closePath();
    }
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !ctxRef.current) return;
    ctxRef.current.clearRect(0, 0, canvas.width, canvas.height);
    play("pop");
  };

  const handleNext = () => {
    clearCanvas();
    if (currentIndex < ALPHABET.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Completed all letters!
      addStars(5);
      completeGame("/games/tracing");
      fire();
      play("confetti");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
      setCurrentIndex(0); // reset
    }
  };

  const handlePrev = () => {
    clearCanvas();
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      className="max-w-4xl mx-auto px-4 py-8 text-center"
    >
      <div ref={containerRef} className="fixed inset-0 pointer-events-none z-[9999]" />
      <Toast message="Amazing Tracing!" emoji="🎨" visible={showToast} />

      <h1 className="font-display text-4xl sm:text-5xl font-bold text-night mb-6">
        Tracing & Phonics ✍️
      </h1>

      {/* Mode Toggle */}
      <div className="flex justify-center mb-8">
        <div className="bg-white/80 backdrop-blur-sm p-1 rounded-full shadow-card flex items-center border-2 border-night/10">
          <button
            onClick={() => {
              setMode("name");
              play("pop");
            }}
            className={cn(
              "px-6 py-2 rounded-full font-display font-bold text-lg transition-all",
              mode === "name" ? "bg-candy text-white shadow-sm" : "text-night/50 hover:text-night"
            )}
          >
            Letter Names
          </button>
          <button
            onClick={() => {
              setMode("sound");
              play("pop");
            }}
            className={cn(
              "px-6 py-2 rounded-full font-display font-bold text-lg transition-all",
              mode === "sound" ? "bg-sky text-white shadow-sm" : "text-night/50 hover:text-night"
            )}
          >
            Letter Sounds
          </button>
        </div>
      </div>

      {/* Canvas Area container */}
      <div className="relative w-full max-w-[400px] aspect-square mx-auto mb-8 bg-white/90 border-4 border-dashed border-night/20 rounded-3xl shadow-card overflow-hidden touch-none">
        
        {/* Background Faded Letter Guidelines */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
          <span className="font-display font-black text-[250px] text-night/10 text-center leading-none">
            {currentData.letter}
          </span>
        </div>

        {/* Drawing Surface */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
          onPointerDown={startDrawing}
          onPointerMove={draw}
          onPointerUp={stopDrawing}
          onPointerCancel={stopDrawing}
          onPointerLeave={stopDrawing}
          style={{ touchAction: "none" }}
        />
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
        <motion.button
          variants={bounceIn}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="w-14 h-14 rounded-full bg-white border-2 border-night/20 flex items-center justify-center text-night/50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md cursor-pointer"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
        </motion.button>

        <motion.button
          variants={bounceIn}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={clearCanvas}
          className="px-6 py-3 rounded-full bg-sun text-white font-display font-bold text-lg shadow-btn cursor-pointer"
        >
          Clear
        </motion.button>

        <motion.button
          variants={bounceIn}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            playLetterSound();
            addStars(1);
          }}
          className="px-6 py-3 rounded-full bg-purple text-white font-display font-bold text-lg shadow-btn cursor-pointer flex items-center gap-2"
        >
          <span>Hear Sound</span>
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM18.584 5.106a.75.75 0 011.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 01-1.06-1.06 8.25 8.25 0 000-11.668.75.75 0 010-1.06z" /></svg>
        </motion.button>

        <motion.button
          variants={bounceIn}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleNext}
          className="w-14 h-14 rounded-full bg-grass border-b-4 border-grass-dark flex items-center justify-center text-white shadow-btn cursor-pointer"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
        </motion.button>
      </div>

    </motion.div>
  );
}
