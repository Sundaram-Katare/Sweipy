"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";
import { addCommentAction, fetchCommentsAction } from "@/actions/comments";
import { MessageSquare, Send, Calendar } from "lucide-react";

type Props = {
  componentId: string;
  isModal?: boolean;
};

export default function CommentSection({ componentId, isModal }: Props) {
  const supabase = createClient();
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadSession() {
      const { data } = await supabase.auth.getUser();
      setCurrentUser(data?.user);
    }
    loadSession();
  }, []);

  useEffect(() => {
    async function loadComments() {
      try {
        const data = await fetchCommentsAction(componentId);
        setComments(data);
      } catch (err) {
        console.error("Failed to load comments:", err);
      } finally {
        setLoading(false);
      }
    }
    loadComments();
  }, [componentId]);

  // Real-time comments synchronization
  useEffect(() => {
    const channel = supabase
      .channel(`component-comments-${componentId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "comments",
          filter: `component_id=eq.${componentId}`,
        },
        async (payload: any) => {
          // Resolve profile for the new comment author
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", payload.new.user_id)
            .single();

          const fullComment: any = {
            ...payload.new,
            profiles: profile,
          };

          setComments((prev) => {
            if (prev.some((c) => c.id === fullComment.id)) return prev;
            return [...prev, fullComment];
          });

          // Scroll to bottom
          setTimeout(() => {
            commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
          }, 100);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [componentId, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    if (!currentUser) {
      toast.error("Please log in to add a comment.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await addCommentAction(componentId, commentText);
      if (!result.success) {
        throw new Error(result.error);
      }
      setCommentText("");
      toast.success("Comment added successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to post comment.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className={isModal ? "w-full space-y-4" : "mt-12 glass-panel p-6 sm:p-8 rounded-3xl border border-slate-100 dark:border-zinc-800/80"}>
      {!isModal && (
        <h3 className="text-xl sm:text-2xl font-bold flex items-center gap-2 mb-6">
          <MessageSquare className="w-5 h-5 text-indigo-500" />
          <span>Comments</span>
          <span className="text-sm font-normal text-slate-400">({comments.length})</span>
        </h3>
      )}

      {/* Comments List */}
      <div className="max-h-[450px] overflow-y-auto pr-2 custom-scrollbar space-y-4 mb-8">
        {loading ? (
          <div className="space-y-4 py-4">
            {[1, 2].map((i) => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-zinc-800" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 bg-slate-200 dark:bg-zinc-800 rounded-md" />
                  <div className="h-10 w-full bg-slate-100 dark:bg-zinc-900 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : comments.length === 0 ? (
          <div className="py-12 text-center text-slate-400 dark:text-zinc-500">
            <p className="text-lg">No comments yet</p>
            <p className="text-sm mt-1">Be the first to share your thoughts!</p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence initial={false}>
              {comments.map((comment) => {
                const author = comment.profiles;
                const avatar = author?.avatar_url || "/default-avatar.avif";
                const username = author?.username || "Anonymous";

                return (
                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="flex items-start gap-3 p-3 rounded-2xl hover:bg-slate-50/50 dark:hover:bg-zinc-800/20 transition-all duration-200"
                  >
                    <img
                      src={avatar}
                      alt={username}
                      className="w-10 h-10 rounded-full object-cover border border-slate-100 dark:border-zinc-800 shadow-xs shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-sm truncate dark:text-zinc-200">
                          {username}
                        </span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1 shrink-0">
                          <Calendar className="w-3 h-3" />
                          {formatDate(comment.created_at)}
                        </span>
                      </div>
                      <div className="mt-1.5 p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/40 text-sm text-slate-600 dark:text-zinc-300 leading-relaxed break-words font-sans">
                        {comment.content}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            <div ref={commentsEndRef} />
          </div>
        )}
      </div>

      {/* Input Box */}
      <form onSubmit={handleSubmit} className="relative mt-4">
        <textarea
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder={
            currentUser ? "Add to the discussion..." : "Login to write a comment..."
          }
          disabled={!currentUser || submitting}
          rows={3}
          className="w-full text-sm font-sans p-4 pr-12 rounded-2xl border border-slate-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 text-slate-700 dark:text-zinc-200 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none shadow-xs disabled:opacity-60"
        />

        <div className="absolute bottom-4 right-4">
          <motion.button
            whileHover={{ scale: currentUser ? 1.05 : 1 }}
            whileTap={{ scale: currentUser ? 0.95 : 1 }}
            type="submit"
            disabled={!currentUser || !commentText.trim() || submitting}
            className={`
              flex
              items-center
              justify-center
              w-9
              h-9
              rounded-xl
              text-white
              transition-all
              shadow-sm
              cursor-pointer
              ${
                currentUser && commentText.trim()
                  ? "bg-indigo-500 hover:bg-indigo-600 shadow-indigo-500/20"
                  : "bg-slate-200 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500 cursor-not-allowed"
              }
            `}
          >
            <Send className="w-4 h-4" />
          </motion.button>
        </div>
      </form>
    </div>
  );
}