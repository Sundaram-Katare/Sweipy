type Props = {
  value: string;

  onChange: (
    value: string
  ) => void;
};

export default function SearchBar({
  value,
  onChange,
}: Props) {
  return (
    <input
      value={value}
      onChange={(e) =>
        onChange(e.target.value)
      }
      placeholder="Search UI..."
      className="
        w-full
        rounded-2xl
        border
        p-4
        text-lg
      "
    />
  );
}