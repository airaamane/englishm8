"use client";

import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/cn";

interface DropZoneProps {
  id: string;
  children?: React.ReactNode;
  className?: string;
}

export function DropZone({ id, children, className }: DropZoneProps) {
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "min-w-[56px] min-h-[56px] rounded-button border-3 border-dashed flex items-center justify-center transition-colors",
        isOver ? "border-grass bg-grass-light" : "border-sky-dark/30 bg-sky-light/30",
        className
      )}
    >
      {children}
    </div>
  );
}
