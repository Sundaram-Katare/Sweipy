"use client";

import { useEffect, useState, useRef } from "react";
import { Bell, BellDot, Heart, MessageSquare, UserPlus, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

interface NotificationsMenuProps {
  userId: string;
}

export default function NotificationsMenu({ userId }: NotificationsMenuProps) {
  const supabase = createClient();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Click outside handler
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch initial notifications
  useEffect(() => {
    async function loadNotifications() {
      const { data, error } = await supabase
        .from("notifications")
        .select("*, actor:profiles!notifications_actor_id_fkey(*), component:components(*)")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(10);

      if (!error && data) {
        setNotifications(data);
        setUnreadCount(data.filter((n: any) => !n.read).length);
      }
    }
    loadNotifications();
  }, [userId, supabase]);

  // Real-time subscription to notifications table
  useEffect(() => {
    const channel = supabase
      .channel(`user-notifications-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        async (payload: any) => {
          // Fetch the actor profiles and component details to represent full visual notifications
          const { data: actor } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", payload.new.actor_id)
            .single();

          let component = null;
          if (payload.new.component_id) {
            const { data: comp } = await supabase
              .from("components")
              .select("*")
              .eq("id", payload.new.component_id)
              .single();
            component = comp;
          }

          const fullNotification = {
            ...payload.new,
            actor,
            component,
          };

          setNotifications((prev) => [fullNotification, ...prev]);
          setUnreadCount((c) => c + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, supabase]);

  const handleMarkAllRead = async () => {
    if (unreadCount === 0) return;

    // Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);

    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", userId)
      .eq("read", false);

    if (error) {
      console.error("Failed to mark notifications as read:", error);
    }
  };

  const getNotificationText = (notif: any) => {
    const actorName = notif.actor?.username || "Someone";
    switch (notif.type) {
      case "like":
        return (
          <span>
            <strong className="text-slate-800 dark:text-zinc-200">{actorName}</strong> liked your component{" "}
            <span className="text-indigo-500">{notif.component?.title || "UI section"}</span>
          </span>
        );
      case "comment":
        return (
          <span>
            <strong className="text-slate-800 dark:text-zinc-200">{actorName}</strong> commented on your component:{" "}
            <span className="italic">"{notif.component?.title}"</span>
          </span>
        );
      case "follow":
        return (
          <span>
            <strong className="text-slate-800 dark:text-zinc-200">{actorName}</strong> started following you
          </span>
        );
      default:
        return <span>New activity on your account</span>;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "like":
        return <Heart className="w-4 h-4 text-rose-500 fill-rose-500/20" />;
      case "comment":
        return <MessageSquare className="w-4 h-4 text-indigo-500 fill-indigo-500/10" />;
      case "follow":
        return <UserPlus className="w-4 h-4 text-emerald-500" />;
      default:
        return <Bell className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="relative pl-1" ref={dropdownRef}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) handleMarkAllRead();
        }}
        className="relative flex items-center justify-center w-10 h-10 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white/80 dark:bg-zinc-900/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)] backdrop-blur-sm transition-all focus:outline-hidden cursor-pointer"
        aria-label="Notifications"
      >
        {unreadCount > 0 ? (
          <>
            <BellDot className="w-5 h-5 text-indigo-500 dark:text-indigo-400 fill-indigo-500/10 animate-bounce" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white leading-none">
              {unreadCount}
            </span>
          </>
        ) : (
          <Bell className="w-5 h-5 text-slate-500 dark:text-zinc-400" />
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2.5 w-80 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/50 dark:border-zinc-800/80 shadow-[0_10px_35px_-5px_rgba(0,0,0,0.15)] py-2 z-50 overflow-hidden font-sans"
          >
            <div className="px-4 py-2 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Notifications
              </h4>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-[10px] text-indigo-500 hover:text-indigo-600 font-semibold flex items-center gap-0.5 cursor-pointer"
                >
                  <Check className="w-3 h-3" />
                  <span>Mark all read</span>
                </button>
              )}
            </div>

            <div className="max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-slate-400 dark:text-zinc-500">
                  <p>All quiet here</p>
                  <p className="text-xs mt-0.5">We'll alert you when you get engagement!</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100/50 dark:divide-zinc-800/40">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`
                        px-4
                        py-3
                        flex
                        gap-3
                        items-start
                        transition-all
                        ${notif.read ? "opacity-75" : "bg-indigo-500/5 dark:bg-indigo-500/[0.03]"}
                      `}
                    >
                      <div className="mt-0.5 shrink-0">
                        {getNotificationIcon(notif.type)}
                      </div>
                      <div className="flex-1 min-w-0 text-xs text-slate-600 dark:text-zinc-400 leading-normal">
                        {getNotificationText(notif)}
                        <span className="block text-[9px] text-slate-400 mt-1">
                          {new Date(notif.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
