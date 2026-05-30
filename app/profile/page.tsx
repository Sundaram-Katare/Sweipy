import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ComponentCardUI from "@/components/component-card";
import { getFollowCountsAction } from "@/actions/follow";
import { Heart, UploadCloud, Users, Settings, Bookmark, Code } from "lucide-react";

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch creator profile details
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/login");
  }

  // Fetch uploads created by the user
  const { data: uploads } = await supabase
    .from("components")
    .select("*, profiles(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // Fetch bookmarks saved by the user
  const { data: savedRecords } = await supabase
    .from("favorites")
    .select("*, components(*, profiles(*))")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // Map saved components correctly
  const savedComponents = (savedRecords || [])
    .map((record: any) => record.components)
    .filter(Boolean);

  // Fetch follower & following metrics
  const { followers, following } = await getFollowCountsAction(user.id);

  // Compute aggregated stats
  const totalUploads = uploads?.length || 0;
  const totalLikes = (uploads || []).reduce((acc, comp) => acc + (comp.likes_count || 0), 0);

  const socialLinks = [
    { key: "github_url", label: "GitHub", href: profile.github_url },
    { key: "twitter_url", label: "Twitter", href: profile.twitter_url },
    { key: "website_url", label: "Website", href: profile.website_url },
  ].filter(link => link.href);

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-6 py-10 space-y-10">
      
      {/* Profile Header Cards */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200/50 dark:border-zinc-800/80 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
        
        {/* Author Bio Panel */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-5">
          <img
            src={profile.avatar_url || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"}
            alt={profile.username}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-indigo-500/20 shadow-md shrink-0"
          />
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold font-sans text-slate-800 dark:text-zinc-100 tracking-tight">
              {profile.username}
            </h1>
            <p className="text-sm font-sans text-slate-500 dark:text-zinc-400 max-w-md leading-relaxed">
              {profile.bio || "No bio added yet. Tell the community about your designs!"}
            </p>

            {/* Social Icons Link array */}
            {socialLinks.length > 0 && (
              <div className="flex flex-wrap gap-3 pt-1">
                {socialLinks.map((link) => (
                  <a
                    key={link.key}
                    href={link.href.startsWith("http") ? link.href : `https://${link.href}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold font-sans px-2.5 py-1 rounded-lg border border-slate-200 dark:border-zinc-800 text-slate-500 hover:text-indigo-500 dark:text-zinc-400 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-zinc-800/20 transition-all"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Edit and settings */}
        <div className="shrink-0 flex gap-3 self-center md:self-start">
          <Link
            href="/profile/edit"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-slate-600 hover:text-indigo-500 dark:text-zinc-400 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-zinc-800/40 text-sm font-semibold transition-all font-sans cursor-pointer"
          >
            <Settings className="w-4 h-4" />
            <span>Edit Profile</span>
          </Link>
        </div>

      </div>

      {/* Aggregate Stats Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        <div className="glass-panel p-5 rounded-2xl border border-slate-200/50 dark:border-zinc-800/60 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/10">
            <UploadCloud className="w-5 h-5 text-indigo-500" />
          </div>
          <div>
            <p className="text-2xl font-black font-sans text-slate-800 dark:text-zinc-100 tabular-nums">
              {totalUploads}
            </p>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans">
              Uploads
            </span>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-200/50 dark:border-zinc-800/60 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center border border-rose-500/10">
            <Heart className="w-5 h-5 text-rose-500" />
          </div>
          <div>
            <p className="text-2xl font-black font-sans text-slate-800 dark:text-zinc-100 tabular-nums">
              {totalLikes}
            </p>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans">
              Likes Received
            </span>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-200/50 dark:border-zinc-800/60 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/10">
            <Users className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <p className="text-2xl font-black font-sans text-slate-800 dark:text-zinc-100 tabular-nums">
              {followers}
            </p>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans">
              Followers
            </span>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-200/50 dark:border-zinc-800/60 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/10">
            <Users className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <p className="text-2xl font-black font-sans text-slate-800 dark:text-zinc-100 tabular-nums">
              {following}
            </p>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans">
              Following
            </span>
          </div>
        </div>

      </div>

      {/* Profile Collections Grids */}
      <div className="space-y-6">
        
        {/* Dynamic Dual-Tab visual splits */}
        <div className="border-b border-slate-200 dark:border-zinc-800">
          <div className="flex gap-6">
            <h2 className="text-xl font-bold font-sans pb-3 border-b-2 border-indigo-500 text-slate-800 dark:text-zinc-100 flex items-center gap-2">
              <Code className="w-4 h-4 text-indigo-500" />
              <span>My Uploads</span>
              <span className="text-xs font-normal text-slate-400">({totalUploads})</span>
            </h2>
          </div>
        </div>

        {/* Uploads Grid */}
        {uploads && uploads.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8 justify-items-center">
            {uploads.map((comp) => (
              <ComponentCardUI key={comp.id} component={comp as any} />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center glass-panel rounded-3xl border border-slate-200/50 dark:border-zinc-800/60 text-slate-400 max-w-xl mx-auto p-8 space-y-4">
            <UploadCloud className="w-12 h-12 text-slate-300 dark:text-zinc-700 mx-auto" />
            <div>
              <p className="text-lg font-bold">You haven't uploaded any UI components yet</p>
              <p className="text-sm mt-1 max-w-xs mx-auto">Upload your screenshot mockup sections to share them with the UISwipe creator community.</p>
            </div>
            <Link
              href="/upload"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-sm transition-all shadow-sm cursor-pointer font-sans"
            >
              <span>Upload Now</span>
            </Link>
          </div>
        )}

        {/* Favourites Header Section */}
        <div className="border-b border-slate-200 dark:border-zinc-800 pt-8">
          <div className="flex gap-6">
            <h2 className="text-xl font-bold font-sans pb-3 border-b-2 border-amber-500 text-slate-800 dark:text-zinc-100 flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-amber-500" />
              <span>Saved Inspiration</span>
              <span className="text-xs font-normal text-slate-400">({savedComponents.length})</span>
            </h2>
          </div>
        </div>

        {/* Favorites Grid */}
        {savedComponents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8 justify-items-center">
            {savedComponents.map((comp) => (
              <ComponentCardUI key={comp.id} component={comp as any} />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center glass-panel rounded-3xl border border-slate-200/50 dark:border-zinc-800/60 text-slate-400 max-w-xl mx-auto p-8 space-y-4">
            <Bookmark className="w-12 h-12 text-slate-300 dark:text-zinc-700 mx-auto" />
            <div>
              <p className="text-lg font-bold">Your bookmarks collection is empty</p>
              <p className="text-sm mt-1 max-w-xs mx-auto">Bookmark inspiring design flash-cards from the home feed to save them in your account inspiration folder.</p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-sm transition-all shadow-sm cursor-pointer font-sans"
            >
              <span>Explore Home Feed</span>
            </Link>
          </div>
        )}

      </div>
      
    </div>
  );
}