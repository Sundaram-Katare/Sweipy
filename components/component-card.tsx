"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import LikeButton from "./like-button";
import FavouriteButton from "./faviourite-button";
import { Eye, MessageSquare, ExternalLink, ArrowRight } from "lucide-react";
import { ComponentCard } from "@/types/database";

type Props = {
  component: ComponentCard;
};

export default function ComponentCardUI({ component }: Props) {
  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/component/${component.id}`);
  };

  const creatorAvatar = component.profiles?.avatar_url || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80";
  const creatorUsername = component.profiles?.username || "Anonymous";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onClick={handleCardClick}
      className="
        w-full
        max-w-[340px]
        xs:max-w-[400px]
        sm:max-w-[480px]
        md:max-w-[650px]
        lg:max-w-[700px]
        shrink-0
        rounded-3xl
        border
        border-slate-200/50
        dark:border-zinc-800/80
        bg-white
        dark:bg-zinc-900/90
        p-4
        shadow-[0_10px_35px_-5px_rgba(0,0,0,0.03)]
        dark:shadow-[0_10px_35px_-5px_rgba(0,0,0,0.25)]
        cursor-pointer
        group
        relative
        overflow-hidden
        glow-card
      "
    >
      {/* Creator Info Header */}
      <div className="flex items-center justify-between mb-4.5 px-1">
        <div
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/user/${component.user_id}`);
          }}
          className="flex items-center gap-2.5 hover:opacity-85 transition-opacity cursor-pointer group/creator"
        >
          <img
            src={creatorAvatar}
            alt={creatorUsername}
            className="w-9 h-9 rounded-full object-cover border border-slate-100 dark:border-zinc-800 shadow-xs"
          />
          <div>
            <p className="text-sm font-bold text-slate-800 dark:text-zinc-200 font-sans leading-none">
              {creatorUsername}
            </p>
            <span className="text-[10px] font-semibold text-slate-400 dark:text-zinc-500 font-sans mt-0.5 block uppercase tracking-wider">
              {component.category || "General"}
            </span>
          </div>
        </div>

        {/* Saved/Bookmark Button */}
        <FavouriteButton componentId={component.id} />
      </div>

      {/* Screenshot Preview Image container */}
      <div className="relative rounded-2xl overflow-hidden bg-slate-50 dark:bg-zinc-950 border border-slate-100 dark:border-zinc-800/40">
        <img
          src={component.image_url}
          alt={component.title}
          className="
            h-[260px]
            xs:h-[300px]
            sm:h-[360px]
            md:h-[400px]
            w-full
            object-cover
            transition-transform
            duration-700
            ease-out
            group-hover:scale-103
          "
          loading="lazy"
        />

        {/* Hover overlay detail screen */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-white px-3 py-1.5 rounded-lg bg-white/20 backdrop-blur-sm flex items-center gap-1.5 font-sans">
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Details</span>
            </span>
            {component.preview_url && (
              <a
                href={component.preview_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-xs font-bold text-white px-3 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-1.5 font-sans"
              >
                <span>Live Preview</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Meta Content Footer */}
      <div className="mt-4 px-1 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 dark:text-zinc-100 truncate font-sans tracking-tight">
            {component.title}
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400 font-sans leading-relaxed truncate md:max-w-md">
            {component.description}
          </p>

          {/* Tags */}
          {component.tags && component.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {component.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/45 text-indigo-500 dark:text-indigo-400 font-sans select-none border border-indigo-500/5"
                >
                  #{tag.toLowerCase()}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Interaction Stats Buttons */}
        <div className="flex items-center justify-end gap-3 shrink-0 self-end md:self-center">
          <div className="flex items-center gap-1 text-slate-400 dark:text-zinc-500 px-2.5 py-1.5 rounded-xl text-xs font-semibold select-none font-sans">
            <Eye className="w-4 h-4 text-slate-400 dark:text-zinc-500" />
            <span className="tabular-nums">{component.views_count || 0}</span>
          </div>

          <div className="flex items-center gap-1 text-slate-400 dark:text-zinc-500 px-2.5 py-1.5 rounded-xl text-xs font-semibold select-none font-sans mr-1">
            <MessageSquare className="w-4 h-4 text-slate-400 dark:text-zinc-500" />
            <span className="tabular-nums">{component.comments_count || 0}</span>
          </div>

          <LikeButton
            componentId={component.id}
            initialLikes={component.likes_count || 0}
          />
        </div>
      </div>
    </motion.div>
  );
}