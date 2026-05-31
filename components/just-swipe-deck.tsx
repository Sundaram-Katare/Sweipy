"use client";

import { useState, useEffect } from "react";
import { motion, useMotionValue, useTransform, useAnimation, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Zap, RefreshCw, Star, Heart, Bookmark, Eye, MessageSquare, ExternalLink, X } from "lucide-react";
import Link from "next/link";
import { ComponentCard } from "@/types/database";
import LikeButton from "./like-button";
import FavouriteButton from "./faviourite-button";
import { useRouter } from "next/navigation";
import CommentSection from "@/components/comment-section";

type Props = {
  components: ComponentCard[];
};

export default function JustSwipeDeck({ components }: Props) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  
  // Motion values for swipe gestures
  const x = useMotionValue(0);
  const controls = useAnimation();

  // Dynamic transforms based on drag displacement
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0.6, 1, 1, 1, 0.6]);

  // Stamp indicator opacity transforms
  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const nopeOpacity = useTransform(x, [-100, 0], [1, 0]);

  const activeComponent = components[currentIndex];
  // Calculate index of the next stacked preview card (loops indefinitely)
  const nextIndex = components.length > 0 ? (currentIndex + 1) % components.length : 0;
  const nextComponent = components[nextIndex];

  // Swiping mechanics handler
  const handleSwipe = async (direction: "left" | "right") => {
    setSwipeDirection(direction);
    setIsCommentsOpen(false); // Close comments on swipe
    
    // Animate active card out in the swiped direction
    await controls.start({
      x: direction === "right" ? 500 : -500,
      opacity: 0,
      rotate: direction === "right" ? 25 : -25,
      transition: { duration: 0.35, ease: "easeOut" }
    });

    // Reset motion value coordinate
    x.set(0);

    // Increment index (loop to beginning if end is reached)
    setCurrentIndex((prev) => (prev + 1) % components.length);
    setSwipeDirection(null);

    // Instant reset controls position
    controls.set({ x: 0, opacity: 1, rotate: 0 });
  };

  // Keyboard navigation event triggers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (components.length === 0 || isCommentsOpen) return;
      if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") {
        return; // Avoid hijacking comments inputs
      }

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        handleSwipe("left");
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleSwipe("right");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, components, isCommentsOpen]);

  const creatorAvatar = activeComponent?.profiles?.avatar_url || "/default-avatar.avif";
  const creatorUsername = activeComponent?.profiles?.username || "Anonymous";

  if (components.length === 0) {
    return (
      <div className="flex-1 w-full max-w-md mx-auto px-6 py-20 text-center flex flex-col items-center justify-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/25">
          <Zap className="w-8 h-8 text-indigo-500 animate-pulse" />
        </div>
        <div>
          <h2 className="text-2xl font-black font-sans dark:text-zinc-100">No Cards Uploaded Yet</h2>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-2 leading-relaxed">
            There are no template flashcards in the database to swipe currently. Be the first to upload one!
          </p>
        </div>
        <Link
          href="/upload"
          className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-bold shadow-md shadow-indigo-500/10 transition-all font-sans"
        >
          Upload UI Section
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto px-6 py-8 flex flex-col items-center justify-center space-y-8 min-h-[calc(100vh-8rem)]">
      
      {/* Visual Header */}
      <div className="text-center space-y-2 select-none">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/15 text-indigo-500 dark:text-indigo-400 border border-indigo-500/10 text-xs font-bold font-sans tracking-wide uppercase">
          <Zap className="w-3.5 h-3.5 fill-indigo-500/10" />
          <span>JustSwipe Mode</span>
        </div>
        <p className="text-xs text-slate-400 dark:text-zinc-500 font-sans font-medium">
          Slide templates with arrows or gestures. Addictive, clean layouts.
        </p>
      </div>

      {/* Main Swipe viewport area */}
      <div className="relative w-full max-w-[360px] xs:max-w-[420px] sm:max-w-[480px] md:max-w-[620px] lg:max-w-[660px] h-[480px] xs:h-[530px] sm:h-[590px] md:h-[630px] flex items-center justify-center">
        
        {/* Background Card Preview (Stack effect) */}
        {components.length > 1 && nextComponent && (
          <div className="absolute w-full h-full scale-[0.94] translate-y-6 z-0 opacity-40 blur-[0.5px] pointer-events-none select-none rounded-3xl border border-slate-200/50 dark:border-zinc-800/80 bg-white dark:bg-zinc-800/90 p-4 shadow-md transition-all duration-300">
            {/* Header placeholder */}
            <div className="flex items-center gap-3 mb-4.5">
              <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-zinc-800" />
              <div className="space-y-1.5 flex-1">
                <div className="h-3.5 w-24 bg-slate-150 dark:bg-zinc-800 rounded-md" />
                <div className="h-2.5 w-16 bg-slate-100 dark:bg-zinc-800/60 rounded-md" />
              </div>
            </div>
            {/* Image placeholder */}
            <div className="w-full h-[260px] xs:h-[300px] sm:h-[360px] md:h-[400px] bg-slate-100 dark:bg-zinc-950 rounded-2xl overflow-hidden">
              <img
                src={nextComponent.image_url}
                alt="Stacked card preview"
                className="w-full h-full object-cover opacity-50"
              />
            </div>
            {/* Footer placeholder */}
            <div className="mt-4 space-y-2">
              <div className="h-5 w-40 bg-slate-150 dark:bg-zinc-800 rounded-md" />
              <div className="h-3.5 w-full bg-slate-100 dark:bg-zinc-800/60 rounded-md" />
            </div>
          </div>
        )}

        {/* Foreground Swipable Card */}
        <motion.div
          style={{ x, rotate, opacity }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.8}
          onDragEnd={(_, info) => {
            const swipeThreshold = 140;
            if (info.offset.x > swipeThreshold) {
              handleSwipe("right");
            } else if (info.offset.x < -swipeThreshold) {
              handleSwipe("left");
            } else {
              // Return to center spring
              controls.start({ x: 0, rotate: 0, opacity: 1 });
            }
          }}
          animate={controls}
          className="
            absolute
            w-full
            h-full
            z-10
            rounded-3xl
            border
            border-slate-200/50
            dark:border-zinc-800/80
            bg-white
            dark:bg-zinc-800/90
            p-4
            shadow-[0_12px_40px_rgba(0,0,0,0.06)]
            dark:shadow-[0_12px_40px_rgba(0,0,0,0.3)]
            cursor-grab
            active:cursor-grabbing
            relative
            overflow-hidden
            group
          "
        >
          <div className="flex items-center justify-between mb-4.5 px-1 select-none">
            <div
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/user/${activeComponent.user_id}`);
              }}
              className="flex items-center gap-2.5 hover:opacity-85 transition-opacity cursor-pointer group/creator"
            >
              <img
                src={creatorAvatar}
                alt={creatorUsername}
                className="w-9 h-9 rounded-full object-cover border border-slate-100 dark:border-zinc-800 shadow-xs shrink-0"
              />
              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-zinc-200 font-sans leading-none">
                  {creatorUsername}
                </p>
                <span className="text-[10px] font-semibold text-slate-400 dark:text-zinc-500 font-sans mt-0.5 block uppercase tracking-wider">
                  {activeComponent.category || "General"}
                </span>
              </div>
            </div>

            {/* Saved Bookmark Button */}
            <FavouriteButton componentId={activeComponent.id} />
          </div>

          {/* Screen Image Preview (stops drag triggers inside links) */}
          <div 
            onPointerDown={(e) => e.stopPropagation()} 
            className="relative rounded-2xl overflow-hidden bg-slate-50 dark:bg-zinc-950 border border-slate-100 dark:border-zinc-800/40 select-none"
          >
            <img
              src={activeComponent.image_url}
              alt={activeComponent.title}
              className="
                h-[260px]
                xs:h-[300px]
                sm:h-[360px]
                md:h-[400px]
                w-full
                object-cover
                pointer-events-none
              "
            />
            {/* Overlay detail redirects */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
              <div className="flex items-center gap-3">
                {/* <Link
                  href={`/component/${activeComponent.id}`}
                  className="text-xs font-bold text-white px-4 py-2 rounded-xl bg-white/20 backdrop-blur-sm flex items-center gap-1.5 font-sans"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Inspect Code</span>
                </Link> */}
                {activeComponent.preview_url && (
                  <a
                    href={activeComponent.preview_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-white px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 shadow-md shadow-indigo-500/20 transition-colors flex items-center gap-1.5 font-sans"
                  >
                    <span>Live Preview</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Card Meta Content Footer */}
          <div className="mt-4 px-1 flex flex-col md:flex-row md:items-center justify-between gap-4 select-none">
            <div className="min-w-0">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 dark:text-zinc-100 truncate font-sans tracking-tight">
                {activeComponent.title}
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400 font-sans leading-relaxed truncate md:max-w-xs">
                {activeComponent.description}
              </p>
            </div>

            {/* Interactions buttons (stoppointerdown prevents drag conflicts) */}
            <div 
              onPointerDown={(e) => e.stopPropagation()} 
              className="flex items-center justify-end gap-3 shrink-0 self-end md:self-center"
            >
              <div className="flex items-center gap-1 text-slate-400 dark:text-zinc-500 px-2.5 py-1.5 rounded-xl text-xs font-semibold select-none font-sans">
                <Eye className="w-4 h-4 text-slate-400" />
                <span className="tabular-nums">{activeComponent.views_count || 0}</span>
              </div>
              
              <button
                onClick={() => setIsCommentsOpen(true)}
                className="flex items-center gap-1 text-slate-400 dark:text-zinc-500 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-zinc-800/40 px-2.5 py-1.5 rounded-xl text-xs font-semibold select-none font-sans mr-1 cursor-pointer transition-colors"
                aria-label="Open comments"
              >
                <MessageSquare className="w-4 h-4 text-slate-400 dark:text-zinc-500 transition-colors group-hover:text-indigo-500" />
                <span className="tabular-nums">{activeComponent.comments_count || 0}</span>
              </button>

              <LikeButton
                componentId={activeComponent.id}
                initialLikes={activeComponent.likes_count || 0}
              />
            </div>
          </div>

        </motion.div>
        
      </div>

      {/* Swipe control arrows & hints */}
      <div className="flex items-center gap-6 select-none pt-2">
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => handleSwipe("left")}
          className="w-12 h-12 rounded-2xl glass-panel border border-slate-200/60 dark:border-zinc-800 text-rose-500 flex items-center justify-center shadow-sm hover:bg-rose-500/5 transition-colors cursor-pointer"
          aria-label="Swipe left"
        >
          <ArrowLeft className="w-5 h-5" />
        </motion.button>

        {/* <span className="text-xs font-semibold text-slate-400 dark:text-zinc-500 font-sans flex items-center gap-1.5">
          <span>Card {currentIndex + 1} of {components.length}</span>
        </span> */}

        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => handleSwipe("right")}
          className="w-12 h-12 rounded-2xl glass-panel border border-slate-200/60 dark:border-zinc-800 text-emerald-500 flex items-center justify-center shadow-sm hover:bg-emerald-500/5 transition-colors cursor-pointer"
          aria-label="Swipe right"
        >
          <ArrowRight className="w-5 h-5" />
        </motion.button>
      </div>

      <div className="hidden sm:flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-600 select-none font-sans">
        <span>Use left and right keyboard arrows to swipe cards</span>
      </div>

      {/* Comments Drawer */}
      <AnimatePresence>
        {isCommentsOpen && (
          <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCommentsOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs cursor-pointer"
            />

            {/* Comments Container Panel */}
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 md:rounded-3xl rounded-t-3xl border border-slate-200/60 dark:border-zinc-800 shadow-2xl z-10 flex flex-col max-h-[85vh] md:max-h-[80vh] overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-zinc-800/80 shrink-0">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-indigo-500" />
                  <h3 className="text-lg font-bold text-slate-800 dark:text-zinc-100 font-sans">
                    Comments ({activeComponent.comments_count || 0})
                  </h3>
                </div>
                <button
                  onClick={() => setIsCommentsOpen(false)}
                  className="p-1.5 rounded-xl border border-slate-100 dark:border-zinc-800 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-colors cursor-pointer"
                  aria-label="Close comments"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Comments wrapper */}
              <div className="flex-1 overflow-y-auto px-6 pb-6 pt-2">
                <CommentSection componentId={activeComponent.id} isModal={true} />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
