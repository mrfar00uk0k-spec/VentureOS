interface CloudItem {
  text: string;
  frequency: "low" | "medium" | "high";
}

const SIZE_CLASS: Record<CloudItem["frequency"], string> = {
  low: "text-xs px-3 py-1.5 font-normal",
  medium: "text-sm px-4 py-2 font-medium",
  high: "text-base px-5 py-2.5 font-semibold",
};

/**
 * Rounded tags whose size reflects how often that pain point showed up in
 * the collected evidence — the spec explicitly asks for this instead of a
 * traditional word cloud ("Each tag size reflects importance").
 */
export function PainPointCloud({ items }: { items: CloudItem[] }) {
  if (items.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item, i) => (
        <span
          key={i}
          className={`rounded-full border border-border bg-white/[0.04] text-text-secondary transition-colors hover:border-border-strong hover:text-text-primary ${SIZE_CLASS[item.frequency]}`}
        >
          {item.text}
        </span>
      ))}
    </div>
  );
}
