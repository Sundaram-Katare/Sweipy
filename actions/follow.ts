"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function toggleFollowAction(followingId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be logged in to follow users.");
  }

  if (user.id === followingId) {
    throw new Error("You cannot follow yourself.");
  }

  const { data: existingFollow, error: fetchError } = await supabase
    .from("follows")
    .select("id")
    .eq("follower_id", user.id)
    .eq("following_id", followingId)
    .maybeSingle();

  if (fetchError) {
    console.error("Error checking follow:", fetchError);
    throw new Error("Follow action failed to load status.");
  }

  let isFollowingNow = false;

  if (existingFollow) {
    // Unfollow
    const { error: deleteError } = await supabase
      .from("follows")
      .delete()
      .eq("id", existingFollow.id);

    if (deleteError) {
      console.error("Error unfollowing:", deleteError);
      throw new Error(deleteError.message);
    }
    isFollowingNow = false;
  } else {
    // Follow
    const { error: insertError } = await supabase
      .from("follows")
      .insert({
        follower_id: user.id,
        following_id: followingId
      });

    if (insertError) {
      console.error("Error following user:", insertError);
      throw new Error(insertError.message);
    }
    isFollowingNow = true;
  }

  revalidatePath(`/user/${followingId}`);
  revalidatePath("/leaderboard");

  return { success: true, isFollowing: isFollowingNow };
}

export async function getFollowStatusAction(followingId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { isFollowing: false };

  const { data, error } = await supabase
    .from("follows")
    .select("id")
    .eq("follower_id", user.id)
    .eq("following_id", followingId)
    .maybeSingle();

  if (error) return { isFollowing: false };
  return { isFollowing: !!data };
}

export async function getFollowCountsAction(userId: string) {
  const supabase = await createClient();

  const { count: followersCount } = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("following_id", userId);

  const { count: followingCount } = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("follower_id", userId);

  return {
    followers: followersCount || 0,
    following: followingCount || 0
  };
}
