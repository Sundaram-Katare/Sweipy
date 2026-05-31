import { createClient } from "@/lib/supabase/server";

import HomeFeed from "@/components/home-feed";

export default async function HomePage() {
  const supabase = await createClient();

  const { data: rawComponents } =
    await supabase
      .from("components")
      .select("*, profiles(*), likes(count), comments(count)")
      .order("created_at", {
        ascending: false,
      });

  const components = (rawComponents || []).map((comp: any) => ({
    ...comp,
    likes_count: comp.likes?.[0]?.count ?? comp.likes_count ?? 0,
    comments_count: comp.comments?.[0]?.count ?? comp.comments_count ?? 0,
  }));

  // Safe ratings stats fetch
  let averageRating = 0;
  let totalRatingsCount = 0;
  try {
    const { data: ratingData, error: ratingError } = await supabase
      .from("ratings")
      .select("rating");
    
    if (!ratingError && ratingData && ratingData.length > 0) {
      totalRatingsCount = ratingData.length;
      const sum = ratingData.reduce((acc, r) => acc + r.rating, 0);
      averageRating = parseFloat((sum / totalRatingsCount).toFixed(1));
    }
  } catch (err) {
    console.warn("Could not fetch ratings table (it may not be created yet):", err);
  }

  // Safe users count fetch
  let usersCount = 0;
  try {
    const { count, error: userError } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });
    
    if (!userError && count !== null) {
      usersCount = count;
    }
  } catch (err) {
    console.warn("Could not fetch profiles count:", err);
  }

  return (
    <HomeFeed
      components={components || []}
      averageRating={averageRating}
      totalRatingsCount={totalRatingsCount}
      usersCount={usersCount}
    />
  );
}