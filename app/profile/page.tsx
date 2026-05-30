import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="p-10">
      <img
        src={profile?.avatar_url}
        className="h-20 w-20 rounded-full"
      />

      <h1 className="mt-4 text-3xl font-bold">
        {profile?.username}
      </h1>
    </div>
  );
}