import { sanityClient } from "./client";
import type { HomepageData, SiteSettings, ShopPageData, AboutPageData, FaqPageData, ContactPageData } from "./types";

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

const aboutPageQuery = `*[_type == "aboutPage"][0]{
  opener,
  story,
  process,
  values,
  cta
}`;

export async function getAboutPage(): Promise<AboutPageData | null> {
  return sanityClient.fetch(aboutPageQuery);
}

const faqPageQuery = `*[_type == "faqPage"][0]{
  opener,
  faqs,
  cta
}`;

export async function getFaqPage(): Promise<FaqPageData | null> {
  return sanityClient.fetch(faqPageQuery);
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

const contactPageQuery = `*[_type == "contactPage"][0]{ opener }`;

export async function getContactPage(): Promise<ContactPageData | null> {
  return sanityClient.fetch(contactPageQuery);
}
