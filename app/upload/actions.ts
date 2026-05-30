"use server";

import { createClient } from "@/lib/supabase/server";

export async function uploadComponentAction(formData: {
  title: string;
  description: string;
  category: string;
  tags: string[];
  preview_url: string;
  image_url: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be logged in to upload a component.");
  }

  const username = user.user_metadata?.user_name || user.user_metadata?.preferred_username || user.user_metadata?.name || user.email?.split("@")[0] || "user_" + user.id.slice(0, 5);
  const avatar_url = user.user_metadata?.avatar_url || "";

  const { error: profileError } = await supabase.from("profiles").upsert({
    id: user.id,
    username,
    avatar_url,
    bio: "",
  });

  if (profileError) {
    console.error("Profile upsert error on server:", profileError);
    throw new Error("Profile creation failed: " + profileError.message);
  }

  const { error } = await supabase.from("components").insert({
    title: formData.title,
    description: formData.description,
    category: formData.category,
    tags: formData.tags,
    preview_url: formData.preview_url,
    image_url: formData.image_url,
    github_url: "",
    user_id: user.id,
    likes_count: 0,
    comments_count: 0,
    views_count: 0
  });

  if (error) {
    console.error("Server insertion error:", error);
    throw new Error(error.message);
  }

  return { success: true };
}
