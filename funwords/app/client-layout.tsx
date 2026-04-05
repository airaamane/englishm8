"use client";

import { Navbar } from "@/components/layout/Navbar";
import { BottomNav } from "@/components/layout/BottomNav";
import { PageTransition } from "@/components/layout/PageTransition";
import { BackgroundScene } from "@/components/decorative/BackgroundScene";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BackgroundScene />
      <Navbar />
      <main className="relative z-10 flex-1 pt-16 pb-20">
        <PageTransition>{children}</PageTransition>
      </main>
      <BottomNav />
    </>
  );
}
