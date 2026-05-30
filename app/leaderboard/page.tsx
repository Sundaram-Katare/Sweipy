import { createClient } from "@/lib/supabase/server";
import { Trophy, Flame, Eye, Heart, Sparkles, Award } from "lucide-react";
import Link from "next/link";

export default async function LeaderboardPage() {
  const supabase = await createClient();

  // Retrieve components and their creator profile associations
  const { data } = await supabase
    .from("components")
    .select(`
      likes_count,
      comments_count,
      views_count,
      user_id,
      profiles (
        username,
        avatar_url,
        bio
      )
    `);

  // Map-reduce aggregation logic
  const leaderBoardMap: Record<
    string,
    {
      userId: string;
      username: string;
      avatar: string;
      bio: string;
      likes: number;
      comments: number;
      views: number;
      uploads: number;
      score: number;
    }
  > = {};

  data?.forEach((item: any) => {
    const creator = item.profiles;
    if (!creator || !item.user_id) return;

    const username = creator.username || "Anonymous";

    if (!leaderBoardMap[item.user_id]) {
      leaderBoardMap[item.user_id] = {
        userId: item.user_id,
        username,
        avatar: creator.avatar_url || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
        bio: creator.bio || "",
        likes: 0,
        comments: 0,
        views: 0,
        uploads: 0,
        score: 0,
      };
    }

    const cell = leaderBoardMap[item.user_id];
    cell.likes += item.likes_count || 0;
    cell.comments += item.comments_count || 0;
    cell.views += item.views_count || 0;
    cell.uploads += 1;
    // Weighted algorithm calculation
    cell.score = cell.likes * 10 + cell.comments * 5 + cell.views;
  });

  const sortedLeaderboard = Object.values(leaderBoardMap).sort(
    (a, b) => b.score - a.score
  );

  // Split top-3 podium creators
  const first = sortedLeaderboard[0];
  const second = sortedLeaderboard[1];
  const third = sortedLeaderboard[2];
  const rest = sortedLeaderboard.slice(3);

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto px-6 py-10 space-y-12">
      {/* Title Header */}
      <div className="space-y-3 text-center">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 mx-auto">
          <Trophy className="w-6 h-6 text-amber-500" />
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-sans text-slate-800 dark:text-zinc-100 tracking-tight">
          Trending Creators
        </h1>
        <p className="text-sm text-slate-500 dark:text-zinc-400 font-sans max-w-md mx-auto">
          Honoring designers whose layouts and frontend code sections gather the highest community engagement.
        </p>
      </div>

      {/* Ranks 1, 2, 3 Visual Podium Display */}
      {sortedLeaderboard.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 items-end max-w-3xl mx-auto pt-6">
          
          {/* Rank #2 (Left) */}
          {second && (
            <Link href={`/user/${second.userId}`} className="order-2 sm:order-1 group">
              <div className="glass-panel p-6 rounded-3xl border border-slate-200/50 dark:border-zinc-800/80 text-center flex flex-col items-center space-y-4 hover:-translate-y-2 transition-transform duration-300">
                <div className="relative">
                  <img
                    src={second.avatar}
                    alt={second.username}
                    className="w-16 h-16 rounded-full object-cover border-4 border-slate-300 shadow-md"
                  />
                  <span className="absolute -bottom-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-slate-300 text-xs font-bold text-slate-700 shadow-sm">
                    2
                  </span>
                </div>
                <div>
                  <h3 className="font-extrabold text-base truncate max-w-[150px] dark:text-zinc-100">
                    {second.username}
                  </h3>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mt-0.5">
                    {second.uploads} uploads
                  </span>
                </div>
                <div className="w-full pt-3.5 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-0.5 text-rose-500 font-semibold font-sans">
                    <Heart className="w-3.5 h-3.5 fill-rose-500/10" />
                    {second.likes}
                  </span>
                  <span className="font-bold text-indigo-500 dark:text-indigo-400 tabular-nums">
                    {second.score} pts
                  </span>
                </div>
              </div>
            </Link>
          )}

          {/* Rank #1 (Center) */}
          {first && (
            <Link href={`/user/${first.userId}`} className="order-1 sm:order-2 group">
              <div className="glass-panel p-8 rounded-3xl border-2 border-amber-500/30 dark:border-amber-500/20 text-center flex flex-col items-center space-y-4 hover:-translate-y-2 transition-transform duration-300 relative glow-effect">
                <div className="absolute -top-5 flex items-center gap-1 bg-amber-500 text-white text-[10px] font-bold uppercase px-3 py-1 rounded-full shadow-md shadow-amber-500/20 select-none">
                  <Award className="w-3 h-3 animate-spin" />
                  <span>Leader</span>
                </div>
                <div className="relative pt-2">
                  <img
                    src={first.avatar}
                    alt={first.username}
                    className="w-20 h-20 rounded-full object-cover border-4 border-amber-400 shadow-lg"
                  />
                  <span className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-amber-400 text-sm font-black text-amber-950 shadow-md">
                    1
                  </span>
                </div>
                <div>
                  <h3 className="font-black text-lg truncate max-w-[180px] dark:text-zinc-100">
                    {first.username}
                  </h3>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mt-0.5">
                    {first.uploads} uploads
                  </span>
                </div>
                <div className="w-full pt-3.5 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-0.5 text-rose-500 font-semibold font-sans">
                    <Heart className="w-3.5 h-3.5 fill-rose-500/10" />
                    {first.likes}
                  </span>
                  <span className="font-black text-amber-500 tabular-nums text-sm">
                    {first.score} pts
                  </span>
                </div>
              </div>
            </Link>
          )}

          {/* Rank #3 (Right) */}
          {third && (
            <Link href={`/user/${third.userId}`} className="order-3 group">
              <div className="glass-panel p-6 rounded-3xl border border-slate-200/50 dark:border-zinc-800/80 text-center flex flex-col items-center space-y-4 hover:-translate-y-2 transition-transform duration-300">
                <div className="relative">
                  <img
                    src={third.avatar}
                    alt={third.username}
                    className="w-16 h-16 rounded-full object-cover border-4 border-amber-600/40 shadow-md"
                  />
                  <span className="absolute -bottom-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-amber-600/50 text-xs font-bold text-amber-950 shadow-sm">
                    3
                  </span>
                </div>
                <div>
                  <h3 className="font-extrabold text-base truncate max-w-[150px] dark:text-zinc-100">
                    {third.username}
                  </h3>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mt-0.5">
                    {third.uploads} uploads
                  </span>
                </div>
                <div className="w-full pt-3.5 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-0.5 text-rose-500 font-semibold font-sans">
                    <Heart className="w-3.5 h-3.5 fill-rose-500/10" />
                    {third.likes}
                  </span>
                  <span className="font-bold text-indigo-500 dark:text-indigo-400 tabular-nums">
                    {third.score} pts
                  </span>
                </div>
              </div>
            </Link>
          )}

        </div>
      )}

      {/* Ranks 4+ Creator List */}
      <div className="space-y-4 max-w-3xl mx-auto">
        <h2 className="text-lg font-bold font-sans text-slate-400 dark:text-zinc-500 uppercase tracking-wider px-1">
          Top Rankings Showcase
        </h2>

        {sortedLeaderboard.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <Sparkles className="w-10 h-10 text-slate-300 dark:text-zinc-700 mx-auto" />
            <p className="text-lg font-bold mt-2">Leaderboard empty</p>
            <p className="text-sm">Shared templates will generate ranking points live!</p>
          </div>
        ) : (
          <div className="glass-panel rounded-3xl border border-slate-200/50 dark:border-zinc-800/80 overflow-hidden divide-y divide-slate-100 dark:divide-zinc-800/40">
            
            {/* Rank 1-3 visual items shown inside Podium, rest rendered below */}
            {sortedLeaderboard.map((user, idx) => {
              const rank = idx + 1;
              return (
                <Link
                  key={user.userId}
                  href={`/user/${user.userId}`}
                  className="flex items-center justify-between p-4.5 hover:bg-slate-50 dark:hover:bg-zinc-800/20 transition-all font-sans cursor-pointer group"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <span className="w-6 text-center text-sm font-bold text-slate-400 group-hover:text-indigo-500 transition-colors shrink-0">
                      #{rank}
                    </span>
                    <img
                      src={user.avatar}
                      alt={user.username}
                      className="w-11 h-11 rounded-full object-cover border border-slate-100 dark:border-zinc-800 shadow-xs shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-800 dark:text-zinc-200 truncate">
                        {user.username}
                      </p>
                      <p className="text-[10px] text-slate-400 dark:text-zinc-500 truncate max-w-xs sm:max-w-md mt-0.5">
                        {user.bio || "UISwipe design creator"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-5 shrink-0 text-xs">
                    <span className="hidden sm:flex items-center gap-1 text-slate-400 dark:text-zinc-500">
                      <Eye className="w-3.5 h-3.5" />
                      {user.views}
                    </span>
                    <span className="flex items-center gap-1 text-rose-500/80 font-medium">
                      <Heart className="w-3.5 h-3.5 fill-rose-500/5" />
                      {user.likes}
                    </span>
                    <span className="w-16 text-right font-bold text-slate-800 dark:text-zinc-200 tabular-nums">
                      {user.score} pts
                    </span>
                  </div>
                </Link>
              );
            })}

          </div>
        )}
      </div>

    </div>
  );
}