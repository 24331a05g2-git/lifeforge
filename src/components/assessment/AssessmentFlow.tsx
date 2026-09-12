"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { QUESTIONS } from "@/lib/assessment/questions";
import { calculateAssessmentResult } from "@/lib/assessment/scoring";
import { AssessmentResult } from "@/lib/assessment/types";
import { AssessmentIntro } from "./AssessmentIntro";
import { AssessmentQuestion } from "./AssessmentQuestion";
import { CharacterReveal } from "./CharacterReveal";
import { Sparkles, Flame } from "lucide-react";

interface AssessmentFlowProps {
  initialCharacterName: string;
}

type FlowStep = "intro" | "questions" | "revealing" | "reveal";

export function AssessmentFlow({ initialCharacterName }: AssessmentFlowProps) {
  const [step, setStep] = useState<FlowStep>("intro");
  const [characterName, setCharacterName] = useState(initialCharacterName || "Adventurer");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [loadingMessage, setLoadingMessage] = useState("Reading your answers...");

  const totalQuestions = QUESTIONS.length;
  const currentQuestion = QUESTIONS[currentQuestionIndex];

  // 1. Begin Assessment from Intro
  const handleBegin = (name: string) => {
    setCharacterName(name);
    setStep("questions");
    setCurrentQuestionIndex(0);
  };

  // 2. Select an option for current question
  const handleSelectOption = (optionId: string) => {
    if (!currentQuestion) return;

    if (currentQuestion.isMultiSelect) {
      const existing = (answers[currentQuestion.id] as string[]) || [];
      let updated: string[];

      if (existing.includes(optionId)) {
        updated = existing.filter((id) => id !== optionId);
      } else {
        const max = currentQuestion.maxSelections || 3;
        if (existing.length >= max) {
          // Replace oldest selection or ignore
          updated = [...existing.slice(1), optionId];
        } else {
          updated = [...existing, optionId];
        }
      }

      setAnswers((prev) => ({
        ...prev,
        [currentQuestion.id]: updated,
      }));
    } else {
      setAnswers((prev) => ({
        ...prev,
        [currentQuestion.id]: optionId,
      }));
    }
  };

  // 3. Navigate forward
  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      // Completed all questions -> initiate dramatic forging animation
      finalizeAssessment();
    }
  };

  // 4. Navigate backward
  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    } else {
      setStep("intro");
    }
  };

  // 5. Finalize and trigger animated reveal
  const finalizeAssessment = () => {
    setStep("revealing");
    setLoadingMessage("Reading your answers...");

    setTimeout(() => {
      setLoadingMessage("Forging your character attributes...");
    }, 800);

    setTimeout(() => {
      setLoadingMessage("Awakening your starting archetype...");
    }, 1600);

    setTimeout(() => {
      const computedResult = calculateAssessmentResult(answers, characterName);
      setResult(computedResult);
      setStep("reveal");
    }, 2400);
  };

  // Check if user has answered current question
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;
  const canContinue = Boolean(
    currentAnswer &&
      (Array.isArray(currentAnswer) ? currentAnswer.length > 0 : currentAnswer.length > 0)
  );

  return (
    <div className="w-full flex items-center justify-center">
      <AnimatePresence mode="wait">
        {step === "intro" && (
          <AssessmentIntro
            key="intro"
            initialCharacterName={characterName}
            onBegin={handleBegin}
          />
        )}

        {step === "questions" && currentQuestion && (
          <AssessmentQuestion
            key={currentQuestion.id}
            question={currentQuestion}
            totalQuestions={totalQuestions}
            selectedAnswer={answers[currentQuestion.id]}
            onSelectOption={handleSelectOption}
            onNext={handleNext}
            onBack={handleBack}
            canGoBack={true}
            canContinue={canContinue}
          />
        )}

        {step === "revealing" && (
          <motion.div
            key="revealing"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="w-full max-w-md mx-auto text-center p-8 rounded-3xl border border-amber-500/30 bg-[#0A0D15]/90 backdrop-blur-xl shadow-[0_0_60px_rgba(245,158,11,0.2)]"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.4)]">
              <Flame className="w-10 h-10 text-amber-400 animate-bounce" />
            </div>

            <h2 className="font-cinzel text-2xl font-bold text-amber-200 mb-2">
              The Forge is Active
            </h2>

            <p className="text-sm font-mono text-slate-300 min-h-[1.5rem] transition-all">
              {loadingMessage}
            </p>

            <div className="w-48 h-1.5 bg-white/10 rounded-full mx-auto mt-6 overflow-hidden">
              <motion.div
                className="h-full bg-amber-400"
                animate={{ x: ["-100%", "100%"] }}
                transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
              />
            </div>
          </motion.div>
        )}

        {step === "reveal" && result && (
          <CharacterReveal key="reveal" result={result} />
        )}
      </AnimatePresence>
    </div>
  );
}
