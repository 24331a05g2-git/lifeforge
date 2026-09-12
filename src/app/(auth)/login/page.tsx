"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Eye, EyeOff, Mail, Lock, AlertCircle, Info } from "lucide-react";
import { loginAction } from "@/actions/auth";

function LoginForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [redirectNotice, setRedirectNotice] = useState<string | null>(null);

  useEffect(() => {
    const redirectedFrom = searchParams.get("redirectedFrom");
    const errorParam = searchParams.get("error");

    if (redirectedFrom) {
      setRedirectNotice("Please authenticate to access your character journey.");
    } else if (errorParam === "unconfigured") {
      setErrorMessage(
        "Supabase credentials are not configured. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local."
      );
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !email.includes("@")) {
      setErrorMessage("Please enter a valid realm email address.");
      return;
    }

    if (!password) {
      setErrorMessage("Please enter your secret password.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await loginAction({ email, password });

      if (!result.success && result.error) {
        setErrorMessage(result.error);
        setIsSubmitting(false);
      }
    } catch (err: unknown) {
      // In Next.js, redirect() throws an internal NEXT_REDIRECT error which is caught here.
      if (typeof err === "object" && err !== null && "message" in err) {
        const msg = String((err as { message: unknown }).message);
        if (msg.includes("NEXT_REDIRECT")) {
          return;
        }
      }
      setErrorMessage("The realm gateway could not complete your sign in. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative rounded-3xl border border-white/10 bg-[#0A0D15]/90 p-6 sm:p-10 backdrop-blur-xl shadow-[0_0_50px_rgba(0,0,0,0.8)]"
      >
        {/* Glowing aura accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_15px_rgba(245,158,11,0.8)]" />

        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs font-mono font-medium">
            <Shield className="w-3.5 h-3.5" />
            <span>SANCTUARY OF RETURN</span>
          </div>

          <h1 className="font-cinzel text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-wide">
            Welcome back, Adventurer.
          </h1>

          <p className="text-sm text-slate-400">
            Your journey is waiting.
          </p>
        </div>

        {/* Redirect Notice */}
        <AnimatePresence>
          {redirectNotice && !errorMessage && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs sm:text-sm flex items-center gap-3"
            >
              <Info className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{redirectNotice}</span>
            </motion.div>
          )}
        </AnimatePresence>

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
                  Authentication Failed
                </p>
                <p className="text-red-300/90 leading-relaxed">{errorMessage}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Address */}
          <div className="space-y-2">
            <label
              htmlFor="loginEmail"
              className="block text-xs font-medium uppercase tracking-wider text-slate-300 font-mono"
            >
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="loginEmail"
                name="loginEmail"
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

          {/* Password */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="loginPassword"
                className="block text-xs font-medium uppercase tracking-wider text-slate-300 font-mono"
              >
                Password
              </label>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="loginPassword"
                name="loginPassword"
                type={showPassword ? "text" : "password"}
                required
                placeholder="Enter your secret password"
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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full group relative inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-bold rounded-xl overflow-hidden text-slate-950 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-300 hover:to-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.4)] hover:shadow-[0_0_35px_rgba(245,158,11,0.6)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-400 cursor-pointer"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span className="font-cinzel">Verifying Seal...</span>
              </div>
            ) : (
              <>
                <Shield className="w-4 h-4 text-slate-950" />
                <span className="font-cinzel tracking-wider">Continue Journey</span>
              </>
            )}
          </button>

          {/* Link to Sign Up */}
          <div className="text-center pt-2 text-xs text-slate-400">
            New adventurer?{" "}
            <Link
              href="/signup"
              className="font-semibold text-amber-400 hover:text-amber-300 underline underline-offset-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded"
            >
              Create your character
            </Link>
          </div>
        </form>

        {/* Security Notice */}
        <div className="mt-8 pt-4 border-t border-white/[0.06] text-center">
          <p className="text-[11px] text-slate-500 font-mono">
            Protected by Supabase Auth. Sessions are cryptographically signed.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-slate-400 font-mono text-sm">Entering Sanctuary...</div>}>
      <LoginForm />
    </Suspense>
  );
}
