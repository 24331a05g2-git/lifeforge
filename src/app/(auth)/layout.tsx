import React from "react";
import Link from "next/link";
import { ParticleBackground } from "@/components/landing/ParticleBackground";
import { Logo } from "@/components/common/Logo";
import { ChevronLeft } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen flex flex-col justify-between bg-[#07080B] text-slate-100 selection:bg-amber-500/30 selection:text-white">
      {/* Particle & Radial Ambience */}
      <ParticleBackground />

      {/* Top Header */}
      <header className="relative z-20 w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-400 hover:text-amber-300 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-md px-2 py-1"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Return to Realm</span>
        </Link>
        <Logo size="sm" showText={true} />
      </header>

      {/* Auth Card Content */}
      <main className="relative z-20 flex-1 flex items-center justify-center px-4 sm:px-6 py-8">
        {children}
      </main>

      {/* Minimal Footer */}
      <footer className="relative z-20 py-6 text-center text-xs text-slate-500 font-cinzel tracking-widest uppercase">
        Don&apos;t just manage your life. Play it.
      </footer>
    </div>
  );
}
