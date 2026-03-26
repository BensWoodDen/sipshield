// Minimal type for Sanity image references — avoids fragile deep import from @sanity/image-url
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SanityImageSource = Record<string, any>;

export interface ProductVariant {
  _key: string;
  name: string;
  price: number;
  stripePriceId?: string;
}

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
  personalisable?: boolean;
  personalisationLabel?: string;
  variants?: ProductVariant[];
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

export interface ShopPageHero {
  heroKicker?: string;
  heroHeadline: string;
  heroBody?: string;
}

export interface ProductFamily {
  _id: string;
  name: string;
  slug: { current: string };
  description?: string;
  products: SanityProduct[];
}

export interface ShopPageData {
  hero: ShopPageHero | null;
  families: ProductFamily[];
}
