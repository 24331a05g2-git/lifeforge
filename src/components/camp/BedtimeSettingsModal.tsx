"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, Clock, X, Check, Globe } from "lucide-react";
import { updateUserBedtimeAction } from "@/actions/nightly-camp";

interface BedtimeSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBedtime: string;
  timezone: string;
  onBedtimeUpdated: (newBedtime: string) => void;
}

export function BedtimeSettingsModal({
  isOpen,
  onClose,
  currentBedtime,
  timezone,
  onBedtimeUpdated,
}: BedtimeSettingsModalProps) {
  const [bedtime, setBedtime] = useState(currentBedtime || "22:30");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await updateUserBedtimeAction(bedtime);
      if (res.success && res.data) {
        onBedtimeUpdated(res.data);
        onClose();
      } else {
        setErrorMessage(res.error || "Failed to update bedtime.");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error saving bedtime.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-md rounded-3xl border border-amber-500/30 bg-[#0C0F17] p-6 sm:p-7 shadow-[0_0_50px_rgba(0,0,0,0.8)]"
          role="dialog"
          aria-labelledby="bedtime-modal-title"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2.5 rounded-2xl border border-amber-500/40 bg-amber-500/10 text-amber-400">
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <h3
                id="bedtime-modal-title"
                className="font-cinzel text-lg font-bold text-slate-100"
              >
                Camp Bedtime Schedule
              </h3>
              <p className="text-xs text-slate-400 font-sans">
                Set when Nightly Camp calls you to rest
              </p>
            </div>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 text-xs font-mono">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-slate-300 block">
                Scheduled Bedtime
              </label>
              <div className="relative">
                <input
                  type="time"
                  required
                  value={bedtime}
                  onChange={(e) => setBedtime(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/[0.04] text-slate-100 font-mono text-lg focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
              <p className="text-[11px] text-slate-400 font-sans">
                Nightly Camp opens approximately 30–60 minutes before your bedtime.
              </p>
            </div>

            {/* Timezone Info */}
            <div className="flex items-center gap-2 p-3 rounded-xl border border-white/[0.06] bg-white/[0.02] text-xs font-mono text-slate-400">
              <Globe className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
              <span>Timezone: {timezone}</span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-white/10 text-xs font-cinzel font-bold text-slate-300 hover:bg-white/[0.05] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-cinzel font-bold uppercase tracking-wider transition-all disabled:opacity-50"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{isSubmitting ? "Saving..." : "Save Schedule"}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
