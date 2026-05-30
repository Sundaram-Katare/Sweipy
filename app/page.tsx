import { createClient } from "@/lib/supabase/server";

import HomeFeed from "@/components/home-feed";

export default async function HomePage() {
  const supabase = await createClient();

  const { data: components } =
    await supabase
      .from("components")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

  return (
    <HomeFeed
      components={components || []}
    />
  );
}