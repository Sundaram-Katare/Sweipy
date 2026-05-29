"use client";

import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
    const supabase = createClient();

    const signInWithGithub = async () => {
        await supabase.auth.signInWithOAuth({
            provider: "github",
            options: {
                redirectTo: "http://localhost:3000/auth/callback",
            },
        });
    };

    return (
        <>
            <div className="flex min-h-screen items-center justify-center">
                <button
                    onClick={signInWithGithub}
                    className="rounded-lg bg-black px-6 py-3 text-white"
                >
                    Continue with GitHub
                </button>
            </div>
        </>
    )
}