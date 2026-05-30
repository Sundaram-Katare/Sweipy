import { createClient } from "@/lib/supabase/server";

export default async function LeaderboardPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("components")
    .select(`
      likes_count,
      profiles (
        username,
        avatar_url
      )
    `);

  const leaderboard: Record<
    string,
    {
      username: string;
      avatar: string;
      likes: number;
    }
  > = {};

  data?.forEach((item: any) => {
    const username =
      item.profiles?.username;

    if (!username) return;

    if (!leaderboard[username]) {
      leaderboard[username] = {
        username,
        avatar:
          item.profiles.avatar_url,
        likes: 0,
      };
    }

    leaderboard[username].likes +=
      item.likes_count;
  });

  const sorted =
    Object.values(leaderboard).sort(
      (a, b) => b.likes - a.likes
    );

  return (
    <div className="mx-auto max-w-4xl p-10">

      <h1 className="mb-10 text-5xl font-bold">
        Leaderboard
      </h1>

      <div className="space-y-6">

        {sorted.map((user, index) => (
          <div
            key={user.username}
            className="
              flex
              items-center
              justify-between
              rounded-2xl
              border
              p-6
            "
          >

            <div className="flex items-center gap-4">

              <p className="text-2xl font-bold">
                #{index + 1}
              </p>

              <img
                src={user.avatar}
                className="
                  h-14
                  w-14
                  rounded-full
                "
              />

              <p className="text-xl font-semibold">
                {user.username}
              </p>

            </div>

            <p className="text-xl">
              ❤️ {user.likes}
            </p>

          </div>
        ))}

      </div>

    </div>
  );
}