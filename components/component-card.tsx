"use client";

import { motion } from "framer-motion";
import LikeButton from "./like-button";
import Link from "next/link";

import { Heart } from "lucide-react";

import { ComponentCard } from "@/types/database";

type Props = {
  component: ComponentCard;
};

export default function ComponentCardUI({
  component,
}: Props) {
  return (
    <Link href={`/component/${component.id}`}>
      <motion.div
        whileHover={{
          scale: 1.03,
        }}
        transition={{
          type: "spring",
          stiffness: 200,
        }}
        className="
        min-w-[700px]
        rounded-3xl
        border
        bg-white
        p-4
        shadow-xl
      "
      >

        <img
          src={component.image_url}
          className="
          h-[450px]
          w-full
          rounded-2xl
          object-cover
        "
        />

        <div className="mt-4 flex items-center justify-between">

          <div>
            <h2 className="text-2xl font-bold">
              {component.title}
            </h2>

            <p className="mt-2 text-gray-500">
              {component.description}
            </p>
          </div>

          <div className="flex items-center gap-4">

            <div className="flex items-center gap-2">

              <LikeButton
                componentId={component.id}
                initialLikes={component.likes_count}
              />

            </div>

            <p>
              💬 {component.comments_count}
            </p>

          </div>

        </div>

      </motion.div>
    </Link>
  );
}