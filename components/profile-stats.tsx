"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, Heart, Users, X, ArrowRight } from "lucide-react";
import Link from "next/link";
import { getFollowersListAction, getFollowingListAction } from "@/actions/follow";

interface ProfileStatsProps {
  userId: string;
  totalUploads: number;
  totalLikes: number;
  initialFollowers: number;
  initialFollowing: number;
}

export default function ProfileStats({
  userId,
  totalUploads,
  totalLikes,
  initialFollowers,
  initialFollowing,
}: ProfileStatsProps) {
  const [modalType, setModalType] = useState<"followers" | "following" | null>(null);
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<any[]>([]);

  const handleOpenModal = async (type: "followers" | "following") => {
    setModalType(type);
    setLoading(true);
    setList([]);

    try {
      if (type === "followers") {
        const data = await getFollowersListAction(userId);
        setList(data);
      } else {
        const data = await getFollowingListAction(userId);
        setList(data);
      }
    } catch (err) {
      console.error("Failed to load connections list:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setModalType(null);
    setList([]);
  };

  return (
    <>
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 w-full">
        
        {/* Uploads Metric Card */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-200/50 dark:border-zinc-800/60 flex items-center gap-4 select-none">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/10">
            <UploadCloud className="w-5 h-5 text-indigo-500" />
          </div>
          <div>
            <p className="text-2xl font-black font-sans text-slate-800 dark:text-zinc-100 tabular-nums">
              {totalUploads}
            </p>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans">
              Uploads
            </span>
          </div>
        </div>

        {/* Likes Metric Card */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-200/50 dark:border-zinc-800/60 flex items-center gap-4 select-none">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center border border-rose-500/10">
            <Heart className="w-5 h-5 text-rose-500" />
          </div>
          <div>
            <p className="text-2xl font-black font-sans text-slate-800 dark:text-zinc-100 tabular-nums">
              {totalLikes}
            </p>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans">
              Likes Received
            </span>
          </div>
        </div>

        {/* Clickable Followers Metric Card */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleOpenModal("followers")}
          className="glass-panel p-5 rounded-2xl border border-slate-200/50 dark:border-zinc-800/60 flex items-center gap-4 cursor-pointer hover:border-indigo-500/30 transition-colors group select-none"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/10 group-hover:bg-emerald-500/15 transition-colors">
            <Users className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <p className="text-2xl font-black font-sans text-slate-800 dark:text-zinc-100 tabular-nums group-hover:text-indigo-500 transition-colors">
              {initialFollowers}
            </p>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans flex items-center gap-1">
              <span>Followers</span>
              <span className="text-[9px] text-indigo-500/70 lowercase font-normal opacity-0 group-hover:opacity-100 transition-opacity">
                (view)
              </span>
            </span>
          </div>
        </motion.div>

        {/* Clickable Following Metric Card */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleOpenModal("following")}
          className="glass-panel p-5 rounded-2xl border border-slate-200/50 dark:border-zinc-800/60 flex items-center gap-4 cursor-pointer hover:border-indigo-500/30 transition-colors group select-none"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/10 group-hover:bg-amber-500/15 transition-colors">
            <Users className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <p className="text-2xl font-black font-sans text-slate-800 dark:text-zinc-100 tabular-nums group-hover:text-indigo-500 transition-colors">
              {initialFollowing}
            </p>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans flex items-center gap-1">
              <span>Following</span>
              <span className="text-[9px] text-indigo-500/70 lowercase font-normal opacity-0 group-hover:opacity-100 transition-opacity">
                (view)
              </span>
            </span>
          </div>
        </motion.div>

      </div>

      {/* Connections Modal Dialog */}
      <AnimatePresence>
        {modalType && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="absolute inset-0 bg-black/50 backdrop-blur-xs"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.45, bounce: 0.25 }}
              className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-200/50 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md p-6 shadow-2xl z-10 font-sans"
            >
              {/* Close Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800/80 pb-3.5 mb-4">
                <h3 className="text-base font-extrabold text-slate-800 dark:text-zinc-100 capitalize">
                  {modalType === "followers" ? "Followers List" : "Following Creators"}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="p-1 rounded-xl border border-slate-100 dark:border-zinc-800 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-colors cursor-pointer"
                  aria-label="Close modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Content Scrollable Pane */}
              <div className="max-h-[350px] overflow-y-auto pr-1 custom-scrollbar">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-16 space-y-3">
                    <div className="w-9 h-9 border-3 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                    <p className="text-xs text-slate-400">Fetching connections list...</p>
                  </div>
                ) : list.length === 0 ? (
                  <div className="py-16 text-center text-slate-400 space-y-2">
                    <Users className="w-10 h-10 text-slate-300 dark:text-zinc-700 mx-auto" />
                    <p className="text-sm font-bold text-slate-500 dark:text-zinc-400">
                      No creators found
                    </p>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto pl-1">
                      {modalType === "followers"
                        ? "No followers yet. Share frontend components to gain connections!"
                        : "Not following anyone yet. Explore feed templates to follow creators!"}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100/50 dark:divide-zinc-800/40 space-y-1">
                    {list.map((creator: any) => {
                      const avatar = creator.avatar_url || "/default-avatar.avif";
                      return (
                        <div
                          key={creator.id}
                          className="py-3.5 flex items-center justify-between gap-4 group"
                        >
                          {/* Profile Details */}
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={avatar}
                              alt={creator.username}
                              className="w-10 h-10 rounded-full object-cover border border-slate-100 dark:border-zinc-800 shadow-xs shrink-0 bg-slate-50"
                            />
                            <div className="min-w-0 leading-tight">
                              <h4 className="font-bold text-sm text-slate-800 dark:text-zinc-100 truncate">
                                {creator.username}
                              </h4>
                              <p className="text-xs text-slate-400 dark:text-zinc-500 truncate mt-0.5 max-w-[200px]">
                                {creator.bio || "UI sharing community creator."}
                              </p>
                            </div>
                          </div>

                          {/* Action Navigation Link */}
                          <Link
                            href={`/user/${creator.id}`}
                            onClick={handleCloseModal}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 hover:border-indigo-500 dark:hover:border-indigo-500 hover:text-indigo-500 dark:hover:text-indigo-400 text-slate-500 dark:text-zinc-400 hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 text-xs font-semibold font-sans transition-all cursor-pointer"
                          >
                            <span>Profile</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
