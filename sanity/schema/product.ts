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
      description: "Used when product has no size variants",
      hidden: ({ parent }) =>
        Array.isArray(parent?.variants) && parent.variants.length > 0,
    }),
    defineField({
      name: "variants",
      title: "Size Variants",
      type: "array",
      description:
        "Add sizes if this product comes in multiple sizes. Leave empty for single-size products.",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "name",
              title: "Size Name",
              type: "string",
              validation: (rule) => rule.required(),
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
          ],
          preview: {
            select: { title: "name", subtitle: "price" },
            prepare: ({ title, subtitle }) => ({
              title,
              subtitle: subtitle ? `£${subtitle}` : undefined,
            }),
          },
        },
      ],
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
