"use client";

import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
    const supabase = createClient();

    const signInWithGithub = async () => {
        const redirectTo = `${window.location.origin}/auth/callback`;
        await supabase.auth.signInWithOAuth({
            provider: "github",
            options: {
                redirectTo,
            },
        });
    };

    return (
        <>
            <div className="flex min-h-screen items-center justify-center">
                <button
                    onClick={signInWithGithub}
                    className="rounded-lg bg-red-500 px-6 py-3 text-white"
                >
                    Continue with GitHub
                </button>
            </div>
        </>
    )
}