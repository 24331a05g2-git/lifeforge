"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Quest, CreateQuestInput, UpdateQuestInput, QuestStatus } from "@/lib/quests/types";
import { createQuestAction, updateQuestAction, updateQuestStatusAction, deleteQuestAction } from "@/actions/quests";
import { QuestCard } from "@/components/quests/QuestCard";
import { ForgeQuestModal } from "@/components/quests/ForgeQuestModal";
import { Sword, Plus, ArrowRight, ShieldAlert, Sparkles } from "lucide-react";

interface TodaysQuestBoardProps {
  initialQuests: Quest[];
  className?: string;
}

export function TodaysQuestBoard({
  initialQuests,
  className = "",
}: TodaysQuestBoardProps) {
  const [quests, setQuests] = useState<Quest[]>(initialQuests);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuest, setEditingQuest] = useState<Quest | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleModalSubmit = async (
    input: CreateQuestInput,
    editId?: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (editId) {
      const updatePayload: UpdateQuestInput = {
        id: editId,
        ...input,
      };
      const res = await updateQuestAction(updatePayload);
      if (res.success && res.data) {
        setQuests((prev) =>
          prev.map((q) => (q.id === editId ? (res.data as Quest) : q))
        );
        setFeedback({ type: "success", message: "Quest modified." });
        return { success: true };
      }
      return { success: false, error: res.error };
    } else {
      const res = await createQuestAction(input);
      if (res.success && res.data) {
        setQuests((prev) => [res.data as Quest, ...prev]);
        setFeedback({ type: "success", message: "New mission forged in your realm." });
        return { success: true };
      }
      return { success: false, error: res.error };
    }
  };

  const handleStatusChange = async (id: string, newStatus: QuestStatus) => {
    const previous = [...quests];
    setQuests((prev) =>
      prev.map((q) => (q.id === id ? { ...q, status: newStatus } : q))
    );

    const res = await updateQuestStatusAction(id, newStatus);
    if (!res.success) {
      setQuests(previous);
      setFeedback({ type: "error", message: res.error || "Could not update quest status." });
    }
  };

  const handleDeleteQuest = async (id: string) => {
    const previous = [...quests];
    setQuests((prev) => prev.filter((q) => q.id !== id));

    const res = await deleteQuestAction(id);
    if (!res.success) {
      setQuests(previous);
      setFeedback({ type: "error", message: res.error || "Could not abandon quest." });
    }
  };

  const handleOpenCreate = () => {
    setEditingQuest(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (quest: Quest) => {
    setEditingQuest(quest);
    setIsModalOpen(true);
  };

  return (
    <div className={`rounded-3xl border border-white/10 bg-[#0A0D15]/90 p-5 sm:p-7 backdrop-blur-xl space-y-6 ${className}`}>
      {/* Header with Title & Quick Forge Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
            <Sword className="w-3.5 h-3.5" />
            <span>DAILY ARENA DIRECTIVE</span>
          </div>
          <h2 className="font-cinzel text-xl sm:text-2xl font-bold text-slate-100">
            Today&apos;s Quests
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Execute these real-world trials to level up your character
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
          {/* View Full Board Link */}
          <Link
            href="/quests"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-white/10 hover:border-amber-400/40 bg-white/[0.03] hover:bg-white/[0.06] text-xs font-mono text-slate-300 hover:text-white transition-all"
          >
            <span>Full Board</span>
            <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
          </Link>

          {/* Quick Forge Quest Button */}
          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-cinzel font-bold text-xs text-slate-950 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-300 hover:to-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Forge Quest</span>
          </button>
        </div>
      </div>

      {/* Feedback Toast */}
      {feedback && (
        <div
          className={`p-3 rounded-xl border text-xs font-mono flex items-center justify-between gap-2 ${
            feedback.type === "success"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
              : "border-red-500/30 bg-red-500/10 text-red-300"
          }`}
        >
          <span>{feedback.message}</span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-[11px] opacity-70 hover:opacity-100 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Quests List / Empty State */}
      {quests.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quests.map((quest) => (
            <QuestCard
              key={quest.id}
              quest={quest}
              onStatusChange={handleStatusChange}
              onEdit={handleOpenEdit}
              onDelete={handleDeleteQuest}
            />
          ))}
        </div>
      ) : (
        <div className="py-12 px-6 rounded-2xl border border-white/[0.06] bg-white/[0.01] text-center space-y-4 max-w-md mx-auto font-mono">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto text-2xl shadow-[0_0_20px_rgba(245,158,11,0.2)]">
            🛡️
          </div>

          <div className="space-y-1">
            <h3 className="font-cinzel text-lg font-bold text-slate-200">
              Your Quest Board Is Clear Today
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Even heroes need a mission. Forge a trial for today to continue building your streak and gaining XP.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-cinzel font-bold text-xs text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Forge Today&apos;s First Quest</span>
          </button>
        </div>
      )}

      {/* Forge / Edit Modal */}
      <ForgeQuestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        initialQuest={editingQuest}
      />
    </div>
  );
}
