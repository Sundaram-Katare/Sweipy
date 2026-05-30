"use client";

import { useState } from "react";

import { Heart } from "lucide-react";

import toast from "react-hot-toast";

import { createClient } from "@/lib/supabase/client";

type Props = {
  componentId: string;

  initialLikes: number;
};

export default function LikeButton({
  componentId,
  initialLikes,
}: Props) {
  const supabase = createClient();

  const [likes, setLikes] =
    useState(initialLikes);

  const [loading, setLoading] =
    useState(false);

  const handleLike = async () => {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("Login first");
        return;
      }

      await supabase
        .from("likes")
        .insert({
          component_id: componentId,
          user_id: user.id,
        });

      await supabase.rpc(
        "increment_likes",
        {
          row_id: componentId,
        }
      );

      setLikes((prev) => prev + 1);

      toast.success("Liked");
    } catch (err) {
      console.log(err);

      toast.error("Already liked");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      disabled={loading}
      onClick={handleLike}
      className="
        flex
        items-center
        gap-2
      "
    >
      <Heart size={20} />

      <p>{likes}</p>
    </button>
  );
}