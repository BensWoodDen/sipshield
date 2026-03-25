import Image from "next/image";
import Link from "next/link";
import type { HomepageData } from "@/lib/sanity/types";
import { urlFor } from "@/lib/sanity/image";

interface HeroProps {
  hero: NonNullable<HomepageData["hero"]>;
}

export function Hero({ hero }: HeroProps) {
  return (
    <section aria-label="Hero" className="relative max-w-[1200px] mx-auto px-6 pt-16 pb-24 md:pt-20 md:pb-32">
      <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr] items-center gap-8 md:gap-0">
        {/* Text content */}
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-forest-600 mb-4">
            {hero.kicker}
          </p>
          <h1 className="font-display text-[clamp(2.5rem,5vw+1rem,4.5rem)] leading-[1.08] tracking-tight text-oak-800 mb-6">
            {hero.headline}
          </h1>
          <p className="text-[clamp(1.125rem,1.5vw+0.5rem,1.375rem)] text-neutral-600 leading-relaxed max-w-[42ch] mb-8">
            {hero.body}
          </p>
          <Link
            href={hero.ctaLink}
            className="inline-block px-6 py-3 bg-forest-500 text-white font-medium rounded-md shadow-sm hover:bg-forest-600 hover:shadow-md transition-all duration-100 focus-visible:outline-none focus-visible:shadow-focus"
          >
            {hero.ctaLabel}
          </Link>
        </div>

        {/* Floating product image */}
        {hero.productImage && (
          <div className="relative justify-self-center md:justify-self-end">
            <div className="relative w-[280px] h-[280px] md:w-[340px] md:h-[340px] rotate-2">
              <Image
                src={urlFor(hero.productImage).width(680).height(680).url()}
                alt={hero.headline || "Featured drink cover"}
                width={680}
                height={680}
                className="rounded-xl object-cover shadow-lg"
                sizes="(max-width: 768px) 280px, 340px"
                priority
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
