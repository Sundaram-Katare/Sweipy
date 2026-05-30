"use client";

import { categories } from "@/constants/categories";
import { motion } from "framer-motion";

type Props = {
  selected: string;
  onSelect: (category: string) => void;
};

export default function FilterBar({
  selected,
  onSelect,
}: Props) {
  return (
    <div className="w-full flex items-center justify-center">
      <div
        className="
          flex
          gap-2.5
          overflow-x-auto
          no-scrollbar
          py-2
          px-4
          max-w-full
          bg-slate-100/50
          dark:bg-zinc-800/20
          border
          border-slate-200/20
          dark:border-zinc-800/40
          rounded-2xl
          backdrop-blur-md
          scroll-smooth
        "
      >
        {categories.map((category) => {
          const isSelected = selected === category;

          return (
            <motion.button
              key={category}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelect(category)}
              className={`
                whitespace-nowrap
                px-5
                py-2
                rounded-xl
                text-xs
                font-bold
                font-sans
                transition-all
                cursor-pointer
                ${
                  isSelected
                    ? "bg-indigo-500 text-white shadow-sm shadow-indigo-500/15"
                    : "text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200"
                }
              `}
            >
              {category}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}