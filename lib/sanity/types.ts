// Minimal type for Sanity image references — avoids fragile deep import from @sanity/image-url
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SanityImageSource = Record<string, any>;

export interface ProductVariant {
  _key: string;
  name: string;
  stripePriceId?: string;
}

export interface PersonalisationOption {
  _key: string;
  type: "text" | "image";
  label: string;
}

export interface SanityProduct {
  _id: string;
  name: string;
  slug: { current: string };
  description?: string;
  variant: string;
  stripePriceId?: string;
  images?: SanityImageSource[];
  tag?: string;
  personalisation?: PersonalisationOption[];
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

export interface AboutPageData {
  opener?: {
    kicker: string;
    headline: string;
    body: string;
  };
  story?: {
    heading: string;
    body: string;
    photo?: SanityImageSource;
    photoAlt?: string;
  };
  process?: {
    heading: string;
    steps: Array<{
      _key: string;
      title: string;
      description: string;
      image?: SanityImageSource;
    }>;
  };
  values?: {
    heading: string;
    items: Array<{
      _key: string;
      title: string;
      description: string;
    }>;
  };
  cta?: {
    heading: string;
    body: string;
    buttonLabel: string;
    buttonLink: string;
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

export interface FaqPageData {
  opener?: {
    kicker: string;
    headline: string;
    body: string;
  };
  faqs?: Array<{
    _key: string;
    question: string;
    answer: string;
  }>;
  cta?: {
    heading: string;
    body: string;
    buttonLabel: string;
    buttonLink: string;
  };
}

export interface ContactPageData {
  opener?: {
    kicker: string;
    headline: string;
    body: string;
  };
}
