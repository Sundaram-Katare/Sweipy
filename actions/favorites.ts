"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function toggleFavoriteAction(componentId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "You must be logged in to save components." };
    }

    // Check if already favorited
    const { data: existingFav, error: fetchError } = await supabase
      .from("favorites")
      .select("id")
      .eq("component_id", componentId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (fetchError) {
      console.error("Error checking favorites table (make sure migrations are run):", fetchError);
      return { success: false, error: "Favorites system is being configured. Please ensure migrations are applied." };
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
        return { success: false, error: deleteError.message };
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
        return { success: false, error: insertError.message };
      }
      isFavoritedNow = true;
    }

    revalidatePath(`/component/${componentId}`);
    revalidatePath("/favourites");
    revalidatePath("/");

    return { success: true, isFavorited: isFavoritedNow };
  } catch (err: any) {
    console.error("Error in toggleFavoriteAction:", err);
    return { success: false, error: err.message || "An unexpected error occurred." };
  }
}

export async function getFavoriteStatusAction(componentId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: true, isFavorited: false };

    const { data, error } = await supabase
      .from("favorites")
      .select("id")
      .eq("component_id", componentId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Error fetching favorite status:", error);
      return { success: false, isFavorited: false, error: error.message };
    }
    return { success: true, isFavorited: !!data };
  } catch (err: any) {
    console.error("Error in getFavoriteStatusAction:", err);
    return { success: false, isFavorited: false, error: err.message };
  }
}
