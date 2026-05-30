"use client";

import { useState, useEffect } from "react";
import { UserPlus, UserMinus } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { toggleFollowAction, getFollowStatusAction } from "@/actions/follow";
import { createClient } from "@/lib/supabase/client";

interface FollowButtonProps {
  followingId: string;
  onFollowChange?: (isFollowingNow: boolean) => void;
}

export default function FollowButton({
  followingId,
  onFollowChange,
}: FollowButtonProps) {
  const supabase = createClient();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    async function loadStatus() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
        if (user.id !== followingId) {
          const { isFollowing: status } = await getFollowStatusAction(followingId);
          setIsFollowing(status);
        }
      }
      setLoading(false);
    }
    loadStatus();
  }, [followingId, supabase]);

  const handleFollow = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!currentUserId) {
      toast.error("Please login to follow creators.");
      return;
    }

    if (btnLoading) return;

    // Optimistic Update
    const prevIsFollowing = isFollowing;
    setIsFollowing(!prevIsFollowing);
    setBtnLoading(true);

    try {
      const result = await toggleFollowAction(followingId);
      setIsFollowing(result.isFollowing);
      onFollowChange?.(result.isFollowing);
      
      if (result.isFollowing) {
        toast.success("Followed creator", { icon: "🤝" });
      } else {
        toast.success("Unfollowed creator", { icon: "👋" });
      }
    } catch (err: any) {
      // Revert optimistic changes
      setIsFollowing(prevIsFollowing);
      toast.error(err.message || "Failed to toggle follow status.");
    } finally {
      setBtnLoading(false);
    }
  };

  // Hide button if viewing own profile
  if (loading || currentUserId === followingId) return null;

  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={handleFollow}
      className={`
        flex
        items-center
        gap-1.5
        px-5
        py-2.5
        rounded-xl
        text-sm
        font-bold
        font-sans
        transition-all
        cursor-pointer
        shadow-sm
        ${
          isFollowing
            ? "bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200"
            : "bg-indigo-500 hover:bg-indigo-600 text-white shadow-indigo-500/10"
        }
      `}
    >
      {isFollowing ? (
        <>
          <UserMinus className="w-4 h-4" />
          <span>Unfollow</span>
        </>
      ) : (
        <>
          <UserPlus className="w-4 h-4" />
          <span>Follow</span>
        </>
      )}
    </motion.button>
  );
}
