"use client";

import { useMemo, useState } from "react";

import FilterBar from "./filter-bar";

import SearchBar from "./search-bar";

import ComponentCardUI from "./component-card";

import { ComponentCard } from "@/types/database";

type Props = {
  components: ComponentCard[];
};

export default function HomeFeed({
  components,
}: Props) {
  const [selected, setSelected] =
    useState("All");

  const [search, setSearch] =
    useState("");

  const filtered =
    useMemo(() => {
      return components.filter(
        (component) => {
          const categoryMatch =
            selected === "All"
              ? true
              : component.category ===
                selected;

          const searchMatch =
            component.title
              .toLowerCase()
              .includes(
                search.toLowerCase()
              );

          return (
            categoryMatch &&
            searchMatch
          );
        }
      );
    }, [components, selected, search]);

  return (
    <div className="space-y-8 p-8">

      <SearchBar
        value={search}
        onChange={setSearch}
      />

      <FilterBar
        selected={selected}
        onSelect={setSelected}
      />

      <div
        className="
          flex
          gap-10
          overflow-x-auto
          snap-x
          snap-mandatory
          pb-10
        "
      >

        {filtered.map((component) => (
          <div
            key={component.id}
            className="snap-center"
          >
            <ComponentCardUI
              component={component}
            />
          </div>
        ))}

      </div>

    </div>
  );
}