import type { SanityImageSource } from "@sanity/image-url/lib/types/types";

export interface SanityProduct {
  _id: string;
  name: string;
  slug: { current: string };
  description?: string;
  variant: string;
  price: number;
  stripePriceId: string;
  images?: SanityImageSource[];
  tag?: string;
}

export interface HomepageData {
  hero?: {
    kicker: string;
    headline: string;
    body: string;
    ctaLabel: string;
    ctaLink: string;
    productImage: SanityImageSource;
  };
  trustBar?: string[];
  featuredProducts?: SanityProduct[];
  storyBand?: {
    heading: string;
    body: string;
    photo: SanityImageSource;
    linkText: string;
    linkTarget: string;
  };
  instagram?: {
    images?: Array<SanityImageSource & { alt?: string }>;
  };
}

export interface SiteSettings {
  siteName: string;
  socialLinks?: {
    instagram?: string;
  };
}
