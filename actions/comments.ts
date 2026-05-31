"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addCommentAction(componentId: string, content: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "You must be logged in to comment." };
    }

    if (!content || content.trim().length === 0) {
      return { success: false, error: "Comment cannot be empty." };
    }

    const { data, error } = await supabase
      .from("comments")
      .insert({
        component_id: componentId,
        user_id: user.id,
        content: content.trim()
      })
      .select("*, profiles(*)")
      .single();

    if (error) {
      console.error("Error adding comment:", error);
      return { success: false, error: error.message };
    }

    revalidatePath(`/component/${componentId}`);
    
    return { success: true, comment: data };
  } catch (err: any) {
    console.error("Error in addCommentAction:", err);
    return { success: false, error: err.message || "An unexpected error occurred." };
  }
}

export async function fetchCommentsAction(componentId: string) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("comments")
      .select("*, profiles(*)")
      .eq("component_id", componentId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching comments:", error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("Error in fetchCommentsAction:", err);
    return [];
  }
}
