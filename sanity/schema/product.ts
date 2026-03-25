import { defineType, defineField } from "sanity";
import { PackageIcon } from "@sanity/icons";

export const product = defineType({
  name: "product",
  title: "Product",
  type: "document",
  icon: PackageIcon,
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "name" },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "variant",
      title: "Variant Name",
      type: "string",
    }),
    defineField({
      name: "price",
      title: "Price (£)",
      type: "number",
      validation: (rule) => rule.required().positive(),
    }),
    defineField({
      name: "stripePriceId",
      title: "Stripe Price ID",
      type: "string",
    }),
    defineField({
      name: "family",
      title: "Product Family",
      type: "reference",
      to: [{ type: "productFamily" }],
    }),
    defineField({
      name: "images",
      title: "Images",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
    }),
    defineField({
      name: "tag",
      title: "Tag",
      type: "string",
      description: 'e.g. "New", "Popular", "Limited"',
    }),
    defineField({
      name: "personalisable",
      title: "Personalisable",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "personalisationLabel",
      title: "Personalisation Label",
      type: "string",
      hidden: ({ parent }) => !parent?.personalisable,
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "variant", media: "images.0" },
  },
});
