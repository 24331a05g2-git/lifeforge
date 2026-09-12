"use client";

import React, { useState } from "react";
import { ShopCatalogItem } from "@/lib/economy/types";
import { purchaseShopItemAction } from "@/actions/economy";
import {
  Coins,
  Flame,
  BookOpen,
  Shield,
  Sparkles,
  Zap,
  Flag,
  CheckCircle2,
  Lock,
  Loader2,
  ShoppingBag,
} from "lucide-react";

interface ShopViewProps {
  initialCatalog: ShopCatalogItem[];
  initialGold: number;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Flame,
  BookOpen,
  Shield,
  Sparkles,
  Zap,
  Flag,
};

const RARITY_STYLES: Record<string, { border: string; bg: string; text: string; badge: string }> = {
  uncommon: {
    border: "border-emerald-500/30 hover:border-emerald-500/50",
    bg: "from-emerald-500/[0.06]",
    text: "text-emerald-400",
    badge: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  },
  rare: {
    border: "border-sky-500/30 hover:border-sky-500/50",
    bg: "from-sky-500/[0.06]",
    text: "text-sky-400",
    badge: "border-sky-500/30 bg-sky-500/10 text-sky-300",
  },
  epic: {
    border: "border-purple-500/30 hover:border-purple-500/50",
    bg: "from-purple-500/[0.06]",
    text: "text-purple-400",
    badge: "border-purple-500/30 bg-purple-500/10 text-purple-300",
  },
  legendary: {
    border: "border-amber-500/40 hover:border-amber-500/60",
    bg: "from-amber-500/[0.08]",
    text: "text-amber-400",
    badge: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  },
};

export function ShopView({ initialCatalog, initialGold }: ShopViewProps) {
  const [catalog, setCatalog] = useState<ShopCatalogItem[]>(initialCatalog);
  const [gold, setGold] = useState<number>(initialGold);
  const [purchasingKey, setPurchasingKey] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const handlePurchase = async (item: ShopCatalogItem) => {
    if (item.isOwned || gold < item.price || purchasingKey) return;

    setPurchasingKey(item.key);
    setFeedback(null);

    try {
      const res = await purchaseShopItemAction(item.key);
      if (res.success && res.remainingGold !== undefined) {
        setGold(res.remainingGold);
        setCatalog((prev) =>
          prev.map((it) =>
            it.key === item.key
              ? { ...it, isOwned: true, canAfford: res.remainingGold! >= it.price }
              : { ...it, canAfford: res.remainingGold! >= it.price }
          )
        );
        setFeedback({
          message: `Acquired ${item.name}! Added to your character vault.`,
          type: "success",
        });
      } else {
        setFeedback({
          message: res.error || "Purchase could not be processed.",
          type: "error",
        });
      }
    } catch {
      setFeedback({
        message: "An unexpected error occurred during transaction.",
        type: "error",
      });
    } finally {
      setPurchasingKey(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Vault Balance Card */}
      <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-b from-amber-500/[0.08] via-white/[0.02] to-transparent bg-[#0A0D15]/90 p-6 sm:p-8 backdrop-blur-xl shadow-[0_0_40px_rgba(0,0,0,0.5)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-mono text-amber-400">
              <ShoppingBag className="w-4 h-4" />
              <span className="uppercase tracking-widest font-bold">CITADEL EMPORIUM & VAULT</span>
            </div>
            <h1 className="font-cinzel text-2xl sm:text-3xl font-extrabold text-slate-100">
              Virtual Relics & Badges
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 font-sans">
              Spend hard-earned quest gold on prestige cosmetics. No real-money transactions.
            </p>
          </div>

          {/* Current Gold Counter */}
          <div className="p-4 sm:p-5 rounded-2xl border border-amber-500/40 bg-amber-500/10 backdrop-blur-md flex items-center gap-4 self-start sm:self-auto shadow-[0_0_25px_rgba(245,158,11,0.15)]">
            <div className="w-12 h-12 rounded-xl border border-amber-500/50 bg-amber-500/20 flex items-center justify-center text-amber-300">
              <Coins className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-[11px] font-mono text-amber-400/80 uppercase tracking-widest block">
                YOUR GOLD VAULT
              </span>
              <span className="font-cinzel text-2xl sm:text-3xl font-black text-amber-300">
                {gold}{" "}
                <span className="text-xs font-mono text-amber-400/70 font-normal">GOLD</span>
              </span>
            </div>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`mt-6 p-4 rounded-xl border text-xs font-mono flex items-center justify-between gap-4 ${
              feedback.type === "success"
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                : "border-rose-500/40 bg-rose-500/10 text-rose-300"
            }`}
          >
            <span>{feedback.message}</span>
            <button
              onClick={() => setFeedback(null)}
              className="text-slate-400 hover:text-slate-200 text-sm font-bold"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Catalog Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {catalog.map((item) => {
          const IconComp = ICON_MAP[item.iconName] || Sparkles;
          const rarity = RARITY_STYLES[item.rarity] || RARITY_STYLES.uncommon;
          const isPurchasing = purchasingKey === item.key;

          return (
            <div
              key={item.key}
              className={`relative flex flex-col justify-between rounded-3xl border bg-gradient-to-b ${rarity.bg} via-[#0B0E17]/95 to-[#07080B]/95 p-6 backdrop-blur-xl transition-all duration-300 shadow-xl ${rarity.border}`}
            >
              {/* Item Card Header */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2.5 py-0.5 rounded-full border text-[10px] font-mono uppercase tracking-widest font-bold ${rarity.badge}`}
                  >
                    {item.rarity} • {item.badgeLabel || "Cosmetic"}
                  </span>

                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-400">
                    <Coins className="w-3.5 h-3.5 text-amber-400" />
                    <span>{item.price} G</span>
                  </div>
                </div>

                {/* Visual Icon Emblem */}
                <div className="flex items-center gap-4">
                  <div
                    className={`w-14 h-14 rounded-2xl border flex items-center justify-center transition-all ${
                      item.isOwned
                        ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                        : `${rarity.border} bg-white/[0.04] ${rarity.text}`
                    }`}
                  >
                    <IconComp className="w-7 h-7" />
                  </div>

                  <div className="space-y-0.5">
                    <h3 className="font-cinzel text-lg font-bold text-slate-100">
                      {item.name}
                    </h3>
                    <span className="text-[11px] font-mono text-slate-400">
                      {item.type.replace("cosmetic_", "").toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Lore Description */}
                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Purchase / Owned Action */}
              <div className="mt-6 pt-4 border-t border-white/[0.08]">
                {item.isOwned ? (
                  <button
                    disabled
                    className="w-full py-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 font-mono text-xs font-bold flex items-center justify-center gap-2 cursor-default"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>OWNED IN VAULT</span>
                  </button>
                ) : gold < item.price ? (
                  <button
                    disabled
                    className="w-full py-2.5 rounded-xl border border-white/10 bg-white/[0.02] text-slate-500 font-mono text-xs flex items-center justify-center gap-2 cursor-not-allowed"
                  >
                    <Lock className="w-3.5 h-3.5 text-slate-500" />
                    <span>NEED {item.price - gold} MORE GOLD</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handlePurchase(item)}
                    disabled={isPurchasing}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-cinzel text-xs font-black uppercase tracking-wider shadow-lg shadow-amber-950/40 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isPurchasing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>FORGING REWARD...</span>
                      </>
                    ) : (
                      <>
                        <Coins className="w-4 h-4" />
                        <span>ACQUIRE FOR {item.price} GOLD</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
