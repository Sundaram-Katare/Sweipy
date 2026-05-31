"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, X, MessageSquare, Check } from "lucide-react";
import toast from "react-hot-toast";
import { submitRatingAction } from "@/actions/ratings";

export default function RatingButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Please select a star rating.");
      return;
    }

    setSubmitting(true);
    try {
      await submitRatingAction(rating, feedback);
      toast.success("Thank you for your rating!", { icon: "⭐️" });
      setSubmitted(true);
      
      // Auto close after 2.5 seconds
      setTimeout(() => {
        handleClose();
      }, 2500);
    } catch (err: any) {
      toast.error(err.message || "Failed to submit rating.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    // Delay resetting state to allow exit animation to complete
    setTimeout(() => {
      setRating(0);
      setHoveredRating(0);
      setFeedback("");
      setSubmitted(false);
    }, 200);
  };

  return (
    <>
      {/* Floating Button in bottom right */}
      <motion.button
        id="app-rating-floating-btn"
        aria-label="Rate our application"
        // Gentle floating continuous motion combined with subtle pulse glow
        animate={{
          y: [0, -8, 0],
          boxShadow: [
            "0 10px 25px -5px rgba(99, 102, 241, 0.3), 0 0 0 0px rgba(99, 102, 241, 0)",
            "0 10px 25px -5px rgba(99, 102, 241, 0.4), 0 0 0 6px rgba(99, 102, 241, 0.15)",
            "0 10px 25px -5px rgba(99, 102, 241, 0.3), 0 0 0 0px rgba(99, 102, 241, 0)"
          ]
        }}
        transition={{
          y: {
            repeat: Infinity,
            duration: 3,
            ease: "easeInOut"
          },
          boxShadow: {
            repeat: Infinity,
            duration: 2.2,
            ease: "easeInOut"
          }
        }}
        whileHover={{ scale: 1.1, y: -10 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed md:bottom-6 md:right-6 md:top-auto md:left-auto top-4 right-4 z-40 flex items-center justify-center md:gap-2 p-0 md:px-4 md:py-3 w-10 h-10 md:w-auto md:h-auto rounded-full bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 text-white font-sans text-xs font-bold uppercase tracking-wider shadow-lg cursor-pointer border border-indigo-400/20"
      >
        <Star className="w-4 h-4 fill-amber-300 stroke-amber-300 animate-pulse" />
        <span className="hidden md:inline">Rate Us</span>
      </motion.button>

      {/* Modal Rating Dialog */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Dark Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="absolute inset-0 bg-black/50 backdrop-blur-xs"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
              className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-200/50 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md p-6 sm:p-8 shadow-2xl z-10 font-sans"
            >
              {/* Close Button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 p-1.5 rounded-xl border border-slate-100 dark:border-zinc-800 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>

              <AnimatePresence mode="wait">
                {!submitted ? (
                  <motion.form
                    key="rating-form"
                    onSubmit={handleSubmit}
                    className="space-y-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {/* Header */}
                    <div className="text-center space-y-2">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/25 mb-1">
                        <Star className="w-6 h-6 text-indigo-500 fill-indigo-500/10" />
                      </div>
                      <h3 className="text-xl font-extrabold tracking-tight text-slate-800 dark:text-zinc-100">
                        Rate Sweipy
                      </h3>
                      <p className="text-xs text-slate-400 dark:text-zinc-500 max-w-xs mx-auto">
                        Your feedback helps us make the template sharing platform even better for creators.
                      </p>
                    </div>

                    {/* Star Selector */}
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="flex items-center gap-1.5">
                        {[1, 2, 3, 4, 5].map((index) => {
                          const isHighlighted = hoveredRating >= index || rating >= index;
                          return (
                            <button
                              key={index}
                              type="button"
                              id={`star-rating-btn-${index}`}
                              aria-label={`Rate ${index} star${index > 1 ? "s" : ""}`}
                              onMouseEnter={() => setHoveredRating(index)}
                              onMouseLeave={() => setHoveredRating(0)}
                              onClick={() => setRating(index)}
                              className="p-1 cursor-pointer transition-transform active:scale-90 hover:scale-110"
                            >
                              <Star
                                className={`w-8 h-8 transition-colors duration-150 ${
                                  isHighlighted
                                    ? "text-amber-400 fill-amber-400 drop-shadow-[0_2px_8px_rgba(245,158,11,0.3)]"
                                    : "text-slate-200 dark:text-zinc-700 fill-transparent"
                                }`}
                              />
                            </button>
                          );
                        })}
                      </div>
                      {rating > 0 && (
                        <motion.span
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest"
                        >
                          {rating === 1 && "Need improvement 🥺"}
                          {rating === 2 && "Could be better 😕"}
                          {rating === 3 && "Pretty good! 🙂"}
                          {rating === 4 && "Awesome experience! 🤩"}
                          {rating === 5 && "Absolutely love it! 🚀"}
                        </motion.span>
                      )}
                    </div>

                    {/* Feedback Textarea */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 pl-0.5">
                        <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Optional Feedback</span>
                      </label>
                      <textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="Tell us what you like, or how we can improve..."
                        rows={3}
                        className="w-full text-sm font-sans p-4 rounded-2xl border border-slate-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-slate-800 dark:text-zinc-200 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none shadow-xs"
                      />
                    </div>

                    {/* Action Button */}
                    <button
                      type="submit"
                      disabled={rating === 0 || submitting}
                      className="w-full font-sans font-bold flex items-center justify-center gap-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-100 dark:disabled:bg-zinc-800 text-white disabled:text-slate-400 dark:disabled:text-zinc-500 py-3.5 shadow-sm shadow-indigo-500/10 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
                    >
                      <span>{submitting ? "Submitting..." : "Submit Rating"}</span>
                    </button>
                  </motion.form>
                ) : (
                  <motion.div
                    key="success-screen"
                    className="flex flex-col items-center justify-center py-8 text-center space-y-4"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-500">
                      <Check className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold text-slate-800 dark:text-zinc-100">
                        Feedback Submitted!
                      </h3>
                      <p className="text-xs text-slate-400 dark:text-zinc-500 max-w-xs mx-auto">
                        Thank you for sharing your thoughts. We truly appreciate your support.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
