"use server";

import { createClient } from "@/lib/supabase/server";

export async function submitRatingAction(rating: number, feedback: string = "") {
  if (rating < 1 || rating > 5) {
    throw new Error("Rating must be between 1 and 5 stars.");
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { error } = await supabase
    .from("ratings")
    .insert({
      rating,
      feedback: feedback.trim(),
      user_id: user?.id || null,
    });

  if (error) {
    console.error("Error submitting rating:", error);
    throw new Error("Failed to submit rating. Please try again.");
  }

  return { success: true };
}
