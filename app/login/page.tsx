"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Sparkles, Heart, KeyRound, UserPlus } from "lucide-react";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // GitHub OAuth Login
  const signInWithGithub = async () => {
    try {
      const redirectTo = `${window.location.origin}/auth/callback`;
      await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo,
        },
      });
    } catch (err: any) {
      toast.error(err.message || "Failed to log in with GitHub.");
    }
  };

  // Normal Email & Password Login / Signup
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter both email and password.");
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        // Sign Up Flow
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              user_name: email.split("@")[0],
            }
          }
        });

        if (error) throw error;

        // Initialize default user profiles record
        if (data.user) {
          const username = email.split("@")[0];
          const { error: profileError } = await supabase.from("profiles").upsert({
            id: data.user.id,
            username,
            avatar_url: "/default-avatar.avif",
            bio: "Sweipy UI Sharing Creator",
          });

          if (profileError) {
            console.warn("Default profile initialization warning:", profileError.message);
          }
        }

        if (data.session) {
          // Automatic login if email confirmation is disabled in Supabase dashboard
          toast.success("Account created! Welcome to Sweipy!", { icon: "🚀" });
          router.push("/");
          router.refresh();
        } else {
          // Fallback if email confirmation is enabled
          toast.success("Account created successfully! Check your inbox or log in.", { duration: 6000 });
          setIsSignUp(false);
        }
      } else {
        // Sign In Flow
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        toast.success("Welcome back!", { icon: "👋" });
        router.push("/");
        router.refresh();
      }
    } catch (err: any) {
      toast.error(err.message || "Authentication failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 w-full min-h-[calc(100vh-5rem)] flex bg-linear-to-b from-slate-50 to-white dark:from-zinc-950 dark:to-zinc-900 overflow-hidden font-sans">

      {/* Left side: Credentials & OAuth form (50% width on large displays) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 sm:px-12 py-10">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="w-full max-w-md space-y-8"
        >
          {/* Logo Brand info */}
          <div className="text-center lg:text-left space-y-2">
            <div className="inline-flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/25">
                <Heart className="w-5 h-5 text-indigo-500 fill-indigo-500/10" />
              </div>
              <h1 className="text-2xl font-black tracking-tight text-slate-800 dark:text-zinc-100 font-sans">
                Sweipy<span className="text-indigo-500 font-medium">.</span>
              </h1>
            </div>
            <h2 className="text-3xl font-extrabold text-slate-800 dark:text-zinc-100 tracking-tight mt-3">
              {isSignUp ? "Create an account" : "Welcome back"}
            </h2>
            <p className="text-sm text-slate-400 dark:text-zinc-500">
              {isSignUp
                ? "Get inspired and start sharing frontend layouts today."
                : "Log in with your normal credentials or GitHub account."}
            </p>
          </div>

          {/* Form Switch tabs */}
          <div className="flex border-b border-slate-200 dark:border-zinc-800/80 p-0.5">
            <button
              onClick={() => setIsSignUp(false)}
              className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider transition-all rounded-lg cursor-pointer ${!isSignUp
                  ? "bg-white dark:bg-zinc-900 text-indigo-500 dark:text-indigo-400 shadow-sm border border-slate-200/50 dark:border-zinc-800"
                  : "text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300"
                }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsSignUp(true)}
              className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider transition-all rounded-lg cursor-pointer ${isSignUp
                  ? "bg-white dark:bg-zinc-900 text-indigo-500 dark:text-indigo-400 shadow-sm border border-slate-200/50 dark:border-zinc-800"
                  : "text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300"
                }`}
            >
              Create Account
            </button>
          </div>

          {/* Credentials Authentication Form */}
          <form onSubmit={handleAuth} className="space-y-4">

            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans flex items-center gap-1.5 pl-0.5">
                <Mail className="w-3.5 h-3.5 text-indigo-500" />
                <span>Email Address</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="creative@designer.com"
                className="w-full font-sans p-4 rounded-xl border border-slate-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 text-slate-800 dark:text-zinc-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans flex items-center gap-1.5 pl-0.5">
                <Lock className="w-3.5 h-3.5 text-indigo-500" />
                <span>Secure Password</span>
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full font-sans p-4 rounded-xl border border-slate-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 text-slate-800 dark:text-zinc-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full font-sans font-bold flex items-center justify-center gap-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white py-4 shadow-sm shadow-indigo-500/10 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSignUp ? (
                <>
                  <UserPlus className="w-5 h-5" />
                  <span>{loading ? "Registering..." : "Sign Up"}</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-5 h-5" />
                  <span>{loading ? "Signing in..." : "Sign In"}</span>
                </>
              )}
            </button>
          </form>

          {/* Social Divider */}
          <div className="relative flex items-center justify-center select-none py-1">
            <div className="absolute w-full border-t border-slate-200 dark:border-zinc-800/80"></div>
            <span className="relative px-3 bg-linear-to-b from-slate-50 to-white dark:from-zinc-950 dark:to-zinc-900 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Or Connect With
            </span>
          </div>

          {/* GitHub OAuth Button */}
          <button
            onClick={signInWithGithub}
            type="button"
            className="w-full font-sans font-semibold flex items-center justify-center gap-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/40 text-slate-700 dark:text-zinc-300 py-3.5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:bg-slate-50 dark:hover:bg-zinc-800/60 active:scale-[0.99] transition-all cursor-pointer"
          >
            <svg className="w-5 h-5 fill-current text-slate-900 dark:text-zinc-100 shrink-0" viewBox="0 0 24 24">
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
            </svg>
            <span>Continue with GitHub</span>
          </button>
        </motion.div>
      </div>

      {/* Right side: Large Placeholder Graphic (50% width - hidden on mobile) */}
      <div className="hidden lg:block lg:w-1/2 relative bg-zinc-950 border-l border-zinc-900 overflow-hidden">

        {/* Glow backlight rings */}
        <div className="absolute top-[10%] left-[20%] w-[350px] h-[350px] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] rounded-full bg-blue-500/10 blur-[130px] pointer-events-none" />

        {/* Visual Screenshot Graphic Placeholder Box */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center space-y-8 z-10">

          {/* Glass mock card stack display */}
          <div className="relative w-full max-w-md h-[300px] glass-panel rounded-3xl border border-zinc-800/80 bg-zinc-900/40 shadow-2xl flex items-center justify-center overflow-hidden flex-col space-y-4">

            {/* The user will swap in their own screenshot/image here. We display a highly refined vector placeholder */}
            {/* <div className="w-16 h-16 rounded-2xl bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-indigo-400 animate-pulse" />
            </div> */}

            <div className="h-full">
              <img src="https://img.magnific.com/free-photo/celebration-labour-day-with-3d-cartoon-portrait-working-woman_23-2151306563.jpg?semt=ais_hybrid&w=740&q=80" alt="" />
            </div>

            {/* Glowing active indicator line */}
            <div className="absolute bottom-0 w-32 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent rounded-full shadow-lg shadow-indigo-500/25" />
          </div>

          {/* Inspirational Taglines */}
          <div className="space-y-2">
            <h3 className="text-xl font-bold font-sans text-zinc-100 tracking-tight">
              Design Inspiration Flashcards
            </h3>
            <p className="text-xs text-zinc-500 font-sans max-w-sm leading-relaxed">
              Explore reusable frontend components, website hero sections, and custom landing page elements with tactile horizontal swipes.
            </p>
          </div>

        </div>

        {/* Abstract dark grid background pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-900/20 via-zinc-950/80 to-zinc-950 pointer-events-none opacity-50 z-0" />
      </div>

    </div>
  );
}