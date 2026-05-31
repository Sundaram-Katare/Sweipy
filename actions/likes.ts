"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function toggleLikeAction(componentId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "You must be logged in to like a component.", isLiked: false };
    }

    // Check if like exists
    const { data: existingLike, error: fetchError } = await supabase
      .from("likes")
      .select("id")
      .eq("component_id", componentId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (fetchError) {
      console.error("Error checking like:", fetchError);
      return { success: false, error: "Failed to process like status.", isLiked: false };
    }

    let isLikedNow = false;

    if (existingLike) {
      // Unlike
      const { error: deleteError } = await supabase
        .from("likes")
        .delete()
        .eq("id", existingLike.id);

      if (deleteError) {
        console.error("Error deleting like:", deleteError);
        return { success: false, error: deleteError.message, isLiked: false };
      }
      isLikedNow = false;
    } else {
      // Like
      const { error: insertError } = await supabase
        .from("likes")
        .insert({
          component_id: componentId,
          user_id: user.id
        });

      if (insertError) {
        console.error("Error inserting like:", insertError);
        return { success: false, error: insertError.message, isLiked: false };
      }
      isLikedNow = true;
    }

    // Revalidate component specific cache
    revalidatePath(`/component/${componentId}`);
    revalidatePath("/");

    return { success: true, isLiked: isLikedNow };
  } catch (err: any) {
    console.error("Error in toggleLikeAction:", err);
    return { success: false, error: err.message || "An unexpected error occurred.", isLiked: false };
  }
}

export async function getLikeStatusAction(componentId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: true, isLiked: false };

    const { data, error } = await supabase
      .from("likes")
      .select("id")
      .eq("component_id", componentId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Error checking like status:", error);
      return { success: false, isLiked: false, error: error.message };
    }
    return { success: true, isLiked: !!data };
  } catch (err: any) {
    console.error("Error in getLikeStatusAction:", err);
    return { success: false, isLiked: false, error: err.message };
  }
}
