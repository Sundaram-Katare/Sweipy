import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);

  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.exchangeCodeForSession(code);

    if (user) {
      await supabase.from("profiles").upsert({
        id: user.id,
        username: user.user_metadata.user_name,
        avatar_url: user.user_metadata.avatar_url,
      });
    }
  }

  return NextResponse.redirect(`${origin}/`);
}