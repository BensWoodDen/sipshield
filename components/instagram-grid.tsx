import Image from "next/image";
import { urlFor } from "@/lib/sanity/image";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";

interface InstagramGridProps {
  images: Array<SanityImageSource & { alt?: string }>;
  profileUrl: string;
}

export function InstagramGrid({ images, profileUrl }: InstagramGridProps) {
  if (!images || images.length === 0) return null;

  return (
    <section aria-label="Instagram" className="max-w-[1200px] mx-auto px-6 py-12">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {images.map((img, i) => (
          <a
            key={i}
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="relative aspect-square rounded-lg overflow-hidden group"
          >
            <Image
              src={urlFor(img).width(400).height(400).url()}
              alt={img.alt || `Instagram photo ${i + 1}`}
              width={400}
              height={400}
              className="object-cover w-full h-full group-hover:scale-[1.03] transition-transform duration-300 ease-out"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          </a>
        ))}
      </div>
      <p className="text-center mt-4">
        <a
          href={profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-neutral-500 hover:text-oak-700 transition-colors duration-100 font-medium"
        >
          Follow @sipshield
        </a>
      </p>
    </section>
  );
}
