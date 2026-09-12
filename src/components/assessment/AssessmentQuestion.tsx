"use client";

import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Question } from "@/lib/assessment/types";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

interface AssessmentQuestionProps {
  question: Question;
  totalQuestions: number;
  selectedAnswer: string | string[] | undefined;
  onSelectOption: (optionId: string) => void;
  onNext: () => void;
  onBack: () => void;
  canGoBack: boolean;
  canContinue: boolean;
}

export function AssessmentQuestion({
  question,
  totalQuestions,
  selectedAnswer,
  onSelectOption,
  onNext,
  onBack,
  canGoBack,
  canContinue,
}: AssessmentQuestionProps) {
  const isMulti = question.isMultiSelect;
  const currentSelection: string[] = Array.isArray(selectedAnswer)
    ? selectedAnswer
    : selectedAnswer
    ? [selectedAnswer]
    : [];

  const firstOptionRef = useRef<HTMLButtonElement>(null);

  // Focus the first option on question change for smooth keyboard navigation
  useEffect(() => {
    firstOptionRef.current?.focus();
  }, [question.id]);

  // Global Enter key shortcut to proceed if continue is enabled
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && canContinue && (e.ctrlKey || e.metaKey || document.activeElement?.tagName !== "BUTTON")) {
        e.preventDefault();
        onNext();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [canContinue, onNext]);

  const progressPercent = Math.round((question.number / totalQuestions) * 100);

  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, x: 25 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -25 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="relative rounded-3xl border border-white/10 bg-[#0A0D15]/90 p-6 sm:p-10 backdrop-blur-xl shadow-[0_0_50px_rgba(0,0,0,0.8)]">
        {/* Glowing top line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_15px_rgba(245,158,11,0.8)]" />

        {/* Progress Bar & Header */}
        <div className="mb-8 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2 text-amber-400">
              <span className="text-base">{question.categoryIcon}</span>
              <span className="font-semibold uppercase tracking-wider">{question.category}</span>
            </div>
            <span className="text-slate-400">
              Question <strong className="text-amber-300 font-bold">{question.number}</strong> of{" "}
              {totalQuestions}
            </span>
          </div>

          {/* Animated Progress Bar */}
          <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full shadow-[0_0_12px_rgba(245,158,11,0.6)]"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Question Prompt */}
        <div className="space-y-2 mb-8">
          <h2 className="font-cinzel text-xl sm:text-2xl font-bold text-slate-100 leading-snug">
            {question.prompt}
          </h2>
          {question.subtitle && (
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              {question.subtitle}
            </p>
          )}
          {isMulti && (
            <p className="text-[11px] font-mono text-amber-400/90 font-medium">
              ✦ Multi-Select: Choose up to {question.maxSelections || 3} options.
            </p>
          )}
        </div>

        {/* Answer Options */}
        <div className="space-y-3 mb-10" role="group" aria-label={question.prompt}>
          {question.options.map((option, idx) => {
            const isSelected = currentSelection.includes(option.id);

            return (
              <button
                key={option.id}
                ref={idx === 0 ? firstOptionRef : undefined}
                type="button"
                onClick={() => onSelectOption(option.id)}
                className={`w-full group p-4 sm:p-5 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex items-start gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                  isSelected
                    ? "border-amber-400 bg-amber-500/10 text-white shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                    : "border-white/[0.08] bg-white/[0.02] text-slate-300 hover:border-white/20 hover:bg-white/[0.04]"
                }`}
                aria-pressed={isSelected}
              >
                {/* Checkbox / Radio Circle */}
                <div
                  className={`w-5 h-5 rounded-${
                    isMulti ? "md" : "full"
                  } border mt-0.5 shrink-0 flex items-center justify-center transition-colors ${
                    isSelected
                      ? "border-amber-400 bg-amber-400 text-slate-950 font-bold"
                      : "border-slate-600 bg-transparent group-hover:border-slate-400"
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>

                {/* Option Text */}
                <div className="flex-1">
                  <span className="text-sm sm:text-base font-normal leading-relaxed block">
                    {option.text}
                  </span>
                  {option.flavor && (
                    <span className="text-xs text-slate-500 font-mono mt-1 block">
                      {option.flavor}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-white/[0.06]">
          <button
            type="button"
            onClick={onBack}
            disabled={!canGoBack}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 text-xs sm:text-sm font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
              canGoBack
                ? "text-slate-300 hover:text-white hover:bg-white/[0.04] cursor-pointer"
                : "text-slate-600 border-white/5 cursor-not-allowed opacity-50"
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <button
            type="button"
            onClick={onNext}
            disabled={!canContinue}
            className={`inline-flex items-center gap-2 px-7 py-3 rounded-xl text-xs sm:text-sm font-bold font-cinzel tracking-wider transition-all focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-400 ${
              canContinue
                ? "bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-[0_0_25px_rgba(245,158,11,0.4)] cursor-pointer active:scale-95"
                : "bg-white/[0.05] text-slate-600 cursor-not-allowed border border-white/5"
            }`}
          >
            <span>{question.number === totalQuestions ? "Reveal Character" : "Continue"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
