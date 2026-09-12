"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { GameMasterMessage, GameMasterContextData } from "@/lib/game-master/types";
import { getGameMasterAdviceAction } from "@/actions/game-master";
import { Sparkles, ArrowRight, ShieldAlert, RefreshCw, Compass, Flame } from "lucide-react";

interface GameMasterCardProps {
  initialMessage: GameMasterMessage;
  initialContext?: GameMasterContextData;
}

export function GameMasterCard({
  initialMessage,
  initialContext,
}: GameMasterCardProps) {
  const [message, setMessage] = useState<GameMasterMessage>(initialMessage);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await getGameMasterAdviceAction();
      if (res.success && res.data) {
        setMessage(res.data.message);
      }
    } catch (err) {
      console.error("Failed to refresh Game Master advice:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const isHighPriority = message.priority === "high";
  const isStreakAlert = message.context === "streak_at_risk";

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`relative overflow-hidden rounded-3xl border p-6 sm:p-7 backdrop-blur-xl transition-all duration-300 ${
        isHighPriority
          ? "border-amber-500/40 bg-gradient-to-br from-amber-950/30 via-[#0B0E17]/90 to-[#0B0E17]/90 shadow-[0_0_40px_rgba(245,158,11,0.15)]"
          : "border-white/10 bg-gradient-to-br from-white/[0.04] via-[#0A0D15]/90 to-[#0A0D15]/90 shadow-[0_0_35px_rgba(0,0,0,0.4)]"
      }`}
    >
      {/* Subtle Background Glow */}
      <div
        className={`pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full blur-3xl opacity-20 ${
          isStreakAlert
            ? "bg-orange-500"
            : isHighPriority
            ? "bg-amber-400"
            : "bg-cyan-500"
        }`}
      />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left Section: Companion Avatar + Message */}
        <div className="flex items-start gap-4 sm:gap-5 flex-1">
          {/* ARIA Companion Sigil */}
          <div className="relative flex-shrink-0">
            <div
              className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center border shadow-inner transition-transform duration-300 ${
                isStreakAlert
                  ? "border-orange-500/50 bg-orange-950/40 text-orange-400"
                  : isHighPriority
                  ? "border-amber-500/50 bg-amber-950/40 text-amber-400"
                  : "border-cyan-500/40 bg-cyan-950/30 text-cyan-300"
              }`}
            >
              {isStreakAlert ? (
                <Flame className="w-6 h-6 animate-pulse text-orange-400" />
              ) : isHighPriority ? (
                <ShieldAlert className="w-6 h-6 animate-pulse text-amber-400" />
              ) : (
                <Compass className="w-6 h-6 text-cyan-300" />
              )}
            </div>

            {/* Pulsing online indicator */}
            <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-[#0A0D15]" />
            </span>
          </div>

          {/* Text Content */}
          <div className="space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-cinzel text-xs uppercase tracking-widest text-amber-400/90 font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                ARIA • GAME MASTER
              </span>

              {isHighPriority && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono tracking-wider uppercase font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Priority Alert
                </span>
              )}
            </div>

            <h3 className="font-cinzel text-lg sm:text-xl font-bold text-slate-100 tracking-wide">
              {message.title}
            </h3>

            <p className="text-sm text-slate-300 leading-relaxed font-sans max-w-2xl">
              {message.message}
            </p>
          </div>
        </div>

        {/* Right Section: Action Button & Refresh */}
        <div className="flex items-center gap-3 self-end md:self-center flex-shrink-0">
          {message.actionLabel && message.actionHref && (
            <Link
              href={message.actionHref}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-cinzel text-xs uppercase tracking-widest font-bold transition-all duration-200 active:scale-95 shadow-md ${
                isHighPriority
                  ? "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 shadow-amber-900/30"
                  : "bg-white/[0.08] hover:bg-white/[0.12] border border-white/10 hover:border-amber-500/40 text-slate-100"
              }`}
            >
              <span>{message.actionLabel}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            title="Request new guidance from ARIA"
            className="p-2.5 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] text-slate-400 hover:text-amber-300 transition-colors disabled:opacity-50"
            aria-label="Refresh guidance"
          >
            <RefreshCw
              className={`w-4 h-4 ${isRefreshing ? "animate-spin text-amber-400" : ""}`}
            />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
