import { createClient } from "@/lib/supabase/server";
import JustSwipeDeck from "@/components/just-swipe-deck";

export const metadata = {
  title: "JustSwipe | Immersive UI Flashcards",
  description: "Swipe | Discover | Inspired",
};

export default async function JustSwipePage() {
  const supabase = await createClient();

  // Fetch all UI components joined with author profiles
  const { data: rawComponents } = await supabase
    .from("components")
    .select("*, profiles(*), likes(count), comments(count)")
    .order("created_at", { ascending: false });

  const components = (rawComponents || []).map((comp: any) => ({
    ...comp,
    likes_count: comp.likes?.[0]?.count ?? comp.likes_count ?? 0,
    comments_count: comp.comments?.[0]?.count ?? comp.comments_count ?? 0,
  }));

  return <JustSwipeDeck components={components} />;
}
