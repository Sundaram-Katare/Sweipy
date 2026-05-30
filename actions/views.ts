"use server";

import { createClient } from "@/lib/supabase/server";

export async function incrementViewAction(componentId: string) {
  const supabase = await createClient();

  // Retrieve current view count
  const { data: component, error: fetchError } = await supabase
    .from("components")
    .select("views_count")
    .eq("id", componentId)
    .single();

  if (fetchError || !component) {
    return { success: false };
  }

  const newViews = (component.views_count || 0) + 1;

  // Increment view count
  const { error: updateError } = await supabase
    .from("components")
    .update({ views_count: newViews })
    .eq("id", componentId);

  if (updateError) {
    console.error("Failed to increment views:", updateError);
    return { success: false };
  }

  return { success: true, views: newViews };
}
