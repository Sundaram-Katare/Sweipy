import { createClient } from "@/lib/supabase/server";
import ComponentCardUI from "@/components/component-card";
import { Sparkles, Clock, Flame, Grid } from "lucide-react";
import Link from "next/link";

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{
    tab?: string;
    cat?: string;
  }>;
}) {
  const resolvedParams = await searchParams;
  const activeTab = resolvedParams.tab || "trending";
  const activeCategory = resolvedParams.cat || "All";

  const supabase = await createClient();

  // Fetch all components with profiles, likes count, and comments count dynamically
  let query = supabase.from("components").select("*, profiles(*), likes(count), comments(count)");

  if (activeCategory !== "All") {
    query = query.eq("category", activeCategory);
  }

  const { data: rawComponents } = await query;
  const list = (rawComponents || []).map((comp: any) => ({
    ...comp,
    likes_count: comp.likes?.[0]?.count ?? comp.likes_count ?? 0,
    comments_count: comp.comments?.[0]?.count ?? comp.comments_count ?? 0,
  }));

  // Implement the rankings logic for various tabs
  const sortedComponents = [...list].sort((a: any, b: any) => {
    if (activeTab === "recent") {
      // Sort by creation date
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    } else if (activeTab === "popular") {
      // Sort by likes
      return (b.likes_count || 0) - (a.likes_count || 0);
    } else {
      // Default: 'trending' using our custom formula score weight: Score = (Likes * 10) + (Comments * 5) + Views
      const scoreA = (a.likes_count || 0) * 10 + (a.comments_count || 0) * 5 + (a.views_count || 0);
      const scoreB = (b.likes_count || 0) * 10 + (b.comments_count || 0) * 5 + (b.views_count || 0);
      return scoreB - scoreA;
    }
  });

  const categories = [
    "All",
    "Hero",
    "Pricing",
    "Dashboard",
    "Testimonials",
    "FAQ",
    "Navbar",
    "Footer",
    "Contact",
    "Login",
  ];

  const tabs = [
    { id: "trending", label: "Trending", icon: Flame },
    { id: "recent", label: "Recent", icon: Clock },
    { id: "popular", label: "Popular", icon: Sparkles },
  ];

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-6 py-10 space-y-10">
      {/* Title Header */}
      <div className="space-y-2 text-center md:text-left">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-sans text-slate-800 dark:text-zinc-100 tracking-tight">
          Explore Showcase
        </h1>
        <p className="text-sm text-slate-500 dark:text-zinc-400 font-sans">
          Browse sections sorted by recent uploads, high engagement, or custom scoring formulas.
        </p>
      </div>

      {/* Control Actions Row (Tabs + Category filter drop lists) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200/50 dark:border-zinc-800 pb-4">
        
        {/* Navigation Tabs */}
        <div className="flex gap-1 bg-slate-100 dark:bg-zinc-800/40 p-1 rounded-xl border border-slate-200/10 shrink-0 w-max">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;

            return (
              <Link
                key={tab.id}
                href={`/explore?tab=${tab.id}&cat=${activeCategory}`}
                className={`
                  flex
                  items-center
                  gap-1.5
                  px-4
                  py-2
                  text-xs
                  font-bold
                  font-sans
                  rounded-lg
                  transition-all
                  ${
                    isActive
                      ? "bg-white dark:bg-zinc-900 text-indigo-500 dark:text-indigo-400 border border-slate-200/40 dark:border-zinc-800 shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
                      : "text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                  }
                `}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Categories filters scroll */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1.5 md:pb-0">
          <Grid className="w-4 h-4 text-slate-400 dark:text-zinc-600 hidden md:block shrink-0" />
          {categories.map((cat) => {
            const isSelected = activeCategory.toLowerCase() === cat.toLowerCase();

            return (
              <Link
                key={cat}
                href={`/explore?tab=${activeTab}&cat=${cat}`}
                className={`
                  whitespace-nowrap
                  text-xs
                  font-bold
                  font-sans
                  px-3.5
                  py-2
                  rounded-full
                  transition-all
                  ${
                    isSelected
                      ? "bg-indigo-500 text-white shadow-sm"
                      : "bg-slate-100 dark:bg-zinc-800/40 text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200 border border-slate-200/10"
                  }
                `}
              >
                {cat}
              </Link>
            );
          })}
        </div>

      </div>

      {/* Grid of Results */}
      {sortedComponents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8 justify-items-center">
          {sortedComponents.map((component) => (
            <ComponentCardUI key={component.id} component={component} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center glass-panel rounded-3xl border border-slate-200/50 dark:border-zinc-800/60 text-slate-400 max-w-xl mx-auto p-8 space-y-4">
          <Sparkles className="w-12 h-12 text-slate-300 dark:text-zinc-700 mx-auto animate-pulse" />
          <div>
            <p className="text-lg font-bold">No templates found</p>
            <p className="text-sm mt-0.5">There are no component sections shared under category `{activeCategory}` currently.</p>
          </div>
          <Link
            href="/explore?tab=trending&cat=All"
            className="inline-flex px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-sm transition-all"
          >
            Clear Filters
          </Link>
        </div>
      )}

    </div>
  );
}
