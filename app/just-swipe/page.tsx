import { createClient } from "@/lib/supabase/server";
import JustSwipeDeck from "@/components/just-swipe-deck";

export const metadata = {
  title: "JustSwipe | Immersive UI Flashcards",
  description: "Browse premium frontend templates and UI sections with tactile horizontal swipes and 3D card deck transitions.",
};

export default async function JustSwipePage() {
  const supabase = await createClient();

  // Fetch all UI components joined with author profiles
  const { data: components } = await supabase
    .from("components")
    .select("*, profiles(*)")
    .order("created_at", { ascending: false });

  return <JustSwipeDeck components={components || []} />;
}
