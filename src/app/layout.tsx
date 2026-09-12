import type { Metadata } from "next";
import { Geist, Geist_Mono, Cinzel } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "LIFEFORGE — Forge the life you want to live",
  description:
    "Don't just manage your life. Play it. Your goals are quests, your habits build your character, and every day is another level.",
  keywords: ["Life RPG", "Gamified Productivity", "Habit Tracker", "Personal Development", "RPG"],
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${cinzel.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#07080B] text-[#F3F4F6] selection:bg-amber-500/30 selection:text-white">
        {children}
      </body>
    </html>
  );
}
