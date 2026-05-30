import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);

  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();

    await supabase.auth.exchangeCodeForSession(code);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      await supabase.from("profiles").upsert({
        id: user.id,
        username:
          user.user_metadata.user_name ||
          user.user_metadata.full_name,

        avatar_url: user.user_metadata.avatar_url,

        bio: "",
      });
    }
  }

  return NextResponse.redirect(`${origin}/`);
}