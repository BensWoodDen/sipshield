import { getHomepage, getSiteSettings } from "@/lib/sanity/queries";
import { Hero } from "@/components/hero";
import { TrustBar } from "@/components/trust-bar";
import { ProductGrid } from "@/components/product-grid";
import { StoryBand } from "@/components/story-band";
import { InstagramGrid } from "@/components/instagram-grid";

export default async function Home() {
  const [homepage, settings] = await Promise.all([
    getHomepage(),
    getSiteSettings(),
  ]);

  const instagramUrl = settings?.socialLinks?.instagram || "https://instagram.com/sipshield";

  return (
    <main>
      {homepage?.hero && <Hero hero={homepage.hero} />}

      {homepage?.trustBar && <TrustBar items={homepage.trustBar} />}

      {homepage?.featuredProducts && (
        <ProductGrid heading="Featured Pieces" products={homepage.featuredProducts} />
      )}

      {homepage?.storyBand && <StoryBand storyBand={homepage.storyBand} />}

      {homepage?.instagram?.images && (
        <InstagramGrid
          images={homepage.instagram.images}
          profileUrl={instagramUrl}
        />
      )}
    </main>
  );
}
