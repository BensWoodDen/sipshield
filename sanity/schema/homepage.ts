import { defineType, defineField } from "sanity";

export const homepage = defineType({
  name: "homepage",
  title: "Homepage",
  type: "document",
  fields: [
    defineField({
      name: "hero",
      title: "Hero Section",
      type: "object",
      fields: [
        defineField({ name: "kicker", title: "Kicker", type: "string", initialValue: "Handcrafted in the UK" }),
        defineField({ name: "headline", title: "Headline", type: "string", initialValue: "Protect your drink in style" }),
        defineField({ name: "body", title: "Body Text", type: "text", rows: 3 }),
        defineField({ name: "ctaLabel", title: "CTA Button Label", type: "string", initialValue: "Shop Collection" }),
        defineField({ name: "ctaLink", title: "CTA Button Link", type: "string", initialValue: "/shop" }),
        defineField({ name: "productImage", title: "Product Image", type: "image", options: { hotspot: true } }),
      ],
    }),
    defineField({
      name: "trustBar",
      title: "Trust Bar Items",
      type: "array",
      of: [{ type: "string" }],
      validation: (rule) => rule.max(4),
    }),
    defineField({
      name: "featuredProducts",
      title: "Featured Products",
      description: "First product gets the large featured treatment. Maximum 4.",
      type: "array",
      of: [{ type: "reference", to: [{ type: "product" }] }],
      validation: (rule) => rule.max(4),
    }),
    defineField({
      name: "storyBand",
      title: "Story Band Section",
      type: "object",
      fields: [
        defineField({ name: "heading", title: "Heading", type: "string" }),
        defineField({ name: "body", title: "Body Text", type: "text", rows: 4 }),
        defineField({ name: "photo", title: "Workshop Photo", type: "image", options: { hotspot: true } }),
        defineField({ name: "linkText", title: "Link Text", type: "string", initialValue: "Meet the maker" }),
        defineField({ name: "linkTarget", title: "Link URL", type: "string", initialValue: "/about" }),
      ],
    }),
    defineField({
      name: "instagram",
      title: "Instagram Section",
      type: "object",
      fields: [
        defineField({
          name: "images",
          title: "Instagram Images",
          type: "array",
          of: [{ type: "image", options: { hotspot: true }, fields: [
            defineField({ name: "alt", title: "Alt Text", type: "string" }),
          ]}],
          validation: (rule) => rule.max(4),
        }),
      ],
    }),
  ],
  preview: {
    prepare: () => ({ title: "Homepage" }),
  },
});
