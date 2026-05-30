import { createClient } from "@/lib/supabase/server";

import ComponentCardUI from "@/components/component-card";

export default async function UserPage({
  params,
}: {
  params: {
    id: string;
  };
}) {
  const supabase = await createClient();

  const { data: profile } =
    await supabase
      .from("profiles")
      .select("*")
      .eq("id", params.id)
      .single();

  const { data: components } =
    await supabase
      .from("components")
      .select("*")
      .eq("user_id", params.id);

  return (
    <div className="p-10">

      <div className="mb-10 flex items-center gap-6">

        <img
          src={profile.avatar_url}
          className="
            h-24
            w-24
            rounded-full
          "
        />

        <div>
          <h1 className="text-4xl font-bold">
            {profile.username}
          </h1>

          <p className="mt-2 text-gray-500">
            {profile.bio}
          </p>
        </div>

      </div>

      <div className="flex gap-8 overflow-x-auto">

        {components?.map((component) => (
          <ComponentCardUI
            key={component.id}
            component={component}
          />
        ))}

      </div>

    </div>
  );
}