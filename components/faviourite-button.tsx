"use client";

import { useState, useEffect } from "react";
import { Bookmark } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { toggleFavoriteAction, getFavoriteStatusAction } from "@/actions/favorites";

type Props = {
  componentId: string;
};

export default function FavouriteButton({
  componentId,
}: Props) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadStatus() {
      try {
        const { isFavorited: favorited } = await getFavoriteStatusAction(componentId);
        setIsFavorited(favorited);
      } catch (err) {
        console.error("Failed to load favorite status:", err);
      }
    }
    loadStatus();
  }, [componentId]);

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Stop parent <Link> redirection

    if (loading) return;

    // Optimistic Update
    const prevIsFavorited = isFavorited;
    setIsFavorited(!prevIsFavorited);
    setLoading(true);

    try {
      const result = await toggleFavoriteAction(componentId);
      if (!result.success) {
        throw new Error(result.error);
      }

      setIsFavorited(result.isFavorited ?? false);
      
      if (result.isFavorited) {
        toast.success("Saved to favorites", { icon: "✨" });
      } else {
        toast.success("Removed from favorites", { icon: "🗑️" });
      }
    } catch (err: any) {
      // Revert optimistic changes
      setIsFavorited(prevIsFavorited);
      toast.error(err.message || "Please login to save components.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={handleFavorite}
      className={`
        flex
        items-center
        justify-center
        w-9
        h-9
        rounded-xl
        border
        transition-all
        cursor-pointer
        ${
          isFavorited
            ? "bg-amber-500/10 border-amber-500/20 text-amber-500 dark:bg-amber-500/20"
            : "bg-slate-50 dark:bg-zinc-800/40 border-slate-200/60 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 hover:text-amber-500"
        }
      `}
    >
      <motion.div
        animate={isFavorited ? { scale: [1, 1.25, 1] } : {}}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <Bookmark
          size={16}
          className={`${isFavorited ? "fill-amber-500 stroke-amber-500" : ""}`}
        />
      </motion.div>
    </motion.button>
  );
}
