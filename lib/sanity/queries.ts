import { sanityClient } from "./client";
import type { HomepageData, SiteSettings, ShopPageData } from "./types";

const homepageQuery = `*[_type == "homepage"][0]{
  hero,
  trustBar,
  featuredProducts[]->{
    _id,
    name,
    slug,
    description,
    variant,
    stripePriceId,
    images,
    tag,
    personalisation,
    variants
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

const shopPageQuery = `{
  "hero": *[_type == "shopPage"][0]{
    heroKicker,
    heroHeadline,
    heroBody
  },
  "families": *[_type == "productFamily"] | order(displayOrder asc) {
    _id,
    name,
    slug,
    description,
    "products": *[_type == "product" && references(^._id)] | order(name asc) {
      _id,
      name,
      slug,
      description,
      variant,
      stripePriceId,
      images,
      tag,
      personalisation,
      variants
    }
  }
}`;

export async function getShopPage(): Promise<ShopPageData> {
  return sanityClient.fetch(shopPageQuery);
}
