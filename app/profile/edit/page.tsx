"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { updateProfileAction } from "@/actions/profile";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { User, FileText, Link as LinkIcon, Save, ArrowLeft, Image } from "lucide-react";

export default function EditProfilePage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    bio: "",
    avatar_url: "",
    github_url: "",
    twitter_url: "",
    website_url: "",
  });

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please login first.");
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (!error && data) {
        setFormData({
          username: data.username || "",
          bio: data.bio || "",
          avatar_url: data.avatar_url || "",
          github_url: data.github_url || "",
          twitter_url: data.twitter_url || "",
          website_url: data.website_url || "",
        });
      }
      setLoading(false);
    }
    loadProfile();
  }, [router, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username.trim()) {
      toast.error("Username is required.");
      return;
    }

    setSaving(true);
    try {
      await updateProfileAction(formData);
      toast.success("Profile updated successfully!");
      router.push("/profile");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 w-full max-w-2xl mx-auto px-6 py-20 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
        <p className="text-slate-400 font-sans text-sm">Loading settings details...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full max-w-2xl mx-auto px-6 py-10 space-y-8">
      {/* Return Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push("/profile")}
          className="flex items-center justify-center w-10 h-10 rounded-xl border border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-sans dark:text-zinc-100 tracking-tight">
            Account Settings
          </h1>
          <p className="text-xs text-slate-400 font-sans">
            Customize how you appear across the UISwipe feed community.
          </p>
        </div>
      </div>

      {/* Main Settings Form */}
      <motion.form
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200/50 dark:border-zinc-800/80 space-y-6"
      >
        {/* Username */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider font-sans flex items-center gap-1.5">
            <User className="w-4 h-4 text-indigo-500" />
            <span>Display Name (Username)</span>
          </label>
          <input
            type="text"
            required
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            placeholder="CreativeName"
            className="w-full font-sans p-4 rounded-xl border border-slate-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-slate-800 dark:text-zinc-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>

        {/* Profile Avatar Url */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider font-sans flex items-center gap-1.5">
            <Image className="w-4 h-4 text-indigo-500" />
            <span>Profile Photo URL</span>
          </label>
          <input
            type="text"
            value={formData.avatar_url}
            onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
            placeholder="https://example.com/avatar.jpg"
            className="w-full font-sans p-4 rounded-xl border border-slate-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-slate-800 dark:text-zinc-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
          {formData.avatar_url && (
            <div className="flex items-center gap-2 pt-1.5 pl-1.5">
              <img
                src={formData.avatar_url}
                alt="Avatar preview"
                className="w-8 h-8 rounded-full object-cover border border-slate-200"
                onError={(e) => {
                  (e.target as any).src = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80";
                }}
              />
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Preview Avatar</span>
            </div>
          )}
        </div>

        {/* Biography */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider font-sans flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-indigo-500" />
            <span>Short Biography</span>
          </label>
          <textarea
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            placeholder="Designing beautiful user interfaces and crafting NextJS responsive sections..."
            rows={4}
            className="w-full font-sans p-4 rounded-xl border border-slate-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-slate-800 dark:text-zinc-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
          />
        </div>

        {/* Social connections */}
        <div className="border-t border-slate-100 dark:border-zinc-800/80 pt-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-700 dark:text-zinc-300 font-sans flex items-center gap-1.5">
            <LinkIcon className="w-4 h-4 text-indigo-500" />
            <span>Social Portfolios</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* GitHub */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 fill-current text-indigo-500 dark:text-indigo-400 shrink-0" viewBox="0 0 24 24">
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                </svg>
                <span>GitHub Link</span>
              </label>
              <input
                type="text"
                value={formData.github_url}
                onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                placeholder="github.com/username"
                className="w-full font-sans p-3 rounded-lg border border-slate-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-slate-800 dark:text-zinc-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
              />
            </div>

            {/* Twitter */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 fill-current text-indigo-500 dark:text-indigo-400 shrink-0" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                <span>Twitter Link</span>
              </label>
              <input
                type="text"
                value={formData.twitter_url}
                onChange={(e) => setFormData({ ...formData, twitter_url: e.target.value })}
                placeholder="twitter.com/username"
                className="w-full font-sans p-3 rounded-lg border border-slate-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-slate-800 dark:text-zinc-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
              />
            </div>

            {/* Website URL */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans flex items-center gap-1">
                <LinkIcon className="w-3.5 h-3.5" />
                <span>Personal Portfolio Website</span>
              </label>
              <input
                type="text"
                value={formData.website_url}
                onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                placeholder="myportfolio.com"
                className="w-full font-sans p-3 rounded-lg border border-slate-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-slate-800 dark:text-zinc-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
              />
            </div>
          </div>
        </div>

        {/* Submit Form Button */}
        <button
          type="submit"
          disabled={saving}
          className="w-full font-sans font-bold flex items-center justify-center gap-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white py-4 shadow-sm shadow-indigo-500/10 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer"
        >
          <Save className="w-5 h-5" />
          <span>{saving ? "Saving Changes..." : "Save Settings"}</span>
        </button>
      </motion.form>
    </div>
  );
}
