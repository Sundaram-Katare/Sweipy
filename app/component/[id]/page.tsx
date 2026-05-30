import { createClient } from "@/lib/supabase/server";
import CommentSection from "@/components/comment-section";

export default async function ComponentPage({
  params,
}: {
  params: {
    id: string;
  };
}) {
  const supabase = await createClient();

  const { data: component } =
    await supabase
      .from("components")
      .select("*")
      .eq("id", params.id)
      .single();

  if (!component) {
    return <div>Not found</div>;
  }

  return (
    <div className="mx-auto max-w-6xl p-10">

      <img
        src={component.image_url}
        className="
          w-full
          rounded-3xl
        "
      />

      <div className="mt-8">

        <h1 className="text-5xl font-bold">
          {component.title}
        </h1>

        <p className="mt-4 text-xl text-gray-500">
          {component.description}
        </p>

        <CommentSection componentId={component.id} />   

      </div>

    </div>
  );
}