import { createClient } from "@/lib/supabase/server";
import CommentSection from "@/components/comment-section";
import Link from "next/link";
import { Eye, ExternalLink, Calendar, Compass, ArrowLeft, ArrowUpRight } from "lucide-react";
import FavouriteButton from "@/components/faviourite-button";

export default async function ComponentPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const resolvedParams = await params;
  const { id: componentId } = resolvedParams;
  const supabase = await createClient();

  // Fetch the primary component
  const { data: component } = await supabase
    .from("components")
    .select("*, profiles(*)")
    .eq("id", componentId)
    .single();

  if (!component) {
    return (
      <div className="flex-1 w-full max-w-2xl mx-auto px-6 py-20 text-center flex flex-col items-center justify-center space-y-4">
        <h2 className="text-2xl font-bold">Component not found</h2>
        <p className="text-slate-500">The component section you are looking for does not exist.</p>
        <Link href="/" className="px-5 py-2.5 bg-indigo-500 text-white rounded-xl text-sm font-semibold">
          Return Home
        </Link>
      </div>
    );
  }

  // Increment view count on server load atomically
  const currentViews = component.views_count || 0;
  await supabase
    .from("components")
    .update({ views_count: currentViews + 1 })
    .eq("id", componentId);

  const author = component.profiles;
  const authorAvatar = author?.avatar_url || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80";
  const authorUsername = author?.username || "Anonymous";

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto px-6 py-10 space-y-8">
      {/* Return Navigation Header */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800/80 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center justify-center w-10 h-10 rounded-xl border border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-sans">
              Component Details
            </h2>
            <p className="text-sm text-slate-500 dark:text-zinc-400 font-sans">
              Discover code sections and visual inspirations.
            </p>
          </div>
        </div>

        <FavouriteButton componentId={component.id} />
      </div>

      {/* Screen Preview Container */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-200/50 dark:border-zinc-800/80 bg-slate-50 dark:bg-zinc-950 shadow-md">
        <img
          src={component.image_url}
          alt={component.title}
          className="w-full h-auto max-h-[550px] object-contain mx-auto"
        />
      </div>

      {/* Metadata Detail Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* Left Side Content Description (2/3 Grid) */}
        <div className="md:col-span-2 space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 uppercase tracking-wider font-sans select-none border border-indigo-500/10">
                {component.category || "General"}
              </span>
              <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-semibold font-sans flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(component.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 dark:text-zinc-100 font-sans tracking-tight leading-tight">
              {component.title}
            </h1>
            <p className="text-base text-slate-600 dark:text-zinc-300 font-sans leading-relaxed">
              {component.description}
            </p>
          </div>

          {/* Tags */}
          {component.tags && component.tags.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-sans">
                Search Tags
              </h4>
              <div className="flex flex-wrap gap-2">
                {component.tags.map((tag: string) => (
                  <Link
                    key={tag}
                    href={`/explore?tab=trending&cat=All`}
                    className="text-xs font-bold px-3 py-1 rounded-lg bg-slate-100 dark:bg-zinc-800/40 text-slate-600 dark:text-zinc-400 font-sans hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors border border-slate-200/10"
                  >
                    #{tag.toLowerCase()}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Side Stats & Creator Bio (1/3 Grid) */}
        <div className="space-y-6">
          {/* Creator Profile Link Card */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-200/50 dark:border-zinc-800/80 space-y-4">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans">
              Shared By
            </h4>
            
            <Link
              href={`/user/${component.user_id}`}
              className="flex items-center gap-3 hover:opacity-85 transition-opacity group cursor-pointer"
            >
              <img
                src={authorAvatar}
                alt={authorUsername}
                className="w-12 h-12 rounded-full object-cover border border-slate-100 dark:border-zinc-800 shadow-xs"
              />
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-800 dark:text-zinc-200 truncate group-hover:text-indigo-500 transition-colors font-sans">
                  {authorUsername}
                </p>
                <p className="text-[10px] text-slate-400 truncate font-sans mt-0.5">
                  View full portfolio
                </p>
              </div>
            </Link>
          </div>

          {/* Engagement metrics & Links */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-200/50 dark:border-zinc-800/80 space-y-4">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans">
              Engagement Metrics
            </h4>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 font-sans font-semibold">
                <span className="flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-slate-400" />
                  <span>Views</span>
                </span>
                <span className="tabular-nums font-bold text-slate-700 dark:text-zinc-300">
                  {currentViews + 1}
                </span>
              </div>

              {component.preview_url && (
                <a
                  href={component.preview_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full font-sans font-bold flex items-center justify-center gap-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white py-3 shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer text-sm mt-3"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Live Preview</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-indigo-200" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Comment section */}
      <CommentSection componentId={component.id} />
    </div>
  );
}