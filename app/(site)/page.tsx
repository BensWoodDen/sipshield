import { getHomepage, getSiteSettings } from "@/lib/sanity/queries";
import { fetchStripePrices } from "@/lib/stripe";
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

  // Fetch Stripe prices for featured products
  const featuredProducts = homepage?.featuredProducts ?? [];
  const allPriceIds = featuredProducts.flatMap((p) => [
    p.stripePriceId,
    ...(p.variants?.map((v) => v.stripePriceId) ?? []),
  ]);
  const stripePrices = await fetchStripePrices(allPriceIds);

  const instagramUrl = settings?.socialLinks?.instagram || "https://instagram.com/sipshielduk";

  return (
    <main>
      {homepage?.hero && <Hero hero={homepage.hero} />}

      {homepage?.trustBar && <TrustBar items={homepage.trustBar} />}

      {homepage?.featuredProducts && (
        <ProductGrid
          heading="A few favourites"
          products={homepage.featuredProducts}
          stripePrices={stripePrices}
        />
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
