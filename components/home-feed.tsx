"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Sparkles, RefreshCw, Keyboard, Star, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import FilterBar from "./filter-bar";
import SearchBar from "./search-bar";
import ComponentCardUI from "./component-card";
import { ComponentCard } from "@/types/database";

type Props = {
  components: ComponentCard[];
  averageRating?: number;
  totalRatingsCount?: number;
  usersCount?: number;
};

const containerVariants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const childVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 200,
      damping: 10,
    },
  },
};

export default function HomeFeed({
  components,
  averageRating = 0,
  totalRatingsCount = 0,
  usersCount = 0,
}: Props) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Filter components dynamically based on search query and category
  const filteredComponents = useMemo(() => {
    return components.filter((component) => {
      // Category filter
      const categoryMatch =
        selectedCategory === "All" ||
        component.category?.toLowerCase() === selectedCategory.toLowerCase();

      // Search matching (Title, Description, or Tags)
      const query = searchQuery.trim().toLowerCase();
      if (!query) return categoryMatch;

      // Tag search support e.g. #hero
      if (query.startsWith("#")) {
        const targetTag = query.substring(1);
        const tagMatch = component.tags?.some((t) =>
          t.toLowerCase().includes(targetTag)
        );
        return categoryMatch && tagMatch;
      }

      // Title & Description matching
      const textMatch =
        component.title.toLowerCase().includes(query) ||
        component.description.toLowerCase().includes(query);

      return categoryMatch && textMatch;
    });
  }, [components, selectedCategory, searchQuery]);

  // Handle Horizontal Scroll indicators
  const checkScrollable = () => {
    const el = scrollContainerRef.current;
    if (el) {
      setCanScrollLeft(el.scrollLeft > 10);
      setCanScrollRight(
        el.scrollLeft + el.clientWidth < el.scrollWidth - 10
      );
    }
  };

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (el) {
      el.addEventListener("scroll", checkScrollable);
      // Run once on load
      checkScrollable();
    }
    return () => el?.removeEventListener("scroll", checkScrollable);
  }, [filteredComponents]);

  // Click scroll handler for arrows
  const scrollFeed = (direction: "left" | "right") => {
    const el = scrollContainerRef.current;
    if (el) {
      const scrollAmount = el.clientWidth * 0.75;
      el.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // Keyboard navigation support (Arrow keys to swipe cards)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return; // Don't hijack keyboard inputs
      }

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        scrollFeed("left");
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        scrollFeed("right");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleResetSearch = () => {
    setSearchQuery("");
    setSelectedCategory("All");
  };

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto flex flex-col px-6 py-6 sm:py-10 space-y-8 md:space-y-12">
      {/* Search Header panel */}
      <div className="w-full flex flex-col items-center text-center space-y-4">
        <motion.h2
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-4xl sm:text-5xl md:text-9xl font-bold font-[family-name:var(--font-dancing-script)] bg-linear-to-r from-blue-600 to-black dark:from-blue-400 dark:to-white bg-clip-text text-transparent leading-none select-none tracking-wide pb-2"
        >
          {"Sweipy".split("").map((char, index) => (
            <motion.span key={char + "-" + index} variants={childVariants} className="inline-block">
              {char}
            </motion.span>
          ))}
        </motion.h2>
        <p className="text-sm sm:text-base text-slate-500 dark:text-zinc-400 font-sans max-w-md">
         UI inspiration that doesn't waste your time. 
        </p>

        <p className="text-sm sm:text-base text-slate-500 dark:text-zinc-400 font-sans max-w-md">
         Swipe. Save. Build.
        </p>

        {/* Rating and Users Statistics section */}
        <div className="flex items-center justify-center gap-2.5 mt-3 text-xs font-semibold font-sans tracking-wide select-none">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100/70 dark:bg-zinc-900/60 border border-slate-200/30 dark:border-zinc-800/50 text-slate-600 dark:text-zinc-300 shadow-xs hover:bg-slate-200/50 dark:hover:bg-zinc-900/90 transition-colors duration-200">
            <Star className="w-4.5 h-4.5 text-amber-500 fill-amber-500" />
            <span className="text-lg">{averageRating > 0 ? `${averageRating} / 5` : "5.0 / 5"}</span>
            {totalRatingsCount > 0 && (
              <span className="text-lg text-slate-400 dark:text-zinc-500 font-normal">
                Rating
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100/70 dark:bg-zinc-900/60 border border-slate-200/30 dark:border-zinc-800/50 text-slate-600 dark:text-zinc-300 shadow-xs hover:bg-slate-200/50 dark:hover:bg-zinc-900/90 transition-colors duration-200">
            <Users className="w-3.5 h-3.5 text-indigo-500" />
            <span className="text-lg">
              {usersCount} {usersCount === 1 ? "Creator" : "Creators"}
            </span>
          </div>
        </div>
      </div>

      <SearchBar value={searchQuery} onChange={setSearchQuery} />

      <FilterBar selected={selectedCategory} onSelect={setSelectedCategory} />

      {/* Snap slider Deck container */}
      <div className="relative w-full flex-1 flex flex-col justify-center min-h-[380px] sm:min-h-[480px]">
        <AnimatePresence mode="wait">
          {filteredComponents.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg mx-auto glass-panel p-8 sm:p-12 rounded-3xl border border-slate-200/50 dark:border-zinc-800 text-center flex flex-col items-center space-y-5"
            >
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                <Sparkles className="w-8 h-8 text-indigo-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold font-sans dark:text-zinc-100">
                  No components match your search
                </h3>
                <p className="text-sm text-slate-500 dark:text-zinc-400 font-sans mt-2">
                  Try typing `#hero` or exploring other categories such as `Pricing` or `Dashboard`.
                </p>
              </div>
              <button
                onClick={handleResetSearch}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-sm transition-all shadow-sm shadow-indigo-500/15 cursor-pointer font-sans"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reset Filters</span>
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="feed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative w-full flex items-center"
            >
              {/* Left Scroll Control Arrow */}
              {canScrollLeft && (
                <button
                  onClick={() => scrollFeed("left")}
                  className="absolute left-2 z-10 w-12 h-12 hidden md:flex items-center justify-center rounded-2xl glass-panel border border-slate-200/60 dark:border-zinc-800 text-slate-700 dark:text-zinc-200 shadow-md hover:scale-105 active:scale-95 hover:bg-white dark:hover:bg-zinc-900 transition-all cursor-pointer"
                  aria-label="Previous component"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              )}

              {/* Slider Deck viewport */}
              <div
                ref={scrollContainerRef}
                className="
                  w-full
                  flex
                  gap-6
                  sm:gap-8
                  overflow-x-auto
                  snap-x
                  snap-mandatory
                  no-scrollbar
                  pb-8
                  px-2
                  scroll-smooth
                "
              >
                {filteredComponents.map((component, idx) => (
                  <div
                    key={component.id}
                    className="
                      snap-center
                      first:pl-[4%]
                      last:pr-[4%]
                      flex
                      justify-center
                      shrink-0
                      w-[92%]
                      xs:w-[86%]
                      sm:w-[75%]
                      md:w-[650px]
                      lg:w-[700px]
                    "
                  >
                    <ComponentCardUI component={component} />
                  </div>
                ))}
              </div>

              {/* Right Scroll Control Arrow */}
              {canScrollRight && (
                <button
                  onClick={() => scrollFeed("right")}
                  className="absolute right-2 z-10 w-12 h-12 hidden md:flex items-center justify-center rounded-2xl glass-panel border border-slate-200/60 dark:border-zinc-800 text-slate-700 dark:text-zinc-200 shadow-md hover:scale-105 active:scale-95 hover:bg-white dark:hover:bg-zinc-900 transition-all cursor-pointer"
                  aria-label="Next component"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Keyboard Indicator hint */}
      <div className="hidden md:flex items-center justify-center gap-2 text-xs text-slate-400 dark:text-zinc-500 font-medium select-none font-sans">
        <Keyboard className="w-4 h-4 text-slate-300 dark:text-zinc-600" />
        <span>Use your left and right keyboard arrows to swipe components</span>
      </div>
    </div>
  );
}