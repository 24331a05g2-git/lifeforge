"use client";

import React, { useState, useMemo } from "react";
import {
  CreateQuestInput,
  Quest,
  QuestFilterTab,
  QuestStatus,
  UpdateQuestInput,
} from "@/lib/quests/types";
import {
  createQuestAction,
  deleteQuestAction,
  updateQuestAction,
  updateQuestStatusAction,
} from "@/actions/quests";
import { QuestCard } from "./QuestCard";
import { QuestFilters } from "./QuestFilters";
import { ForgeQuestModal } from "./ForgeQuestModal";
import { Sword, Plus, AlertCircle, Sparkles, CheckCircle2 } from "lucide-react";

interface QuestBoardProps {
  initialQuests: Quest[];
  userEmail?: string;
}

export function QuestBoard({ initialQuests }: QuestBoardProps) {
  const [quests, setQuests] = useState<Quest[]>(initialQuests);
  const [activeTab, setActiveTab] = useState<QuestFilterTab>("today");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuest, setEditingQuest] = useState<Quest | null>(null);

  // Notifications / Feedback
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );

  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);

  // Filter tab counts
  const tabCounts = useMemo(() => {
    return {
      today: quests.filter((q) => q.scheduled_date === todayStr && q.status !== "completed").length,
      all: quests.filter((q) => q.status === "pending" || q.status === "in_progress").length,
      upcoming: quests.filter((q) => q.scheduled_date > todayStr && (q.status === "pending" || q.status === "in_progress")).length,
      completed: quests.filter((q) => q.status === "completed").length,
      skipped: quests.filter((q) => q.status === "skipped").length,
    };
  }, [quests, todayStr]);

  // Filtered Quests calculation
  const filteredQuests = useMemo(() => {
    return quests.filter((q) => {
      // 1. Tab filtering
      if (activeTab === "today") {
        if (q.scheduled_date !== todayStr) return false;
      } else if (activeTab === "all") {
        if (q.status === "completed" || q.status === "skipped") return false;
      } else if (activeTab === "upcoming") {
        if (q.scheduled_date <= todayStr || q.status === "completed" || q.status === "skipped") return false;
      } else if (activeTab === "completed") {
        if (q.status !== "completed") return false;
      } else if (activeTab === "skipped") {
        if (q.status !== "skipped") return false;
      }

      // 2. Category filtering
      if (selectedCategory !== "all" && q.category !== selectedCategory) {
        return false;
      }

      // 3. Difficulty filtering
      if (selectedDifficulty !== "all" && q.difficulty !== selectedDifficulty) {
        return false;
      }

      // 4. Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = q.title.toLowerCase().includes(query);
        const matchesDesc = q.description?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc) return false;
      }

      return true;
    });
  }, [quests, activeTab, selectedCategory, selectedDifficulty, searchQuery, todayStr]);

  // Handle Create / Edit Submission
  const handleModalSubmit = async (
    input: CreateQuestInput,
    editId?: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (editId) {
      // Update existing quest
      const updatePayload: UpdateQuestInput = {
        id: editId,
        ...input,
      };

      const res = await updateQuestAction(updatePayload);
      if (res.success && res.data) {
        setQuests((prev) =>
          prev.map((q) => (q.id === editId ? (res.data as Quest) : q))
        );
        setFeedback({ type: "success", message: "Quest modified successfully." });
        return { success: true };
      }
      return { success: false, error: res.error };
    } else {
      // Create new quest
      const res = await createQuestAction(input);
      if (res.success && res.data) {
        setQuests((prev) => [res.data as Quest, ...prev]);
        setFeedback({ type: "success", message: "New mission forged in the realm archive." });
        return { success: true };
      }
      return { success: false, error: res.error };
    }
  };

  // Handle Status Transition with Optimistic UI & Revert on Failure
  const handleStatusChange = async (id: string, newStatus: QuestStatus) => {
    const previousQuests = [...quests];

    // Optimistic Update
    setQuests((prev) =>
      prev.map((q) => {
        if (q.id === id) {
          return {
            ...q,
            status: newStatus,
            completed_at: newStatus === "completed" ? new Date().toISOString() : null,
          };
        }
        return q;
      })
    );

    const res = await updateQuestStatusAction(id, newStatus);
    if (!res.success) {
      // Revert optimistic update
      setQuests(previousQuests);
      setFeedback({
        type: "error",
        message: res.error || "The Forge could not update your mission status.",
      });
    } else if (res.data) {
      setQuests((prev) =>
        prev.map((q) => (q.id === id ? (res.data as Quest) : q))
      );
    }
  };

  // Handle Deletion with Optimistic UI
  const handleDeleteQuest = async (id: string) => {
    const previousQuests = [...quests];
    setQuests((prev) => prev.filter((q) => q.id !== id));

    const res = await deleteQuestAction(id);
    if (!res.success) {
      setQuests(previousQuests);
      setFeedback({
        type: "error",
        message: res.error || "The Forge could not abandon this mission.",
      });
    } else {
      setFeedback({ type: "success", message: "Mission abandoned and removed from board." });
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
    <div className="space-y-8">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-amber-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>REAL-WORLD QUEST ENGINE</span>
          </div>
          <h1 className="font-cinzel text-3xl sm:text-4xl font-extrabold text-gold-gradient tracking-wide">
            The Quest Board
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Every real-world activity forges your character. Choose your trials wisely.
          </p>
        </div>

        {/* Forge Quest CTA */}
        <button
          type="button"
          onClick={handleOpenCreate}
          className="group relative inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl font-cinzel font-bold text-xs sm:text-sm text-slate-950 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-300 hover:to-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.4)] hover:shadow-[0_0_35px_rgba(245,158,11,0.6)] transition-all cursor-pointer active:scale-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-400 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Forge a Quest</span>
        </button>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xl border text-xs sm:text-sm flex items-center justify-between gap-3 ${
            feedback.type === "success"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
              : "border-red-500/30 bg-red-500/10 text-red-300"
          }`}
          role="status"
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-xs opacity-70 hover:opacity-100 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Filter Tabs & Selectors */}
      <QuestFilters
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tabCounts={tabCounts}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedDifficulty={selectedDifficulty}
        onDifficultyChange={setSelectedDifficulty}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Quest Grid */}
      {filteredQuests.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredQuests.map((quest) => (
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
        /* Empty State Views */
        <div className="text-center py-16 px-4 rounded-3xl border border-white/[0.06] bg-[#0A0D15]/60 backdrop-blur-md max-w-lg mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto text-2xl shadow-[0_0_20px_rgba(245,158,11,0.2)]">
            🛡️
          </div>

          <div className="space-y-1.5">
            {quests.length === 0 ? (
              <>
                <h3 className="font-cinzel text-xl font-bold text-slate-200">
                  Your quest board is empty.
                </h3>
                <p className="text-xs sm:text-sm text-slate-400">
                  Even heroes need a mission. Forge your first real-world trial to begin leveling.
                </p>
              </>
            ) : activeTab === "today" ? (
              <>
                <h3 className="font-cinzel text-xl font-bold text-slate-200">
                  Today&apos;s board is clear.
                </h3>
                <p className="text-xs sm:text-sm text-slate-400">
                  Your next adventure is waiting. Schedule a mission for today to continue your streak.
                </p>
              </>
            ) : (
              <>
                <h3 className="font-cinzel text-xl font-bold text-slate-200">
                  No missions found.
                </h3>
                <p className="text-xs sm:text-sm text-slate-400">
                  No quests match your selected filter. Adjust your criteria or forge a new mission.
                </p>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-cinzel font-bold text-xs sm:text-sm text-slate-950 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-300 hover:to-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all cursor-pointer active:scale-95"
          >
            <Sword className="w-4 h-4" />
            <span>Forge Your First Quest</span>
          </button>
        </div>
      )}

      {/* Forge / Edit Quest Modal */}
      <ForgeQuestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        initialQuest={editingQuest}
      />
    </div>
  );
}
