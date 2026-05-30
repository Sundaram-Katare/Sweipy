import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from "@/components/ui/navigation-menu";
import { Button } from "./ui/button";
import { Heart, Upload } from "lucide-react";
import UserMenu from "./user-menu";

export default async function Navbar() {
    const supabase = await createClient();

    const { data } = await supabase.auth.getUser();
    const user = data?.user;

    return (
        <nav className="w-full sticky top-0 z-50 bg-white/70 backdrop-blur-md border-b border-slate-100/80 transition-all duration-300">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                
                <div className="flex items-center gap-6">
                    <Link 
                        href="/" 
                        className="flex items-center justify-center w-11 h-11 rounded-2xl border border-slate-100/80 bg-white shadow-[0_4px_12px_rgba(0,0,0,0.02)] hover:scale-[1.02] active:scale-[0.98] transition-all group"
                    >
                        <Heart className="w-5 h-5 text-[rgb(99,102,241)] group-hover:text-[rgb(79,70,229)] fill-none stroke-[2] transition-colors" />
                    </Link>

                    <NavigationMenu className="hidden md:flex">
                        <NavigationMenuList className="flex items-center gap-1">
                            <NavigationMenuItem>
                                <NavigationMenuLink
                                    href="/feed"
                                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-[rgb(99,102,241)] hover:bg-slate-50 rounded-xl transition-all font-sans"
                                >
                                    Feed
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                            <NavigationMenuItem>
                                <NavigationMenuLink
                                    href="/feed"
                                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-[rgb(99,102,241)] hover:bg-slate-50 rounded-xl transition-all font-sans"
                                >
                                    Leaderboard
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                            <NavigationMenuItem>
                                <NavigationMenuLink
                                    href="/feed"
                                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-[rgb(99,102,241)] hover:bg-slate-50 rounded-xl transition-all font-sans"
                                >
                                    Hot Shots
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                        </NavigationMenuList>
                    </NavigationMenu>
                </div>

                <div className="flex flex-col items-center text-center">
                    <Link href="/" className="flex flex-col items-center group">
                        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 font-sans">
                            UI<span className="text-[rgb(99,102,241)] font-medium">swipe</span>
                        </h1>
                        <span className="text-[10px] text-slate-400 font-semibold tracking-wider mt-0.5 uppercase font-sans">
                            Swipe. Discover. Get Inspired.
                        </span>
                    </Link>
                </div>

                <div className="flex items-center gap-4">
                    {user ? (
                        <>
                            <Button 
                                asChild
                                className="bg-[rgb(99,102,241)] hover:bg-[rgb(79,70,229)] text-white font-medium px-5 h-11 rounded-2xl flex items-center gap-2 border-none shadow-[0_4px_14px_rgba(99,102,241,0.15)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer font-sans"
                            >
                                <Link href="/upload">
                                    <Upload className="w-4 h-4 text-white stroke-[2.5]" />
                                    <span>Upload</span>
                                </Link>
                            </Button>

                            <UserMenu user={user} />
                        </>
                    ) : (
                        <Button 
                            asChild
                            className="bg-[rgb(99,102,241)] hover:bg-[rgb(79,70,229)] text-white font-medium px-6 h-11 rounded-2xl flex items-center gap-2 border-none shadow-[0_4px_14px_rgba(99,102,241,0.15)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer font-sans"
                        >
                            <Link href="/login">
                                <span>Login</span>
                            </Link>
                        </Button>
                    )}
                </div>

            </div>
        </nav>
    );
}