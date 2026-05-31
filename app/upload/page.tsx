"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "react-hot-toast";
import { uploadComponentAction } from "./actions";

export default function UploadPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      toast.error("Please enter a title.");
      return;
    }

    setUploading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast.error("You must be logged in to upload a component.");
        router.push("/login");
        return;
      }

      let imageUrl = previewUrl || "https://images.unsplash.com/photo-1555066931-4365d14bab8c";

      if (file) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("components")
          .upload(fileName, file);

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from("components")
            .getPublicUrl(fileName);
          imageUrl = publicUrl;
        } else {
          console.error("Storage upload error:", uploadError);
          throw new Error(`Storage upload failed: ${uploadError.message}. Please verify that the 'components' bucket is created in Supabase Storage with upload policies.`);
        }
      }

      await uploadComponentAction({
        title,
        description,
        category,
        tags: tags.split(",").map(t => t.trim()).filter(Boolean),
        preview_url: previewUrl,
        image_url: imageUrl
      });

      toast.success("Component uploaded successfully!");
      router.push("/");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to upload component.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl p-10">
      <h1 className="mb-8 text-4xl font-bold font-sans">
        Upload Component
      </h1>

      <form onSubmit={handleUpload} className="space-y-6">
        <input
          type="text"
          placeholder="Component title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-xl border p-4 font-sans focus:outline-hidden focus:ring-2 focus:ring-[rgb(99,102,241)] focus:border-transparent transition-all"
          required
        />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="h-40 w-full rounded-xl border p-4 font-sans focus:outline-hidden focus:ring-2 focus:ring-[rgb(99,102,241)] focus:border-transparent transition-all"
        />

        <input
          type="text"
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full rounded-xl border p-4 font-sans focus:outline-hidden focus:ring-2 focus:ring-[rgb(99,102,241)] focus:border-transparent transition-all"
        />

        <input
          type="text"
          placeholder="Tags (comma separated)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="w-full rounded-xl border p-4 font-sans focus:outline-hidden focus:ring-2 focus:ring-[rgb(99,102,241)] focus:border-transparent transition-all"
        />

        <input
          type="text"
          placeholder="Preview URL / Fallback Image URL"
          value={previewUrl}
          onChange={(e) => setPreviewUrl(e.target.value)}
          className="w-full rounded-xl border p-4 font-sans focus:outline-hidden focus:ring-2 focus:ring-[rgb(99,102,241)] focus:border-transparent transition-all"
        />

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-slate-500 font-sans">Preview Image File</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
            className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-slate-50 file:text-slate-700 hover:file:bg-slate-100 transition-all cursor-pointer font-sans"
          />
        </div>

        <button
          type="submit"
          disabled={uploading}
          className="w-full rounded-xl bg-[rgb(99,102,241)] hover:bg-[rgb(79,70,229)] px-6 py-4 text-white font-semibold transition-all disabled:opacity-50 cursor-pointer font-sans shadow-[0_4px_14px_rgba(99,102,241,0.15)] hover:scale-[1.01] active:scale-[0.99]"
        >
          {uploading ? "Uploading..." : "Upload Component"}
        </button>
      </form>
    </div>
  );
}