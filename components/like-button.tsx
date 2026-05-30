"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { toggleLikeAction, getLikeStatusAction } from "@/actions/likes";

type Props = {
  componentId: string;
  initialLikes: number;
};

export default function LikeButton({
  componentId,
  initialLikes,
}: Props) {
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch initial like status for logged in user
    async function loadStatus() {
      try {
        const { isLiked: liked } = await getLikeStatusAction(componentId);
        setIsLiked(liked);
      } catch (err) {
        console.error("Failed to load like status:", err);
      }
    }
    loadStatus();
  }, [componentId]);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Avoid triggering parent <Link> routes

    if (loading) return;

    // Optimistic Update
    const prevIsLiked = isLiked;
    const prevLikes = likes;

    setIsLiked(!prevIsLiked);
    setLikes(prevIsLiked ? Math.max(0, prevLikes - 1) : prevLikes + 1);
    setLoading(true);

    try {
      const result = await toggleLikeAction(componentId);
      setIsLiked(result.isLiked);
      
      if (result.isLiked) {
        toast.success("Added to likes", { icon: "❤️" });
      } else {
        toast.success("Removed from likes", { icon: "💔" });
      }
    } catch (err: any) {
      // Revert optimistic changes
      setIsLiked(prevIsLiked);
      setLikes(prevLikes);
      toast.error(err.message || "Please login to like components.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={handleLike}
      className={`
        flex
        items-center
        gap-1.5
        px-3
        py-1.5
        rounded-xl
        border
        transition-all
        cursor-pointer
        font-sans
        text-sm
        font-semibold
        ${
          isLiked
            ? "bg-rose-500/10 border-rose-500/20 text-rose-500 dark:bg-rose-500/20"
            : "bg-slate-50 dark:bg-zinc-800/40 border-slate-200/60 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 hover:text-rose-500"
        }
      `}
    >
      <motion.div
        animate={isLiked ? { scale: [1, 1.3, 1] } : {}}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <Heart
          size={16}
          className={`${isLiked ? "fill-rose-500 stroke-rose-500" : ""}`}
        />
      </motion.div>

      <span className="tabular-nums">{likes}</span>
    </motion.button>
  );
}