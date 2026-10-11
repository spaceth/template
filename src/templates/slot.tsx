export function Slot({
  as: Tag,
  className,
  value,
  aboveOverlay = false,
}: {
  as: "h1" | "p";
  className: string;
  value: string;
  aboveOverlay?: boolean;
}) {
  const text = value.trim();
  if (!text) return null;
  return (
    <Tag className={className} data-export-above-overlay={aboveOverlay ? "" : undefined}>
      {text}
    </Tag>
  );
}
