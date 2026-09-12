import { Navbar } from "@/components/common/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { LorePreview } from "@/components/landing/LorePreview";
import { Footer } from "@/components/common/Footer";
import { ParticleBackground } from "@/components/landing/ParticleBackground";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen flex flex-col bg-[#07080B] text-slate-100 selection:bg-amber-500/30 selection:text-white">
      {/* Ambient Animated Particles & Radial Glow */}
      <ParticleBackground />

      {/* Sticky Minimalist RPG Navigation */}
      <Navbar />

      {/* Main Hero & Content */}
      <main className="relative z-10 flex-1 flex flex-col">
        <HeroSection />
        <LorePreview />
      </main>

      {/* Cinematic RPG Footer */}
      <Footer />
    </div>
  );
}
