import { ComponentCard } from "@/types/database";

type Props = {
  component: ComponentCard;
};

export default function ComponentCardUI({
  component,
}: Props) {
  return (
    <div className="min-w-[700px] rounded-3xl border bg-white p-4 shadow-lg">

      <img
        src={component.image_url}
        className="h-[450px] w-full rounded-2xl object-cover"
      />

      <div className="mt-4 flex items-center justify-between">

        <div>
          <h2 className="text-2xl font-bold">
            {component.title}
          </h2>

          <p className="mt-2 text-gray-500">
            {component.description}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <p>❤️ {component.likes_count}</p>

          <p>💬 {component.comments_count}</p>
        </div>

      </div>

    </div>
  );
}