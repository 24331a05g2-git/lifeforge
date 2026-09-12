"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Quest, QuestStatus } from "@/lib/quests/types";
import {
  CATEGORY_META,
  DIFFICULTY_REWARDS,
  GAME_TYPE_META,
  PRIORITY_META,
} from "@/lib/quests/config";
import { ATTRIBUTE_META } from "@/lib/assessment/scoring";
import {
  Clock,
  Calendar,
  Sword,
  Check,
  RotateCcw,
  Trash2,
  Edit2,
  Sparkles,
  Coins,
  AlertTriangle,
  Play,
  SkipForward,
} from "lucide-react";

interface QuestCardProps {
  quest: Quest;
  onStatusChange: (id: string, newStatus: QuestStatus) => Promise<void>;
  onEdit: (quest: Quest) => void;
  onDelete: (id: string) => Promise<void>;
}

export function QuestCard({
  quest,
  onStatusChange,
  onEdit,
  onDelete,
}: QuestCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const catMeta = CATEGORY_META[quest.category] || CATEGORY_META.other;
  const gameMeta = GAME_TYPE_META[quest.game_type] || GAME_TYPE_META.habit_garden;
  const attrMeta = ATTRIBUTE_META[quest.attribute] || ATTRIBUTE_META.discipline;
  const diffRewards = DIFFICULTY_REWARDS[quest.difficulty] || DIFFICULTY_REWARDS.normal;
  const priorityMeta = PRIORITY_META[quest.priority] || PRIORITY_META.medium;

  const handleAction = async (status: QuestStatus) => {
    setIsUpdating(true);
    try {
      await onStatusChange(quest.id, status);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    setIsUpdating(true);
    try {
      await onDelete(quest.id);
    } finally {
      setIsUpdating(false);
      setConfirmDelete(false);
    }
  };

  // Status visual configurations
  const statusConfig = {
    pending: {
      label: "Pending",
      badge: "border-amber-500/30 bg-amber-500/10 text-amber-300",
      cardBorder: "border-white/[0.08] hover:border-amber-500/40",
      bgGlow: "from-white/[0.02] to-transparent",
    },
    in_progress: {
      label: "In Progress",
      badge: "border-sky-500/40 bg-sky-500/15 text-sky-300 shadow-[0_0_12px_rgba(56,189,248,0.3)]",
      cardBorder: "border-sky-500/50 shadow-[0_0_25px_rgba(56,189,248,0.15)]",
      bgGlow: "from-sky-500/[0.06] to-transparent",
    },
    completed: {
      label: "Completed",
      badge: "border-emerald-500/40 bg-emerald-500/15 text-emerald-300",
      cardBorder: "border-emerald-500/30 opacity-90",
      bgGlow: "from-emerald-500/[0.04] to-transparent",
    },
    skipped: {
      label: "Skipped",
      badge: "border-slate-600 bg-slate-800 text-slate-400",
      cardBorder: "border-white/[0.04] opacity-60",
      bgGlow: "from-white/[0.01] to-transparent",
    },
  }[quest.status];

  return (
    <div
      className={`relative group rounded-2xl border ${statusConfig.cardBorder} bg-gradient-to-b ${statusConfig.bgGlow} bg-[#0A0D15]/90 p-5 sm:p-6 backdrop-blur-xl transition-all duration-300 flex flex-col justify-between`}
    >
      {/* Top Meta Row */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          {/* Category Pill */}
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-medium border ${catMeta.color}`}
            >
              <span>{catMeta.icon}</span>
              <span>{catMeta.label}</span>
            </span>

            {/* Difficulty Badge */}
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono border ${diffRewards.badgeColor}`}
            >
              {diffRewards.label}
            </span>
          </div>

          {/* Priority & Status */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
              <span className={`w-2 h-2 rounded-full ${priorityMeta.dotColor}`} />
              <span className="hidden sm:inline">{priorityMeta.label}</span>
            </div>

            <span
              className={`text-[11px] font-mono px-2 py-0.5 rounded-full border ${statusConfig.badge}`}
            >
              {statusConfig.label}
            </span>
          </div>
        </div>

        {/* Quest Title */}
        <h3
          className={`font-cinzel text-lg sm:text-xl font-bold tracking-wide transition-colors ${
            quest.status === "completed"
              ? "line-through text-slate-400"
              : "text-slate-100 group-hover:text-amber-200"
          }`}
        >
          {quest.title}
        </h3>

        {/* Description */}
        {quest.description && (
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed line-clamp-2">
            {quest.description}
          </p>
        )}
      </div>

      {/* Middle RPG Engine Metadata */}
      <div className="space-y-3 pt-3 border-t border-white/[0.06] mb-5 text-xs font-mono">
        {/* Attribute & Arena mapping banner */}
        <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/[0.04] text-slate-300">
          <div className="flex items-center gap-1.5">
            <span>{attrMeta.icon}</span>
            <span className="text-amber-300 font-semibold">{attrMeta.label}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <span>{gameMeta.icon}</span>
            <span className="hidden sm:inline">{gameMeta.label}</span>
          </div>
        </div>

        {/* Schedule & Duration & Rewards */}
        <div className="flex items-center justify-between gap-2 flex-wrap text-slate-400 text-[11px]">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>{quest.scheduled_date}</span>
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>{quest.estimated_duration}m</span>
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="flex items-center gap-1 text-amber-300 font-semibold">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>+{quest.xp_reward} XP</span>
            </span>
            <span className="flex items-center gap-1 text-amber-300 font-semibold">
              <Coins className="w-3 h-3 text-amber-400" />
              <span>+{quest.gold_reward} G</span>
            </span>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between gap-2">
        {/* State Transition Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {quest.status === "pending" && (
            <>
              <Link
                href={`/quests/${quest.id}/play`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-mono font-bold transition-all shadow-[0_0_15px_rgba(245,158,11,0.25)] hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              >
                <Sword className="w-3.5 h-3.5" />
                <span>Play Quest</span>
              </Link>

              <button
                type="button"
                onClick={() => handleAction("completed")}
                disabled={isUpdating}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-medium transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 disabled:opacity-50"
                title="Mark complete without mini-game session"
              >
                <Check className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Quick Done</span>
              </button>

              <button
                type="button"
                onClick={() => handleAction("skipped")}
                disabled={isUpdating}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/[0.04] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 cursor-pointer"
                title="Skip mission"
                aria-label="Skip mission"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </>
          )}

          {quest.status === "in_progress" && (
            <>
              <Link
                href={`/quests/${quest.id}/play`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 text-white text-xs font-mono font-bold transition-all shadow-[0_0_15px_rgba(56,189,248,0.3)] hover:shadow-[0_0_20px_rgba(56,189,248,0.5)] focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
              >
                <Sword className="w-3.5 h-3.5" />
                <span>Resume Arena</span>
              </Link>

              <button
                type="button"
                onClick={() => handleAction("completed")}
                disabled={isUpdating}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-500/40 text-xs font-mono font-medium transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 disabled:opacity-50"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Complete</span>
              </button>

              <button
                type="button"
                onClick={() => handleAction("pending")}
                disabled={isUpdating}
                className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-slate-200 border border-white/10 text-xs font-mono transition-all cursor-pointer focus:outline-none disabled:opacity-50"
                title="Pause and return to pending"
              >
                <RotateCcw className="w-3 h-3" />
                <span className="hidden sm:inline">Pause</span>
              </button>
            </>
          )}

          {quest.status === "completed" && (
            <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-mono">
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Quest Conquered</span>
            </div>
          )}

          {quest.status === "skipped" && (
            <div className="text-xs font-mono text-slate-500">
              <span>Postponed / Skipped</span>
            </div>
          )}
        </div>

        {/* Edit & Delete Controls */}
        <div className="flex items-center gap-1">
          {quest.status !== "completed" && (
            <button
              type="button"
              onClick={() => onEdit(quest)}
              disabled={isUpdating}
              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-white/[0.04] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 cursor-pointer"
              title="Edit Quest"
              aria-label="Edit Quest"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          )}

          {confirmDelete ? (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleDelete}
                disabled={isUpdating}
                className="px-2 py-1 rounded bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/40 text-[10px] font-mono cursor-pointer"
              >
                Abandon?
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="px-1.5 py-1 text-[10px] text-slate-400 hover:text-white"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              disabled={isUpdating}
              className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 cursor-pointer"
              title="Abandon / Delete Quest"
              aria-label="Abandon / Delete Quest"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
