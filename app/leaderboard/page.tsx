import { createClient } from "@/lib/supabase/server";
import { Trophy } from "lucide-react";
import LeaderboardClient from "@/components/leaderboard-client";

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
        avatar: creator.avatar_url || "/default-avatar.avif",
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

      <LeaderboardClient leaderboard={sortedLeaderboard} />
    </div>
  );
}