interface TrustBarProps {
  items: string[];
}

export function TrustBar({ items }: TrustBarProps) {
  if (!items || items.length === 0) return null;

  return (
    <section aria-label="Why SipShield" className="border-y border-oak-100">
      <div className="max-w-[1200px] mx-auto px-6 py-4 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-neutral-500">
        {items.map((item, i) => (
          <span key={i} className="flex items-center gap-2">
            {i > 0 && <span aria-hidden="true" className="text-oak-300">·</span>}
            {item}
          </span>
        ))}
      </div>
    </section>
  );
}
