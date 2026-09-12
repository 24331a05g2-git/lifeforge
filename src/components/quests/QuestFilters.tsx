"use client";

import React from "react";
import { QuestFilterTab, QuestCategory, QuestDifficulty } from "@/lib/quests/types";
import { CATEGORY_META, DIFFICULTY_REWARDS } from "@/lib/quests/config";
import { Filter, Search } from "lucide-react";

interface QuestFiltersProps {
  activeTab: QuestFilterTab;
  onTabChange: (tab: QuestFilterTab) => void;
  tabCounts: Record<QuestFilterTab, number>;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  selectedDifficulty: string;
  onDifficultyChange: (difficulty: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function QuestFilters({
  activeTab,
  onTabChange,
  tabCounts,
  selectedCategory,
  onCategoryChange,
  selectedDifficulty,
  onDifficultyChange,
  searchQuery,
  onSearchChange,
}: QuestFiltersProps) {
  const tabs: { id: QuestFilterTab; label: string }[] = [
    { id: "today", label: "Today's Quests" },
    { id: "all", label: "All Active" },
    { id: "upcoming", label: "Upcoming" },
    { id: "completed", label: "Completed" },
    { id: "skipped", label: "Skipped" },
  ];

  const categories: QuestCategory[] = [
    "learning",
    "fitness",
    "productivity",
    "personal",
    "creative",
    "social",
    "other",
  ];

  const difficulties: QuestDifficulty[] = ["easy", "normal", "hard", "epic"];

  return (
    <div className="space-y-4">
      {/* Primary Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-white/[0.08] overflow-x-auto no-scrollbar pb-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const count = tabCounts[tab.id] || 0;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-cinzel font-bold tracking-wider transition-all whitespace-nowrap cursor-pointer border-b-2 -mb-[2px] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-t-md ${
                isActive
                  ? "border-amber-400 text-amber-300 bg-amber-500/[0.04]"
                  : "border-transparent text-slate-400 hover:text-slate-200 hover:border-white/20"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[11px] font-mono px-2 py-0.5 rounded-full ${
                  isActive
                    ? "bg-amber-500/20 text-amber-300"
                    : "bg-white/[0.05] text-slate-500"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Secondary Search & Dropdown Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search missions..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-white/10 bg-white/[0.03] text-slate-100 placeholder:text-slate-500 text-xs font-mono focus:outline-none focus:border-amber-400 transition-all"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Category Dropdown */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="appearance-none bg-[#0A0D15] border border-white/10 text-slate-300 text-xs font-mono py-2 pl-3 pr-8 rounded-xl focus:outline-none focus:border-amber-400 cursor-pointer"
              aria-label="Filter by category"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {CATEGORY_META[cat].label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
              <Filter className="w-3 h-3" />
            </div>
          </div>

          {/* Difficulty Dropdown */}
          <div className="relative">
            <select
              value={selectedDifficulty}
              onChange={(e) => onDifficultyChange(e.target.value)}
              className="appearance-none bg-[#0A0D15] border border-white/10 text-slate-300 text-xs font-mono py-2 pl-3 pr-8 rounded-xl focus:outline-none focus:border-amber-400 cursor-pointer"
              aria-label="Filter by difficulty"
            >
              <option value="all">All Difficulties</option>
              {difficulties.map((diff) => (
                <option key={diff} value={diff}>
                  {DIFFICULTY_REWARDS[diff].label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
              <Filter className="w-3 h-3" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
