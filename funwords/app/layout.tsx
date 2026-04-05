import type { Metadata, Viewport } from "next";
import { Baloo_2, Comic_Neue, Patrick_Hand } from "next/font/google";
import "./globals.css";
import { ClientLayout } from "./client-layout";

const baloo = Baloo_2({
  subsets: ["latin"],
  variable: "--font-baloo2",
  weight: ["400", "600", "700", "800"],
});

const comicNeue = Comic_Neue({
  subsets: ["latin"],
  variable: "--font-comic-neue",
  weight: ["400", "700"],
});

const patrickHand = Patrick_Hand({
  subsets: ["latin"],
  variable: "--font-patrick-hand",
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "FunWords! — Learn English the Fun Way",
  description:
    "An interactive English learning playground for kids aged 5–10. Play games, learn words, and earn stars!",
};

export const viewport: Viewport = {
  themeColor: "#6EC6FF",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${baloo.variable} ${comicNeue.variable} ${patrickHand.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-body text-night">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
