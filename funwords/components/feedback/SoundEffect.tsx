"use client";

import { useCallback } from "react";
import { useSound } from "@/hooks/useSound";

interface SoundEffectProps {
  name: string;
  children: (play: () => void) => React.ReactNode;
}

export function SoundEffect({ name, children }: SoundEffectProps) {
  const { play } = useSound();
  const trigger = useCallback(() => play(name), [play, name]);

  return <>{children(trigger)}</>;
}
