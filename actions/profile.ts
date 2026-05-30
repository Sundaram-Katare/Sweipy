"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateProfileAction(formData: {
  username: string;
  bio: string;
  avatar_url: string;
  github_url: string;
  twitter_url: string;
  website_url: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be logged in to update your profile.");
  }

  if (!formData.username || formData.username.trim().length === 0) {
    throw new Error("Username is required.");
  }

  // Check if username is taken by someone else
  const { data: existingUser } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", formData.username.trim())
    .neq("id", user.id)
    .maybeSingle();

  if (existingUser) {
    throw new Error("Username already taken. Please try another one.");
  }

  const { error } = await supabase
    .from("profiles")
    .upsert({
      id: user.id,
      username: formData.username.trim(),
      bio: formData.bio || "",
      avatar_url: formData.avatar_url || "",
      github_url: formData.github_url || "",
      twitter_url: formData.twitter_url || "",
      website_url: formData.website_url || "",
    });

  if (error) {
    console.error("Profile update failed on server:", error);
    throw new Error(error.message);
  }

  revalidatePath("/profile");
  revalidatePath(`/user/${user.id}`);
  revalidatePath("/leaderboard");

  return { success: true };
}
