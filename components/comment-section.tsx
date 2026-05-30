"use client";

import { useState } from "react";

import toast from "react-hot-toast";

import { createClient } from "@/lib/supabase/client";

type Props = {
  componentId: string;
};

export default function CommentSection({
  componentId,
}: Props) {
  const supabase = createClient();

  const [comment, setComment] =
    useState("");

  const handleComment = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error("Login first");
      return;
    }

    await supabase
      .from("comments")
      .insert({
        component_id: componentId,
        user_id: user.id,
        content: comment,
      });

    toast.success("Comment added");

    setComment("");
  };

  return (
    <div className="mt-10">

      <textarea
        value={comment}
        onChange={(e) =>
          setComment(e.target.value)
        }
        placeholder="Write comment..."
        className="
          h-32
          w-full
          rounded-xl
          border
          p-4
        "
      />

      <button
        onClick={handleComment}
        className="
          mt-4
          rounded-xl
          bg-black
          px-6
          py-3
          text-white
        "
      >
        Add Comment
      </button>

    </div>
  );
}