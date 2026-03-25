import { defineType, defineField } from "sanity";
import { TagIcon } from "@sanity/icons";

export const productFamily = defineType({
  name: "productFamily",
  title: "Product Family",
  type: "document",
  icon: TagIcon,
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
      name: "displayOrder",
      title: "Display Order",
      type: "number",
    }),
  ],
});
