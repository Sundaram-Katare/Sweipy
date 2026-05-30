"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function toggleLikeAction(componentId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be logged in to like a component.");
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
    throw new Error("Failed to process like status.");
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
      throw new Error(deleteError.message);
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
      throw new Error(insertError.message);
    }
    isLikedNow = true;
  }

  // Revalidate component specific cache
  revalidatePath(`/component/${componentId}`);
  revalidatePath("/");

  return { success: true, isLiked: isLikedNow };
}

export async function getLikeStatusAction(componentId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { isLiked: false };

  const { data, error } = await supabase
    .from("likes")
    .select("id")
    .eq("component_id", componentId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) return { isLiked: false };
  return { isLiked: !!data };
}
