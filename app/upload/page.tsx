"use client";

import { useState } from "react";

export default function UploadPage() {
  const [title, setTitle] = useState("");

  return (
    <div className="mx-auto max-w-2xl p-10">
      <h1 className="mb-8 text-4xl font-bold">
        Upload Component
      </h1>

      <form className="space-y-6">

        <input
          type="text"
          placeholder="Component title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-xl border p-4"
        />

        <textarea
          placeholder="Description"
          className="h-40 w-full rounded-xl border p-4"
        />

        <input
          type="text"
          placeholder="Category"
          className="w-full rounded-xl border p-4"
        />

        <input
          type="text"
          placeholder="Tags (comma separated)"
          className="w-full rounded-xl border p-4"
        />

        <input
          type="text"
          placeholder="Preview URL"
          className="w-full rounded-xl border p-4"
        />

        <input
          type="text"
          placeholder="GitHub URL"
          className="w-full rounded-xl border p-4"
        />

        <input type="file" />

        <button
          className="rounded-xl bg-black px-6 py-4 text-white"
        >
          Upload
        </button>

      </form>
    </div>
  );
}