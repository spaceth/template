export function Slot({
  as: Tag,
  className,
  value,
}: {
  as: "h1" | "p";
  className: string;
  value: string;
}) {
  const text = value.trim();
  if (!text) return null;
  return <Tag className={className}>{text}</Tag>;
}
