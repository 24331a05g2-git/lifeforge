"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  CheckCheck,
  Flame,
  Sword,
  Sparkles,
  Compass,
  Sliders,
  X,
  ExternalLink,
  Clock,
  Shield,
  Check,
} from "lucide-react";
import { NotificationItem, NotificationPreferences } from "@/lib/notifications/types";
import {
  getNotificationsAction,
  markNotificationReadAction,
  markAllNotificationsReadAction,
  getNotificationPreferencesAction,
  updateNotificationPreferencesAction,
} from "@/actions/notifications";

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeView, setActiveView] = useState<"alerts" | "settings">("alerts");
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Preferences state
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [isSavingPrefs, setIsSavingPrefs] = useState(false);
  const [prefsSavedMessage, setPrefsSavedMessage] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Load initial notifications on mount
  useEffect(() => {
    loadNotifications();
    loadPreferences();
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const loadNotifications = async () => {
    try {
      const res = await getNotificationsAction(20);
      if (res.success && res.data) {
        setNotifications(res.data.notifications);
        setUnreadCount(res.data.unreadCount);
      }
    } catch (err) {
      console.error("Failed to load notifications:", err);
    }
  };

  const loadPreferences = async () => {
    try {
      const res = await getNotificationPreferencesAction();
      if (res.success && res.data) {
        setPreferences(res.data);
      }
    } catch (err) {
      console.error("Failed to load notification preferences:", err);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
    await markNotificationReadAction(id);
  };

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    await markAllNotificationsReadAction();
  };

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!preferences) return;
    setIsSavingPrefs(true);
    setPrefsSavedMessage(false);

    try {
      const res = await updateNotificationPreferencesAction(preferences);
      if (res.success && res.data) {
        setPreferences(res.data);
        setPrefsSavedMessage(true);
        setTimeout(() => setPrefsSavedMessage(false), 3000);
      }
    } catch (err) {
      console.error("Failed to update preferences:", err);
    } finally {
      setIsSavingPrefs(false);
    }
  };

  const renderIcon = (type: string) => {
    switch (type) {
      case "streak_alert":
        return <Flame className="w-4 h-4 text-orange-400" />;
      case "quest_reminder":
        return <Sword className="w-4 h-4 text-amber-400" />;
      case "progression":
        return <Sparkles className="w-4 h-4 text-emerald-400" />;
      case "aria_guidance":
        return <Compass className="w-4 h-4 text-cyan-400" />;
      default:
        return <Bell className="w-4 h-4 text-slate-400" />;
    }
  };

  const formatTimestamp = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMins / 60);

      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    } catch {
      return "";
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) {
            loadNotifications();
          }
        }}
        className={`relative p-2 rounded-lg border transition-all cursor-pointer ${
          isOpen
            ? "border-amber-500/60 bg-amber-500/20 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
            : "border-white/10 hover:border-amber-500/40 bg-white/[0.03] hover:bg-white/[0.06] text-slate-300 hover:text-amber-300"
        }`}
        title="Citadel Dispatches"
        aria-label="Open notifications"
      >
        <Bell className="w-4 h-4" />

        {/* Unread Counter Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-amber-500 text-[10px] font-mono font-bold text-slate-950 shadow-[0_0_8px_rgba(245,158,11,0.8)] animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Modal Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl border border-white/10 bg-[#0B0E17]/95 backdrop-blur-2xl shadow-[0_15px_50px_rgba(0,0,0,0.7)] z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.08] bg-white/[0.02]">
              <div className="flex items-center gap-2">
                <span className="font-cinzel text-xs font-bold tracking-widest text-amber-400 uppercase">
                  {activeView === "alerts" ? "Citadel Dispatches" : "Dispatch Settings"}
                </span>
                {activeView === "alerts" && unreadCount > 0 && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {unreadCount} NEW
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() =>
                    setActiveView(activeView === "alerts" ? "settings" : "alerts")
                  }
                  className={`p-1.5 rounded-lg border text-xs transition-colors ${
                    activeView === "settings"
                      ? "border-amber-500/40 bg-amber-500/20 text-amber-300"
                      : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]"
                  }`}
                  title={activeView === "alerts" ? "Preferences" : "Back to Alerts"}
                  aria-label="Toggle settings"
                >
                  <Sliders className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]"
                  aria-label="Close panel"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* View 1: Alerts List */}
            {activeView === "alerts" && (
              <div className="max-h-96 overflow-y-auto divide-y divide-white/[0.04]">
                {/* Secondary Actions Bar */}
                {notifications.length > 0 && (
                  <div className="px-4 py-2 flex items-center justify-between bg-white/[0.01] text-[11px] font-mono">
                    <span className="text-slate-400">Recent Realm Notices</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="inline-flex items-center gap-1 text-amber-400/90 hover:text-amber-300 font-bold hover:underline cursor-pointer"
                      >
                        <CheckCheck className="w-3 h-3" />
                        <span>Mark all read</span>
                      </button>
                    )}
                  </div>
                )}

                {notifications.length === 0 ? (
                  <div className="py-12 px-6 text-center space-y-2">
                    <div className="w-10 h-10 rounded-full bg-white/[0.03] border border-white/10 flex items-center justify-center mx-auto text-slate-500">
                      <Bell className="w-4 h-4" />
                    </div>
                    <p className="font-cinzel text-sm text-slate-300 font-bold">
                      Citadel is Peaceful
                    </p>
                    <p className="text-xs text-slate-400 font-sans">
                      No notifications at this time. Forge on with your quests!
                    </p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => !n.read && handleMarkAsRead(n.id)}
                      className={`p-4 transition-colors cursor-pointer flex gap-3 items-start ${
                        n.read
                          ? "bg-transparent opacity-75 hover:bg-white/[0.02]"
                          : "bg-amber-500/[0.04] hover:bg-amber-500/[0.08]"
                      }`}
                    >
                      {/* Icon */}
                      <div className="mt-0.5 p-2 rounded-xl bg-white/[0.04] border border-white/10 flex-shrink-0">
                        {renderIcon(n.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-xs font-cinzel font-bold text-slate-100 truncate">
                            {n.title}
                          </h4>
                          <span className="text-[10px] font-mono text-slate-400 flex-shrink-0">
                            {formatTimestamp(n.created_at)}
                          </span>
                        </div>

                        <p className="text-xs text-slate-300 font-sans line-clamp-2 leading-relaxed">
                          {n.message}
                        </p>

                        {/* Action link if available */}
                        {n.action_url && n.action_label && (
                          <div className="pt-1">
                            <Link
                              href={n.action_url}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!n.read) handleMarkAsRead(n.id);
                                setIsOpen(false);
                              }}
                              className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-amber-400 hover:text-amber-300 hover:underline"
                            >
                              <span>{n.action_label}</span>
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                          </div>
                        )}
                      </div>

                      {/* Unread indicator dot */}
                      {!n.read && (
                        <div className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.8)] mt-1.5 flex-shrink-0" />
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* View 2: Settings & Quiet Hours */}
            {activeView === "settings" && preferences && (
              <form onSubmit={handleSavePreferences} className="p-4 space-y-4 max-h-96 overflow-y-auto">
                <div className="space-y-3 font-sans text-xs">
                  {/* Master Switch */}
                  <label className="flex items-center justify-between p-2.5 rounded-xl border border-white/10 bg-white/[0.02]">
                    <span className="text-slate-200 font-medium">In-App Notifications</span>
                    <input
                      type="checkbox"
                      checked={preferences.enabled}
                      onChange={(e) =>
                        setPreferences({ ...preferences, enabled: e.target.checked })
                      }
                      className="accent-amber-500 w-4 h-4 cursor-pointer"
                    />
                  </label>

                  {/* Quiet Hours Toggle & Range */}
                  <div className="p-3 rounded-xl border border-white/10 bg-white/[0.02] space-y-2.5">
                    <label className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-slate-200 font-medium">Quiet Hours</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={preferences.quiet_hours_enabled}
                        onChange={(e) =>
                          setPreferences({
                            ...preferences,
                            quiet_hours_enabled: e.target.checked,
                          })
                        }
                        className="accent-amber-500 w-4 h-4 cursor-pointer"
                      />
                    </label>

                    {preferences.quiet_hours_enabled && (
                      <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                        <div>
                          <span className="text-slate-400 block mb-1">Silence from:</span>
                          <input
                            type="time"
                            value={preferences.quiet_hours_start}
                            onChange={(e) =>
                              setPreferences({
                                ...preferences,
                                quiet_hours_start: e.target.value,
                              })
                            }
                            className="w-full px-2 py-1 rounded bg-black/40 border border-white/10 text-slate-200 focus:outline-none focus:border-amber-500"
                          />
                        </div>
                        <div>
                          <span className="text-slate-400 block mb-1">Resume at:</span>
                          <input
                            type="time"
                            value={preferences.quiet_hours_end}
                            onChange={(e) =>
                              setPreferences({
                                ...preferences,
                                quiet_hours_end: e.target.value,
                              })
                            }
                            className="w-full px-2 py-1 rounded bg-black/40 border border-white/10 text-slate-200 focus:outline-none focus:border-amber-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Daily Max Limit */}
                  <div className="p-3 rounded-xl border border-white/10 bg-white/[0.02] space-y-1.5">
                    <div className="flex justify-between items-center text-slate-200">
                      <span className="font-medium">Daily Limit</span>
                      <span className="font-mono text-amber-400 font-bold">
                        {preferences.max_daily_notifications} / day
                      </span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={10}
                      value={preferences.max_daily_notifications}
                      onChange={(e) =>
                        setPreferences({
                          ...preferences,
                          max_daily_notifications: parseInt(e.target.value, 10),
                        })
                      }
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>

                  {/* Channel Categories */}
                  <div className="p-3 rounded-xl border border-white/10 bg-white/[0.02] space-y-2">
                    <span className="text-slate-400 font-mono text-[11px] block uppercase tracking-wider">
                      Categories
                    </span>

                    <label className="flex items-center justify-between text-slate-300">
                      <span>Streak Defense Alerts</span>
                      <input
                        type="checkbox"
                        checked={preferences.streak_alerts}
                        onChange={(e) =>
                          setPreferences({
                            ...preferences,
                            streak_alerts: e.target.checked,
                          })
                        }
                        className="accent-amber-500 w-4 h-4 cursor-pointer"
                      />
                    </label>

                    <label className="flex items-center justify-between text-slate-300">
                      <span>Quest Reminders</span>
                      <input
                        type="checkbox"
                        checked={preferences.quest_reminders}
                        onChange={(e) =>
                          setPreferences({
                            ...preferences,
                            quest_reminders: e.target.checked,
                          })
                        }
                        className="accent-amber-500 w-4 h-4 cursor-pointer"
                      />
                    </label>

                    <label className="flex items-center justify-between text-slate-300">
                      <span>ARIA Guidance & Tips</span>
                      <input
                        type="checkbox"
                        checked={preferences.aria_tips}
                        onChange={(e) =>
                          setPreferences({
                            ...preferences,
                            aria_tips: e.target.checked,
                          })
                        }
                        className="accent-amber-500 w-4 h-4 cursor-pointer"
                      />
                    </label>
                  </div>
                </div>

                {/* Submit button */}
                <div className="pt-2 flex items-center justify-between">
                  {prefsSavedMessage ? (
                    <span className="inline-flex items-center gap-1 text-emerald-400 font-mono text-xs">
                      <Check className="w-3.5 h-3.5" />
                      <span>Preferences saved</span>
                    </span>
                  ) : (
                    <span />
                  )}

                  <button
                    type="submit"
                    disabled={isSavingPrefs}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-cinzel text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isSavingPrefs ? "Saving..." : "Save Settings"}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
