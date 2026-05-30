import { createClient } from "@/lib/supabase/server";
import ComponentCardUI from "@/components/component-card";
import FollowButton from "@/components/follow-button";
import { getFollowCountsAction } from "@/actions/follow";
import { Heart, UploadCloud, Users, ArrowLeft, Globe } from "lucide-react";
import Link from "next/link";

export default async function UserPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const resolvedParams = await params;
  const { id: userId } = resolvedParams;
  const supabase = await createClient();

  // Fetch creator profile details
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (!profile) {
    return (
      <div className="flex-1 w-full max-w-2xl mx-auto px-6 py-20 text-center flex flex-col items-center justify-center space-y-4">
        <h2 className="text-2xl font-bold">Creator not found</h2>
        <p className="text-slate-500">The profile you are looking for does not exist.</p>
        <Link href="/" className="px-5 py-2.5 bg-indigo-500 text-white rounded-xl text-sm font-semibold">
          Return Home
        </Link>
      </div>
    );
  }

  // Fetch components uploaded by the creator
  const { data: components } = await supabase
    .from("components")
    .select("*, profiles(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  // Fetch follower & following metrics
  const { followers, following } = await getFollowCountsAction(userId);

  // Compute aggregated stats
  const totalUploads = components?.length || 0;
  const totalLikes = (components || []).reduce((acc, comp) => acc + (comp.likes_count || 0), 0);

  const socialLinks = [
    { key: "github", label: "GitHub", href: profile.github_url },
    { key: "twitter", label: "Twitter", href: profile.twitter_url },
    { key: "website", label: "Website", href: profile.website_url },
  ].filter(link => link.href);

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-6 py-10 space-y-10">
      
      {/* Return Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="flex items-center justify-center w-10 h-10 rounded-xl border border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-sans">
            Creator Profile
          </h2>
          <p className="text-sm text-slate-500 dark:text-zinc-400 font-sans">
            Explore templates created by {profile.username}.
          </p>
        </div>
      </div>

      {/* Creator Header Profile Card */}
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
              {profile.bio || "This creator hasn't written a biography yet."}
            </p>

            {/* Social Link Badges */}
            {socialLinks.length > 0 && (
              <div className="flex flex-wrap gap-2.5 pt-1.5 justify-center sm:justify-start">
                {socialLinks.map((link) => (
                  <a
                    key={link.key}
                    href={link.href.startsWith("http") ? link.href : `https://${link.href}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold font-sans px-2.5 py-1 rounded-lg border border-slate-200 dark:border-zinc-800 text-slate-500 hover:text-indigo-500 dark:text-zinc-400 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-zinc-800/20 transition-all flex items-center gap-1.5"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>{link.label}</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Follow Button Wrapper */}
        <div className="shrink-0 self-center md:self-start">
          <FollowButton followingId={userId} />
        </div>

      </div>

      {/* Aggregate Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        <div className="glass-panel p-5 rounded-2xl border border-slate-200/50 dark:border-zinc-800/60 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/45 flex items-center justify-center border border-indigo-500/10">
            <UploadCloud className="w-5 h-5 text-indigo-500" />
          </div>
          <div>
            <p className="text-2xl font-black font-sans text-slate-800 dark:text-zinc-100 tabular-nums">
              {totalUploads}
            </p>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans">
              Templates
            </span>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-200/50 dark:border-zinc-800/60 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-rose-50/50 dark:bg-rose-950/45 flex items-center justify-center border border-rose-500/10">
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
          <div className="w-10 h-10 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/45 flex items-center justify-center border border-emerald-500/10">
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
          <div className="w-10 h-10 rounded-xl bg-amber-50/50 dark:bg-amber-950/45 flex items-center justify-center border border-amber-500/10">
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

      {/* Grid of created elements */}
      <div className="space-y-6">
        <div className="border-b border-slate-200 dark:border-zinc-800">
          <h2 className="text-xl font-bold font-sans pb-3 border-b-2 border-indigo-500 text-slate-800 dark:text-zinc-100 flex items-center gap-2">
            <span>Portfolio Sections</span>
            <span className="text-xs font-normal text-slate-400">({totalUploads})</span>
          </h2>
        </div>

        {components && components.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8 justify-items-center">
            {components.map((comp) => (
              <ComponentCardUI key={comp.id} component={comp} />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center text-slate-400">
            <UploadCloud className="w-12 h-12 text-slate-300 dark:text-zinc-700 mx-auto" />
            <p className="text-lg font-bold mt-2">No uploads shared yet</p>
            <p className="text-sm mt-0.5">Check back later to see their web interface uploads!</p>
          </div>
        )}
      </div>

    </div>
  );
}