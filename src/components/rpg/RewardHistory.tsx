"use client";

import React, { useEffect, useState } from "react";
import { RewardEvent } from "@/lib/rpg/types";
import { getRewardHistoryAction } from "@/actions/rewards";
import { ATTRIBUTE_META } from "@/lib/assessment/scoring";
import { CATEGORY_META } from "@/lib/quests/config";
import { Trophy, Sparkles, Coins, Clock, ShieldCheck } from "lucide-react";

interface RewardHistoryProps {
  initialEvents?: RewardEvent[];
}

export function RewardHistory({ initialEvents = [] }: RewardHistoryProps) {
  const [events, setEvents] = useState<RewardEvent[]>(initialEvents);
  const [loading, setLoading] = useState(initialEvents.length === 0);

  useEffect(() => {
    if (initialEvents.length > 0) return;

    let isMounted = true;
    getRewardHistoryAction(8).then((res) => {
      if (isMounted) {
        if (res.success && res.data) {
          setEvents(res.data);
        }
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [initialEvents]);

  return (
    <div className="rounded-3xl border border-white/10 bg-[#0A0D15]/90 p-6 sm:p-8 backdrop-blur-xl space-y-6">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-cinzel text-lg sm:text-xl font-bold text-slate-100">
              Recent Victories
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">
              The permanent chronicle of your conquered quests
            </p>
          </div>
        </div>

        <span className="text-xs font-mono text-slate-500">
          {events.length} Recorded
        </span>
      </div>

      {loading ? (
        <div className="py-8 text-center text-xs font-mono text-slate-500 animate-pulse">
          Consulting the realm archives...
        </div>
      ) : events.length === 0 ? (
        <div className="py-8 text-center space-y-2">
          <ShieldCheck className="w-8 h-8 text-slate-600 mx-auto" />
          <p className="text-xs font-mono text-slate-400">
            No victories recorded yet.
          </p>
          <p className="text-[11px] text-slate-500">
            Complete a quest in the arena to engrave your first triumph.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((evt) => {
            const attrMeta = ATTRIBUTE_META[evt.attribute] || ATTRIBUTE_META.discipline;
            const cat = (evt.metadata?.category as keyof typeof CATEGORY_META) || "other";
            const catMeta = CATEGORY_META[cat] || CATEGORY_META.other;
            const dateStr = new Date(evt.created_at).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            });

            return (
              <div
                key={evt.id}
                className="p-3.5 sm:p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono"
              >
                {/* Left Side: Category Icon + Title + Date */}
                <div className="flex items-center gap-3">
                  <span className="text-xl" title={catMeta.label}>
                    {catMeta.icon}
                  </span>
                  <div>
                    <h4 className="font-bold text-slate-100 line-clamp-1">
                      {evt.metadata?.quest_title || "Conquered Mission"}
                    </h4>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{dateStr}</span>
                      </span>
                      <span>•</span>
                      <span className="text-slate-500">
                        Lvl {evt.level_after}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Side: Rewards Pills */}
                <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
                  {/* XP */}
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold text-[11px]">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>+{evt.xp_amount} XP</span>
                  </span>

                  {/* Gold */}
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white/[0.04] border border-white/10 text-slate-300 text-[11px]">
                    <Coins className="w-3 h-3 text-amber-400" />
                    <span>+{evt.gold_amount} G</span>
                  </span>

                  {/* Attribute Gain */}
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px]">
                    <span>{attrMeta.icon}</span>
                    <span>+{evt.attribute_amount}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
