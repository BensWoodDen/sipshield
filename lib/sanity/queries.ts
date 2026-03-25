import { sanityClient } from "./client";
import type { HomepageData, SiteSettings } from "./types";

const homepageQuery = `*[_type == "homepage"][0]{
  hero,
  trustBar,
  featuredProducts[]->{
    _id,
    name,
    slug,
    description,
    variant,
    price,
    stripePriceId,
    images,
    tag
  },
  storyBand,
  instagram
}`;

const settingsQuery = `*[_type == "siteSettings"][0]{
  siteName,
  socialLinks
}`;

export async function getHomepage(): Promise<HomepageData | null> {
  return sanityClient.fetch(homepageQuery);
}

export async function getSiteSettings(): Promise<SiteSettings | null> {
  return sanityClient.fetch(settingsQuery);
}
