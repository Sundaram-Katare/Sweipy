"use client";

import { useState, useRef, useEffect } from "react";
import { Trophy, Award, Heart, Eye, Share2, Download, Copy, X, ExternalLink, Sparkles } from "lucide-react";
import Link from "next/link";

const TwitterIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
    <path fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

interface LeaderboardUser {
  userId: string;
  username: string;
  avatar: string;
  bio: string;
  likes: number;
  comments: number;
  views: number;
  uploads: number;
  score: number;
}

interface Props {
  leaderboard: LeaderboardUser[];
}

export default function LeaderboardClient({ leaderboard }: Props) {
  const [activeShareUser, setActiveShareUser] = useState<(LeaderboardUser & { rank: number }) | null>(null);
  const [cardImage, setCardImage] = useState<string | null>(null);
  const [canvasLoading, setCanvasLoading] = useState(false);

  const first = leaderboard[0];
  const second = leaderboard[1];
  const third = leaderboard[2];

  // Generate Card Image on HTML5 Canvas
  useEffect(() => {
    if (!activeShareUser) {
      setCardImage(null);
      return;
    }

    setCanvasLoading(true);
    const canvas = document.createElement("canvas");
    canvas.width = 1000;
    canvas.height = 600;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      setCanvasLoading(false);
      return;
    }

    // 1. Background linear gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 1000, 600);
    bgGrad.addColorStop(0, "#09090b");     // Zinc 950
    bgGrad.addColorStop(0.5, "#18181b");   // Zinc 900
    bgGrad.addColorStop(1, "#1e1b4b");     // Indigo 950
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1000, 600);

    // 2. Draw glowing abstract decorative background shapes
    ctx.save();
    // Glowing circle in bottom right
    const glow1 = ctx.createRadialGradient(850, 500, 50, 850, 500, 400);
    glow1.addColorStop(0, "rgba(99, 102, 241, 0.15)"); // Indigo 500
    glow1.addColorStop(1, "rgba(99, 102, 241, 0)");
    ctx.fillStyle = glow1;
    ctx.beginPath();
    ctx.arc(850, 500, 400, 0, Math.PI * 2);
    ctx.fill();

    // Glowing circle in top left
    const glow2 = ctx.createRadialGradient(150, 100, 50, 150, 100, 300);
    glow2.addColorStop(0, "rgba(245, 158, 11, 0.08)");  // Amber 500
    glow2.addColorStop(1, "rgba(245, 158, 11, 0)");
    ctx.fillStyle = glow2;
    ctx.beginPath();
    ctx.arc(150, 100, 300, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 3. Draw grid system watermark
    ctx.save();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.02)";
    ctx.lineWidth = 1;
    const gridSize = 50;
    for (let x = 0; x < 1000; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 600);
      ctx.stroke();
    }
    for (let y = 0; y < 600; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(1000, y);
      ctx.stroke();
    }
    ctx.restore();

    // 4. Logo & Brand header (Top Left)
    ctx.save();
    // Glowing branding dot
    ctx.fillStyle = "#6366f1";
    ctx.beginPath();
    ctx.arc(60, 60, 12, 0, Math.PI * 2);
    ctx.fill();
    // Inner logo heart shape
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 16px sans-serif";
    ctx.fillText("S", 55, 66);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 26px sans-serif";
    ctx.fillText("Sweipy", 88, 68);
    ctx.restore();

    // 5. Leaderboard Achievement tag (Top Right)
    ctx.save();
    ctx.fillStyle = "rgba(99, 102, 241, 0.1)";
    ctx.strokeStyle = "rgba(99, 102, 241, 0.3)";
    ctx.lineWidth = 2;
    // Draw rounded capsule
    const capsuleX = 680;
    const capsuleY = 40;
    const capsuleW = 260;
    const capsuleH = 40;
    const radius = 20;
    ctx.beginPath();
    ctx.roundRect(capsuleX, capsuleY, capsuleW, capsuleH, radius);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#a5b4fc";
    ctx.font = "bold 13px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("TRENDING CREATOR CARD", capsuleX + capsuleW / 2, capsuleY + 25);
    ctx.restore();

    // 6. Main Details Section (Rank, Username, Score)
    const drawDetails = () => {
      // User Profile details
      ctx.save();
      ctx.fillStyle = "#ffffff";
      ctx.font = "extrabold 52px sans-serif";
      ctx.fillText(activeShareUser.username, 70, 240);

      ctx.fillStyle = "#94a3b8"; // Slate 400
      ctx.font = "normal 22px sans-serif";
      const bioText = activeShareUser.bio || "Sweipy design creator";
      const truncatedBio = bioText.length > 42 ? bioText.substring(0, 42) + "..." : bioText;
      ctx.fillText(truncatedBio, 70, 290);
      ctx.restore();

      // Stats grid
      ctx.save();
      // Total Uploads
      ctx.fillStyle = "#64748b"; // Slate 500
      ctx.font = "bold 16px sans-serif";
      ctx.fillText("TEMPLATES UPLOADED", 70, 390);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 38px sans-serif";
      ctx.fillText(`${activeShareUser.uploads}`, 70, 440);

      // Score points
      ctx.fillStyle = "#64748b";
      ctx.font = "bold 16px sans-serif";
      ctx.fillText("TOTAL SCORE POINTS", 340, 390);

      ctx.fillStyle = "#6366f1"; // Indigo 500
      ctx.font = "bold 38px sans-serif";
      ctx.fillText(`${activeShareUser.score} pts`, 340, 440);
      ctx.restore();

      // Giant glowing Rank Badge on the right
      ctx.save();
      const badgeX = 740;
      const badgeY = 320;

      // Outer golden/indigo glow depending on rank
      const rankColor = activeShareUser.rank === 1 
        ? "#fbbf24" // Gold
        : activeShareUser.rank === 2
        ? "#cbd5e1" // Silver
        : activeShareUser.rank === 3
        ? "#d97706" // Bronze
        : "#6366f1"; // Indigo default

      // Badge back-glow
      const badgeGlow = ctx.createRadialGradient(badgeX, badgeY, 10, badgeX, badgeY, 150);
      badgeGlow.addColorStop(0, rankColor + "33"); // 20% opacity
      badgeGlow.addColorStop(1, rankColor + "00");
      ctx.fillStyle = badgeGlow;
      ctx.beginPath();
      ctx.arc(badgeX, badgeY, 150, 0, Math.PI * 2);
      ctx.fill();

      // Main Rank Text
      ctx.fillStyle = rankColor;
      ctx.font = "bold 90px sans-serif";
      ctx.textAlign = "center";
      ctx.shadowColor = rankColor;
      ctx.shadowBlur = 20;
      ctx.fillText(`#${activeShareUser.rank}`, badgeX, badgeY + 15);
      
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 20px sans-serif";
      ctx.shadowBlur = 0; // reset
      ctx.fillText("SWEIPY RANK", badgeX, badgeY + 65);
      ctx.restore();

      // Bottom Branding Link
      ctx.save();
      ctx.fillStyle = "#475569"; // Slate 600
      ctx.font = "bold 15px sans-serif";
      ctx.fillText("sweipy.vercel.app", 70, 540);
      ctx.restore();

      // Render finished image
      setCardImage(canvas.toDataURL("image/png"));
      setCanvasLoading(false);
    };

    // Load and draw avatar image with circular clip (CORS protected fallback)
    const avatarImg = new Image();
    avatarImg.crossOrigin = "anonymous";
    avatarImg.src = activeShareUser.avatar;

    avatarImg.onload = () => {
      ctx.save();
      // Draw circular avatar with clean border
      const arcX = 130;
      const arcY = 140;
      const arcR = 60;

      ctx.beginPath();
      ctx.arc(arcX, arcY, arcR, 0, Math.PI * 2);
      ctx.closePath();

      // Outer border styling
      ctx.strokeStyle = activeShareUser.rank === 1 
        ? "#fbbf24" 
        : activeShareUser.rank === 2
        ? "#cbd5e1"
        : activeShareUser.rank === 3
        ? "#d97706"
        : "#3f3f46";
      ctx.lineWidth = 6;
      ctx.stroke();

      ctx.clip();
      ctx.drawImage(avatarImg, arcX - arcR, arcY - arcR, arcR * 2, arcR * 2);
      ctx.restore();
      drawDetails();
    };

    avatarImg.onerror = () => {
      // Fallback: draw beautiful monogram/alphabet placeholder if avatar loading fails due to CORS or network
      ctx.save();
      const arcX = 130;
      const arcY = 140;
      const arcR = 60;

      // Draw premium gradient circular background
      const avatarGrad = ctx.createLinearGradient(arcX - arcR, arcY - arcR, arcX + arcR, arcY + arcR);
      avatarGrad.addColorStop(0, "#4f46e5"); // Indigo 600
      avatarGrad.addColorStop(1, "#ec4899"); // Pink 500
      ctx.fillStyle = avatarGrad;
      ctx.beginPath();
      ctx.arc(arcX, arcY, arcR, 0, Math.PI * 2);
      ctx.fill();

      // Draw outer border
      ctx.strokeStyle = activeShareUser.rank === 1 
        ? "#fbbf24" 
        : activeShareUser.rank === 2
        ? "#cbd5e1"
        : activeShareUser.rank === 3
        ? "#d97706"
        : "#3f3f46";
      ctx.lineWidth = 6;
      ctx.stroke();

      // Draw text initials
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 56px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const initial = activeShareUser.username.charAt(0).toUpperCase();
      ctx.fillText(initial, arcX, arcY + 4);
      ctx.restore();

      drawDetails();
    };

  }, [activeShareUser]);

  // Copy Profile Link to Clipboard
  const handleCopyLink = (userId: string, username: string) => {
    const profileUrl = `${window.location.origin}/user/${userId}`;
    navigator.clipboard.writeText(profileUrl)
      .then(() => {
        toast.success(`Copied ${username}'s profile link`, { icon: "🔗" });
      })
      .catch((err) => {
        console.error("Failed to copy link:", err);
        toast.error("Failed to copy link");
      });
  };

  // Copy Card Image to Clipboard
  const handleCopyCardImage = () => {
    if (!cardImage) return;

    fetch(cardImage)
      .then((res) => res.blob())
      .then((blob) => {
        navigator.clipboard.write([
          new ClipboardItem({
            "image/png": blob
          })
        ])
        .then(() => {
          toast.success("Card copied to clipboard! Paste it directly into your socials.", { icon: "🎨" });
        })
        .catch((err) => {
          console.error("Failed to copy image to clipboard:", err);
          // Fallback if writing blob is not supported or permitted on certain mobile/browser environments
          handleDownloadCardImage();
          toast.success("Card image downloaded successfully!", { icon: "📥" });
        });
      })
      .catch((err) => {
        console.error("Blob extraction error:", err);
        toast.error("Failed to copy card image");
      });
  };

  // Download Card Image
  const handleDownloadCardImage = () => {
    if (!cardImage || !activeShareUser) return;
    const link = document.createElement("a");
    link.download = `sweipy-achievement-${activeShareUser.username}.png`;
    link.href = cardImage;
    link.click();
  };

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto px-6 py-10 space-y-12">
      {/* Ranks 1, 2, 3 Visual Podium Display */}
      {leaderboard.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 items-end max-w-3xl mx-auto pt-6">
          
          {/* Rank #2 (Left) */}
          {second && (
            <div className="order-2 sm:order-1 relative group">
              <div className="glass-panel p-6 rounded-3xl border border-slate-200/50 dark:border-zinc-800/80 text-center flex flex-col items-center space-y-4 hover:-translate-y-2 transition-transform duration-300">
                <Link href={`/user/${second.userId}`} className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <img
                      src={second.avatar}
                      alt={second.username}
                      className="w-16 h-16 rounded-full object-cover border-4 border-slate-300 shadow-md"
                    />
                    <span className="absolute -bottom-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-slate-300 text-xs font-bold text-slate-700 shadow-sm">
                      2
                    </span>
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base truncate max-w-[150px] dark:text-zinc-100 group-hover:text-indigo-500 transition-colors">
                      {second.username}
                    </h3>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mt-0.5">
                      {second.uploads} uploads
                    </span>
                  </div>
                </Link>
                <div className="w-full pt-3.5 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-0.5 text-rose-500 font-semibold font-sans">
                    <Heart className="w-3.5 h-3.5 fill-rose-500/10" />
                    {second.likes}
                  </span>
                  <span className="font-bold text-indigo-500 dark:text-indigo-400 tabular-nums">
                    {second.score} pts
                  </span>
                </div>
                {/* Share Option */}
                <button
                  onClick={() => setActiveShareUser({ ...second, rank: 2 })}
                  className="flex items-center justify-center gap-1.5 w-full py-2 bg-slate-100 dark:bg-zinc-800/60 hover:bg-indigo-500 hover:text-white dark:hover:bg-indigo-600 rounded-xl text-xs font-bold font-sans transition-colors cursor-pointer text-slate-600 dark:text-zinc-300"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share Achievement</span>
                </button>
              </div>
            </div>
          )}

          {/* Rank #1 (Center) */}
          {first && (
            <div className="order-1 sm:order-2 relative group">
              <div className="glass-panel p-8 rounded-3xl border-2 border-amber-500/30 dark:border-amber-500/20 text-center flex flex-col items-center space-y-4 hover:-translate-y-2 transition-transform duration-300 relative glow-effect">
                <div className="absolute -top-5 flex items-center gap-1 bg-amber-500 text-white text-[10px] font-bold uppercase px-3 py-1 rounded-full shadow-md shadow-amber-500/20 select-none">
                  <Award className="w-3 h-3 animate-pulse" />
                  <span>Leader</span>
                </div>
                <Link href={`/user/${first.userId}`} className="flex flex-col items-center space-y-4 pt-2">
                  <div className="relative">
                    <img
                      src={first.avatar}
                      alt={first.username}
                      className="w-20 h-20 rounded-full object-cover border-4 border-amber-400 shadow-lg"
                    />
                    <span className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-amber-400 text-sm font-black text-amber-950 shadow-md">
                      1
                    </span>
                  </div>
                  <div>
                    <h3 className="font-black text-lg truncate max-w-[180px] dark:text-zinc-100 group-hover:text-amber-500 transition-colors">
                      {first.username}
                    </h3>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mt-0.5">
                      {first.uploads} uploads
                    </span>
                  </div>
                </Link>
                <div className="w-full pt-3.5 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-0.5 text-rose-500 font-semibold font-sans">
                    <Heart className="w-3.5 h-3.5 fill-rose-500/10" />
                    {first.likes}
                  </span>
                  <span className="font-black text-amber-500 tabular-nums text-sm">
                    {first.score} pts
                  </span>
                </div>
                {/* Share Option */}
                <button
                  onClick={() => setActiveShareUser({ ...first, rank: 1 })}
                  className="flex items-center justify-center gap-1.5 w-full py-2 bg-amber-500/10 hover:bg-amber-500 hover:text-amber-950 rounded-xl text-xs font-extrabold font-sans transition-colors cursor-pointer text-amber-500 border border-amber-500/20"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share Achievement</span>
                </button>
              </div>
            </div>
          )}

          {/* Rank #3 (Right) */}
          {third && (
            <div className="order-3 relative group">
              <div className="glass-panel p-6 rounded-3xl border border-slate-200/50 dark:border-zinc-800/80 text-center flex flex-col items-center space-y-4 hover:-translate-y-2 transition-transform duration-300">
                <Link href={`/user/${third.userId}`} className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <img
                      src={third.avatar}
                      alt={third.username}
                      className="w-16 h-16 rounded-full object-cover border-4 border-amber-600/40 shadow-md"
                    />
                    <span className="absolute -bottom-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-amber-600/50 text-xs font-bold text-amber-950 shadow-sm">
                      3
                    </span>
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base truncate max-w-[150px] dark:text-zinc-100 group-hover:text-indigo-500 transition-colors">
                      {third.username}
                    </h3>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mt-0.5">
                      {third.uploads} uploads
                    </span>
                  </div>
                </Link>
                <div className="w-full pt-3.5 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-0.5 text-rose-500 font-semibold font-sans">
                    <Heart className="w-3.5 h-3.5 fill-rose-500/10" />
                    {third.likes}
                  </span>
                  <span className="font-bold text-indigo-500 dark:text-indigo-400 tabular-nums">
                    {third.score} pts
                  </span>
                </div>
                {/* Share Option */}
                <button
                  onClick={() => setActiveShareUser({ ...third, rank: 3 })}
                  className="flex items-center justify-center gap-1.5 w-full py-2 bg-slate-100 dark:bg-zinc-800/60 hover:bg-indigo-500 hover:text-white dark:hover:bg-indigo-600 rounded-xl text-xs font-bold font-sans transition-colors cursor-pointer text-slate-600 dark:text-zinc-300"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share Achievement</span>
                </button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* Ranks 4+ Creator List */}
      <div className="space-y-4 max-w-3xl mx-auto">
        <h2 className="text-lg font-bold font-sans text-slate-400 dark:text-zinc-500 uppercase tracking-wider px-1">
          Top Rankings Showcase
        </h2>

        {leaderboard.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <Sparkles className="w-10 h-10 text-slate-300 dark:text-zinc-700 mx-auto" />
            <p className="text-lg font-bold mt-2">Leaderboard empty</p>
            <p className="text-sm">Shared templates will generate ranking points live!</p>
          </div>
        ) : (
          <div className="glass-panel rounded-3xl border border-slate-200/50 dark:border-zinc-800/80 overflow-hidden divide-y divide-slate-100 dark:divide-zinc-800/40">
            
            {leaderboard.map((user, idx) => {
              const rank = idx + 1;
              return (
                <div
                  key={user.userId}
                  className="flex items-center justify-between p-4.5 hover:bg-slate-50/50 dark:hover:bg-zinc-800/10 transition-all font-sans group"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <span className="w-6 text-center text-sm font-bold text-slate-400 group-hover:text-indigo-500 transition-colors shrink-0">
                      #{rank}
                    </span>
                    <Link href={`/user/${user.userId}`} className="flex items-center gap-3 min-w-0 hover:opacity-85">
                      <img
                        src={user.avatar}
                        alt={user.username}
                        className="w-11 h-11 rounded-full object-cover border border-slate-100 dark:border-zinc-800 shadow-xs shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-800 dark:text-zinc-200 truncate">
                          {user.username}
                        </p>
                        <p className="text-[10px] text-slate-400 dark:text-zinc-500 truncate max-w-xs sm:max-w-md mt-0.5">
                          {user.bio || "Sweipy design creator"}
                        </p>
                      </div>
                    </Link>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 text-xs">
                    <span className="hidden sm:flex items-center gap-1 text-slate-400 dark:text-zinc-500">
                      <Eye className="w-3.5 h-3.5" />
                      {user.views}
                    </span>
                    <span className="flex items-center gap-1 text-rose-500/80 font-medium mr-2">
                      <Heart className="w-3.5 h-3.5 fill-rose-500/5" />
                      {user.likes}
                    </span>
                    <span className="w-16 text-right font-bold text-slate-800 dark:text-zinc-200 tabular-nums mr-1">
                      {user.score} pts
                    </span>

                    {/* Dynamic Action Buttons */}
                    <button
                      onClick={() => setActiveShareUser({ ...user, rank })}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-indigo-500 hover:text-white dark:hover:bg-indigo-600 transition-colors cursor-pointer text-slate-500 dark:text-zinc-400"
                      aria-label="Share card"
                      title="Share Rank Card"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}

          </div>
        )}
      </div>

      {/* Share Modal overlay */}
      <AnimatePresence>
        {activeShareUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveShareUser(null)}
              className="absolute inset-0 bg-black/75 backdrop-blur-xs cursor-pointer"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative max-w-xl w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xl rounded-3xl z-10 flex flex-col overflow-hidden max-h-[90vh]"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-zinc-800/80 shrink-0">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  <h3 className="text-lg font-bold text-slate-800 dark:text-zinc-100 font-sans">
                    Share Achievement
                  </h3>
                </div>
                <button
                  onClick={() => setActiveShareUser(null)}
                  className="p-1.5 rounded-xl border border-slate-100 dark:border-zinc-800 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-colors cursor-pointer"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable contents */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* Visual generated card preview */}
                <div className="relative w-full aspect-[5/3] rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-800 flex items-center justify-center shadow-lg select-none">
                  {canvasLoading ? (
                    <div className="flex flex-col items-center gap-3">
                      <Sparkles className="w-8 h-8 text-indigo-500 animate-spin" />
                      <span className="text-xs text-zinc-500 font-sans">Generating beautiful card...</span>
                    </div>
                  ) : cardImage ? (
                    <img
                      src={cardImage}
                      alt="Aesthetic achievement rank card"
                      className="w-full h-full object-contain"
                    />
                  ) : null}
                </div>

                <div className="text-center space-y-1">
                  <h4 className="text-sm font-bold text-slate-700 dark:text-zinc-300 font-sans">
                    {activeShareUser.username}'s Rank Achievement
                  </h4>
                  <p className="text-xs text-slate-400 dark:text-zinc-500 font-sans">
                    Copy the PNG to clipboard to paste directly onto Twitter/X, Discord, or LinkedIn!
                  </p>
                </div>

                {/* Actions Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <button
                    onClick={handleCopyCardImage}
                    disabled={canvasLoading || !cardImage}
                    className="flex items-center justify-center gap-2 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-60 font-sans"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Copy Card Image</span>
                  </button>

                  <button
                    onClick={handleDownloadCardImage}
                    disabled={canvasLoading || !cardImage}
                    className="flex items-center justify-center gap-2 py-3 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 rounded-xl text-sm font-bold transition-colors cursor-pointer disabled:opacity-60 font-sans"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download PNG</span>
                  </button>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-zinc-800/80 space-y-3.5">
                  <h4 className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider font-sans">
                    Other Sharing Methods
                  </h4>

                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <button
                      onClick={() => handleCopyLink(activeShareUser.userId, activeShareUser.username)}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800/40 rounded-xl text-xs font-bold text-slate-600 dark:text-zinc-300 font-sans transition-colors cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Profile Link</span>
                    </button>

                    <a
                      href={`https://twitter.com/intent/tweet?text=Check%20out%20my%20creator%20ranking%20%23${activeShareUser.rank}%20on%20Sweipy%20with%2520${activeShareUser.score}%2520points!%20&url=${encodeURIComponent(`${window.location.origin}/user/${activeShareUser.userId}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold font-sans transition-colors"
                    >
                      <TwitterIcon className="w-3.5 h-3.5 fill-current" />
                      <span>Share on Twitter / X</span>
                    </a>
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
