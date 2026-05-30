"use client";

import { categories } from "@/constants/categories";

type Props = {
  selected: string;

  onSelect: (category: string) => void;
};

export default function FilterBar({
  selected,
  onSelect,
}: Props) {
  return (
    <div
      className="
        flex
        gap-4
        overflow-x-auto
        pb-4
      "
    >

      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onSelect(category)}
          className={`
            whitespace-nowrap
            rounded-full
            px-6
            py-3
            transition

            ${
              selected === category
                ? "bg-black text-white"
                : "bg-gray-100"
            }
          `}
        >
          {category}
        </button>
      ))}

    </div>
  );
}