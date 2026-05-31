import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ComponentCardUI from "@/components/component-card";
import { Bookmark, ArrowLeft, Compass } from "lucide-react";
import Link from "next/link";

export default async function FavouritesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch bookmarked components joined with profiles and counts
  const { data: savedRecords, error } = await supabase
    .from("favorites")
    .select("*, components(*, profiles(*), likes(count), comments(count))")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching bookmarks:", error);
  }

  // Extract component records from join and map dynamic counts
  const bookmarkedComponents = (savedRecords || [])
    .map((record: any) => {
      const comp = record.components;
      if (!comp) return null;
      return {
        ...comp,
        likes_count: comp.likes?.[0]?.count ?? comp.likes_count ?? 0,
        comments_count: comp.comments?.[0]?.count ?? comp.comments_count ?? 0,
      };
    })
    .filter(Boolean);

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-6 py-10 space-y-8">
      {/* Return Header Navigation */}
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="flex items-center justify-center w-10 h-10 rounded-xl border border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-sans dark:text-zinc-100 tracking-tight">
            Saved Inspiration
          </h1>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Your personal treasury of bookmarked design sections and cards.
          </p>
        </div>
      </div>

      {/* Grid listing bookmarked components */}
      {bookmarkedComponents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8 justify-items-center pt-2">
          {bookmarkedComponents.map((comp: any) => (
            <ComponentCardUI key={comp.id} component={comp} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center glass-panel rounded-3xl border border-slate-200/50 dark:border-zinc-800/60 text-slate-400 max-w-xl mx-auto p-8 space-y-4">
          <Bookmark className="w-12 h-12 text-slate-300 dark:text-zinc-700 mx-auto animate-pulse" />
          <div>
            <p className="text-lg font-bold">No saved templates</p>
            <p className="text-sm mt-0.5 leading-relaxed">
              You haven't bookmarked any flash-cards yet. Slide through components in the home feed and click the bookmark button to collect them.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-sm transition-all shadow-sm shadow-indigo-500/10 cursor-pointer font-sans"
          >
            <Compass className="w-4 h-4" />
            <span>Discover Feeds</span>
          </Link>
        </div>
      )}
    </div>
  );
}
