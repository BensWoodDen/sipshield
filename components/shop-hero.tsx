import type { ShopPageHero } from "@/lib/sanity/types";

interface ShopHeroProps {
  hero: ShopPageHero;
}

export function ShopHero({ hero }: ShopHeroProps) {
  return (
    <section aria-label="Shop introduction" className="max-w-[1200px] mx-auto px-6 pt-12 pb-8 md:pt-16 md:pb-10">
      {hero.heroKicker && (
        <p className="text-sm font-semibold uppercase tracking-widest text-forest-600 mb-3">
          {hero.heroKicker}
        </p>
      )}
      <h1 className="font-display text-[clamp(1.75rem,3vw+0.75rem,2.75rem)] leading-[1.12] tracking-tight text-oak-800 mb-3">
        {hero.heroHeadline}
      </h1>
      {hero.heroBody && (
        <p className="text-[clamp(1rem,1vw+0.5rem,1.125rem)] text-neutral-600 leading-relaxed max-w-[52ch]">
          {hero.heroBody}
        </p>
      )}
    </section>
  );
}
