"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function toggleFavoriteAction(componentId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be logged in to save components.");
  }

  // Check if already favorited
  const { data: existingFav, error: fetchError } = await supabase
    .from("favorites")
    .select("id")
    .eq("component_id", componentId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (fetchError) {
    // If table doesn't exist yet, catch it gracefully
    console.error("Error checking favorites table (make sure migrations are run):", fetchError);
    throw new Error("Favorites system is being configured. Please ensure migrations are applied.");
  }

  let isFavoritedNow = false;

  if (existingFav) {
    // Unfavorite
    const { error: deleteError } = await supabase
      .from("favorites")
      .delete()
      .eq("id", existingFav.id);

    if (deleteError) {
      console.error("Error deleting favorite:", deleteError);
      throw new Error(deleteError.message);
    }
    isFavoritedNow = false;
  } else {
    // Favorite
    const { error: insertError } = await supabase
      .from("favorites")
      .insert({
        component_id: componentId,
        user_id: user.id
      });

    if (insertError) {
      console.error("Error inserting favorite:", insertError);
      throw new Error(insertError.message);
    }
    isFavoritedNow = true;
  }

  revalidatePath(`/component/${componentId}`);
  revalidatePath("/favourites");
  revalidatePath("/");

  return { success: true, isFavorited: isFavoritedNow };
}

export async function getFavoriteStatusAction(componentId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { isFavorited: false };

  const { data, error } = await supabase
    .from("favorites")
    .select("id")
    .eq("component_id", componentId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) return { isFavorited: false };
  return { isFavorited: !!data };
}
