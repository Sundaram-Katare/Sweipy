"use client";

import { useEffect, useState } from "react";
import { Search, X, TrendingUp, Hash } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

const TRENDING_TAGS = ["hero", "dashboard", "pricing", "testimonials", "login", "minimal"];

export default function SearchBar({
  value,
  onChange,
}: Props) {
  const [internalValue, setInternalValue] = useState(value);

  // Sync internal state when external value changes (e.g., from categories)
  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  // Debounced input change handler
  useEffect(() => {
    const handler = setTimeout(() => {
      onChange(internalValue);
    }, 300);

    return () => clearTimeout(handler);
  }, [internalValue, onChange]);

  const handleClear = () => {
    setInternalValue("");
    onChange("");
  };

  const handleTagClick = (tag: string) => {
    setInternalValue(`#${tag}`);
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4">
      {/* Input container */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors duration-200">
          <Search className="w-5 h-5" />
        </div>

        <input
          type="text"
          value={internalValue}
          onChange={(e) => setInternalValue(e.target.value)}
          placeholder="Search by title, description, or #tag..."
          className="
            w-full
            pl-12
            pr-12
            py-4
            text-base
            font-sans
            rounded-2xl
            border
            border-slate-200/60
            dark:border-zinc-800/80
            bg-white/80
            dark:bg-zinc-900/60
            text-slate-800
            dark:text-zinc-100
            placeholder-slate-400
            dark:placeholder-zinc-500
            backdrop-blur-md
            shadow-[0_4px_16px_rgba(0,0,0,0.02)]
            focus:outline-hidden
            focus:ring-2
            focus:ring-indigo-500/20
            focus:border-indigo-500
            transition-all
            duration-300
          "
        />

        <AnimatePresence>
          {internalValue && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={handleClear}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-indigo-500 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Trending Tags section */}
      <div className="flex flex-wrap items-center gap-2 px-1 text-xs text-slate-400 dark:text-zinc-500">
        <span className="flex items-center gap-1 font-semibold select-none font-sans mr-1">
          <TrendingUp className="w-3.5 h-3.5 text-indigo-500/80" />
          Trending:
        </span>

        {TRENDING_TAGS.map((tag) => (
          <button
            key={tag}
            onClick={() => handleTagClick(tag)}
            className="
              flex
              items-center
              gap-0.5
              px-2.5
              py-1
              rounded-lg
              bg-slate-100/65
              dark:bg-zinc-800/40
              border
              border-slate-200/20
              dark:border-zinc-800/30
              text-slate-500
              dark:text-zinc-400
              hover:text-indigo-500
              dark:hover:text-indigo-400
              hover:bg-indigo-500/5
              dark:hover:bg-indigo-500/10
              transition-all
              cursor-pointer
              font-sans
              font-medium
            "
          >
            <Hash className="w-3 h-3 text-slate-400/80 dark:text-zinc-500/80" />
            <span>{tag}</span>
          </button>
        ))}
      </div>
    </div>
  );
}