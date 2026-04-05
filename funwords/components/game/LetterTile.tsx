"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/cn";

interface LetterTileProps {
  id: string;
  letter: string;
  className?: string;
}

export function LetterTile({ id, letter, className }: LetterTileProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "w-14 h-14 rounded-button bg-sun text-night font-display text-2xl font-bold flex items-center justify-center shadow-btn cursor-grab active:cursor-grabbing select-none",
        isDragging && "opacity-70 scale-110 z-10",
        className
      )}
      aria-label={`Letter tile ${letter}`}
    >
      {letter.toUpperCase()}
    </div>
  );
}
