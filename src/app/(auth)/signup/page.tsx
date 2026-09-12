"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sword, Eye, EyeOff, Sparkles, CheckCircle2, User, Mail, Lock, AlertCircle } from "lucide-react";
import { signUpAction } from "@/actions/auth";

type Archetype = "warrior" | "scholar" | "architect" | "alchemist";

export default function SignUpPage() {
  const router = useRouter();
  const [characterName, setCharacterName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedArchetype, setSelectedArchetype] = useState<Archetype>("scholar");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmationNotice, setConfirmationNotice] = useState<string | null>(null);

  const archetypes: Record<
    Archetype,
    { title: string; desc: string; icon: string; boost: string }
  > = {
    scholar: {
      title: "Scholar",
      desc: "Master of intellect, deep study & problem analysis.",
      icon: "📜",
      boost: "+2 Intellect",
    },
    warrior: {
      title: "Warrior",
      desc: "Unyielding physically, disciplined workouts & high grit.",
      icon: "⚔️",
      boost: "+2 Strength",
    },
    architect: {
      title: "Architect",
      desc: "Designer of systems, habits & structured productivity.",
      icon: "📐",
      boost: "+2 Focus",
    },
    alchemist: {
      title: "Alchemist",
      desc: "Transformative thinker combining creativity & experiment.",
      icon: "🧪",
      boost: "+2 Energy",
    },
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setConfirmationNotice(null);

    if (!email || !email.includes("@")) {
      setErrorMessage("Please enter a valid realm email address.");
      return;
    }

    if (!password || password.length < 6) {
      setErrorMessage("Your secret password must contain at least 6 characters.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await signUpAction({
        email,
        password,
        characterName,
        archetype: selectedArchetype,
      });

      if (!result.success && result.error) {
        setErrorMessage(result.error);
        setIsSubmitting(false);
      } else if (result.requiresEmailConfirmation && result.message) {
        setConfirmationNotice(result.message);
        setIsSubmitting(false);
      }
    } catch (err: unknown) {
      // In Next.js, redirect() throws an internal NEXT_REDIRECT error which is caught here.
      // If it's a redirect, let Next.js handle navigation.
      if (typeof err === "object" && err !== null && "message" in err) {
        const msg = String((err as { message: unknown }).message);
        if (msg.includes("NEXT_REDIRECT")) {
          return;
        }
      }
      setErrorMessage("The realm gateway could not complete your registration. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-xl">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative rounded-3xl border border-white/10 bg-[#0A0D15]/90 p-6 sm:p-10 backdrop-blur-xl shadow-[0_0_50px_rgba(0,0,0,0.8)]"
      >
        {/* Glowing ember accent on card top */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_15px_rgba(245,158,11,0.8)]" />

        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs font-mono font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>LEVEL 1 FORGE</span>
          </div>

          <h1 className="font-cinzel text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-wide">
            Every legend starts at Level 1.
          </h1>

          <p className="text-sm text-slate-400">
            Create your character and begin your journey.
          </p>
        </div>

        {/* Error Alert Banner */}
        <AnimatePresence>
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 text-xs sm:text-sm flex items-start gap-3"
              role="alert"
            >
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold font-cinzel text-red-200">
                  Your journey could not begin yet.
                </p>
                <p className="text-red-300/90 leading-relaxed">{errorMessage}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Confirmation Notice Banner */}
        <AnimatePresence>
          {confirmationNotice && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-5 rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-200 text-xs sm:text-sm flex items-start gap-3 shadow-[0_0_20px_rgba(245,158,11,0.2)]"
              role="status"
            >
              <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold font-cinzel text-amber-100">
                  Summoning Scroll Dispatched
                </p>
                <p className="text-amber-200/90 leading-relaxed">{confirmationNotice}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Character Name / Adventurer Tag */}
          <div className="space-y-2">
            <label
              htmlFor="characterName"
              className="block text-xs font-medium uppercase tracking-wider text-slate-300 font-mono"
            >
              Character Name / Adventurer Tag
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <User className="w-4 h-4" />
              </div>
              <input
                id="characterName"
                name="characterName"
                type="text"
                placeholder="e.g. Rowan the Diligent"
                value={characterName}
                onChange={(e) => setCharacterName(e.target.value)}
                disabled={isSubmitting}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/10 bg-white/[0.03] text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-sm transition-all disabled:opacity-50"
              />
            </div>
          </div>

          {/* Email Address */}
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-xs font-medium uppercase tracking-wider text-slate-300 font-mono"
            >
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="adventurer@lifeforge.realm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/10 bg-white/[0.03] text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-sm transition-all disabled:opacity-50"
              />
            </div>
          </div>

          {/* Secret Password */}
          <div className="space-y-2">
            <label
              htmlFor="password"
              className="block text-xs font-medium uppercase tracking-wider text-slate-300 font-mono"
            >
              Secret Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                placeholder="Minimum 6 runes / characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                className="w-full pl-10 pr-11 py-3 rounded-xl border border-white/10 bg-white/[0.03] text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-sm transition-all disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
                disabled={isSubmitting}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Archetype Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-medium uppercase tracking-wider text-slate-300 font-mono">
              Choose Starting Archetype
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {(Object.keys(archetypes) as Archetype[]).map((arch) => {
                const isSelected = selectedArchetype === arch;
                const item = archetypes[arch];
                return (
                  <button
                    key={arch}
                    type="button"
                    onClick={() => setSelectedArchetype(arch)}
                    disabled={isSubmitting}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? "border-amber-400 bg-amber-500/10 text-white shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                        : "border-white/5 bg-white/[0.02] text-slate-400 hover:border-white/20 hover:text-slate-300"
                    } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-base">{item.icon}</span>
                      <span className="text-[10px] font-mono text-amber-400/90 font-semibold">
                        {item.boost}
                      </span>
                    </div>
                    <div className="font-cinzel text-xs font-bold">{item.title}</div>
                    <div className="text-[10px] text-slate-500 leading-tight mt-0.5 line-clamp-1">
                      {item.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full group relative inline-flex items-center justify-center gap-2.5 px-6 py-3.5 text-base font-bold rounded-xl overflow-hidden text-slate-950 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-300 hover:to-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.4)] hover:shadow-[0_0_35px_rgba(245,158,11,0.6)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-400 cursor-pointer"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span className="font-cinzel">Summoning Character...</span>
              </div>
            ) : (
              <>
                <Sword className="w-4 h-4 text-slate-950 transition-transform group-hover:rotate-12 duration-200" />
                <span className="font-cinzel tracking-wider">Create My Character</span>
              </>
            )}
          </button>

          {/* Link to Sign In */}
          <div className="text-center pt-2 text-xs text-slate-400">
            Already have a character?{" "}
            <Link
              href="/login"
              className="font-semibold text-amber-400 hover:text-amber-300 underline underline-offset-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded"
            >
              Continue Journey
            </Link>
          </div>
        </form>

        {/* Security / Auth Notice */}
        <div className="mt-8 pt-4 border-t border-white/[0.06] text-center">
          <p className="text-[11px] text-slate-500 font-mono">
            Protected by Supabase Auth. Passwords and credentials are cryptographically secured.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
