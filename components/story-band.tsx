import Image from "next/image";
import Link from "next/link";
import type { HomepageData } from "@/lib/sanity/types";
import { urlFor } from "@/lib/sanity/image";

interface StoryBandProps {
  storyBand: NonNullable<HomepageData["storyBand"]>;
}

export function StoryBand({ storyBand }: StoryBandProps) {
  if (!storyBand.heading && !storyBand.body) return null;

  const hasPhoto = Boolean(storyBand.photo);

  return (
    <section aria-label="Our story" className="bg-oak-900">
      <div className={`grid grid-cols-1 ${hasPhoto ? "md:grid-cols-[1fr_1.4fr]" : ""}`}>
        {/* Workshop photo */}
        {hasPhoto && (
          <div className="relative aspect-[4/3] md:aspect-auto overflow-hidden">
            <Image
              src={urlFor(storyBand.photo).width(800).height(600).url()}
              alt="Workshop"
              width={800}
              height={600}
              className="object-cover w-full h-full"
              sizes="(max-width: 768px) 100vw, 40vw"
            />
          </div>
        )}

        {/* Text content */}
        <div className={`px-6 py-12 md:py-16 flex flex-col justify-center ${hasPhoto ? "md:px-12" : "md:px-12 max-w-[1200px] mx-auto"}`}>
          <h2 className="font-display text-[clamp(1.5rem,2.5vw+0.75rem,2.25rem)] text-oak-100 mb-4 leading-tight">
            {storyBand.heading}
          </h2>
          <p className="text-neutral-300 leading-relaxed max-w-[48ch] mb-6">
            {storyBand.body}
          </p>
          {storyBand.linkTarget && (
            <Link
              href={storyBand.linkTarget}
              className="text-forest-300 font-medium hover:text-forest-200 transition-colors duration-100 focus-visible:outline-none focus-visible:shadow-focus w-fit"
            >
              {storyBand.linkText || "Learn more"} →
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
