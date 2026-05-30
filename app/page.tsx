import { createClient } from "@/lib/supabase/server";

import ComponentCardUI from "@/components/component-card";

export default async function HomePage() {
  const supabase = await createClient();

  const { data: components } = await supabase
    .from("components")
    .select(`
      *,
      profiles (
        username,
        avatar_url
      )
    `)
    .order("created_at", {
      ascending: false,
    });

  return (
    <main className="overflow-x-auto">

      <div className="flex gap-8 p-10">

        {components?.map((component) => (
          <ComponentCardUI
            key={component.id}
            component={component}
          />
        ))}

      </div>

    </main>
  );
}