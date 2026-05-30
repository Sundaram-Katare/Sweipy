import { createClient } from "@/lib/supabase/server";
import FloatingNavbar from "./floating-navbar";

export default async function Navbar() {
  const supabase = await createClient();

  const { data } = await supabase.auth.getUser();
  const user = data?.user;

  return <FloatingNavbar user={user} />;
}