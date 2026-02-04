import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "2048 - The Classic Puzzle Game",
  description: "Play the classic 2048 puzzle game. Join tiles to reach 2048! Features leaderboard, stats tracking, and more.",
  keywords: ["2048", "game", "puzzle", "tiles", "leaderboard"],
  authors: [{ name: "Nathan FERRE" }],
  openGraph: {
    title: "2048 - The Classic Puzzle Game",
    description: "Play the classic 2048 puzzle game with leaderboard and stats!",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
