"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Heart, Compass, Trophy, Bookmark, Upload, Sparkles, Zap } from "lucide-react";
import ThemeToggle from "./theme-toggle";
import UserMenu from "./user-menu";
import NotificationsMenu from "./notifications-menu";

interface FloatingNavbarProps {
  user: any;
}

export default function FloatingNavbar({ user }: FloatingNavbarProps) {
  const pathname = usePathname();

  if (pathname === "/login") return null;

  const navLinks = [
    { href: "/", label: "Feed", icon: Compass },
    { href: "/just-swipe", label: "JustSwipe", icon: Zap },
    // { href: "/explore", label: "Explore", icon: Sparkles },
    { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
    ...(user ? [{ href: "/favourites", label: "Saved", icon: Bookmark }] : []),
  ];

  return (
    <>
      {/* Desktop & Tablet Floating Navbar */}
      <header className="sticky top-0 z-50 w-full hidden md:block px-6 py-4">
        <div className="max-w-7xl mx-auto glass-navbar rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.03)] transition-all duration-300">
          <div className="px-6 h-16 flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2 group">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/25 group-hover:scale-105 active:scale-95 transition-all">
                  <Heart className="w-4.5 h-4.5 text-indigo-500 fill-indigo-500/10" />
                </div>
                <h1 className="text-xl font-extrabold tracking-tight text-slate-800 dark:text-zinc-100 font-sans">
                  Sweipy<span className="text-indigo-500 font-medium"></span>
                </h1>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="flex items-center gap-1.5 bg-slate-100/50 dark:bg-zinc-800/20 p-1 rounded-xl border border-slate-200/20 dark:border-zinc-800/40">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative px-4 py-2 text-sm font-semibold rounded-lg font-sans flex items-center gap-2 transition-colors duration-300 ${isActive
                        ? "text-indigo-500 dark:text-indigo-400"
                        : "text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                      }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeTabIndicator"
                        className="absolute inset-0 bg-white dark:bg-zinc-900 border border-slate-200/40 dark:border-zinc-800 shadow-[0_2px_8px_rgba(0,0,0,0.02)] rounded-lg -z-10"
                        transition={{ type: "spring", stiffness: 350, damping: 25 }}
                      />
                    )}
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Right Side Buttons */}
            <div className="flex items-center gap-3">
              <ThemeToggle />

              {user && <NotificationsMenu userId={user.id} />}

              {user ? (
                <>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link
                      href="/upload"
                      className="bg-indigo-500 hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white font-semibold text-sm px-4 h-10 rounded-xl flex items-center gap-1.5 shadow-sm shadow-indigo-500/10 cursor-pointer font-sans"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Upload</span>
                    </Link>
                  </motion.div>
                  <UserMenu user={user} />
                </>
              ) : (
                <Link
                  href="/login"
                  className="bg-indigo-500 hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white font-semibold text-sm px-5 h-10 rounded-xl flex items-center shadow-sm shadow-indigo-500/10 transition-colors font-sans"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sticky Bottom Nav Dock */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 md:hidden w-[90%] max-w-sm glass-panel p-2 rounded-2xl border border-slate-200/50 dark:border-zinc-800/80 shadow-[0_12px_30px_rgba(0,0,0,0.12)]">
        <div className="flex items-center justify-around h-12">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative flex flex-col items-center justify-center p-2 rounded-xl transition-all ${isActive
                    ? "text-indigo-500 dark:text-indigo-400 scale-105"
                    : "text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300"
                  }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="mobileActiveIndicator"
                    className="absolute -top-1 w-1.5 h-1.5 rounded-full bg-indigo-500"
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  />
                )}
                <Icon className="w-5 h-5" />
              </Link>
            );
          })}

          {user && (
            <Link
              href="/upload"
              className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${pathname === "/upload" ? "text-indigo-500" : "text-slate-400 dark:text-zinc-500"
                }`}
            >
              <Upload className="w-5 h-5" />
            </Link>
          )}

          {user ? (
            <div className="flex items-center shrink-0">
              <UserMenu user={user} />
            </div>
          ) : (
            <Link
              href="/login"
              className="text-xs font-semibold text-indigo-500 font-sans px-3 py-1.5 border border-indigo-500/20 bg-indigo-500/5 rounded-lg"
            >
              Login
            </Link>
          )}
        </div>
      </nav>
    </>
  );
}
