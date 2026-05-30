"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { User, LogOut, ChevronDown } from "lucide-react";

interface UserMenuProps {
  user: any;
}

export default function UserMenu({ user }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
    router.push("/");
  };

  const avatarUrl = user.user_metadata?.avatar_url || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80";
  const name = user.user_metadata?.user_name || user.email || "User";

  return (
    <div className="relative pl-2 border-l border-slate-100" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 hover:opacity-90 transition-opacity focus:outline-hidden cursor-pointer"
      >
        <img
          src={avatarUrl}
          alt={name}
          className="w-10 h-10 rounded-full object-cover border border-slate-100 shadow-sm"
        />
        <ChevronDown className="w-4 h-4 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white border border-slate-100 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1)] py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="px-4 py-2 border-b border-slate-50">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-sans">Signed in as</p>
            <p className="text-sm font-medium text-slate-700 truncate font-sans">{name}</p>
          </div>
          
          <Link
            href="/profile"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-600 hover:text-[rgb(99,102,241)] hover:bg-slate-50 transition-colors w-full text-left font-sans"
          >
            <User className="w-4 h-4 text-slate-400" />
            <span>Profile</span>
          </Link>

          <button
            onClick={() => {
              setIsOpen(false);
              handleSignOut();
            }}
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50/50 transition-colors w-full text-left cursor-pointer font-sans"
          >
            <LogOut className="w-4 h-4 text-red-400" />
            <span>Logout</span>
          </button>
        </div>
      )}
    </div>
  );
}
