import { defineType, defineField } from "sanity";
import { DocumentTextIcon } from "@sanity/icons";

export const shopPage = defineType({
  name: "shopPage",
  title: "Shop Page",
  type: "document",
  icon: DocumentTextIcon,
  fields: [
    defineField({
      name: "heroKicker",
      title: "Hero Kicker",
      type: "string",
      initialValue: "The full range",
    }),
    defineField({
      name: "heroHeadline",
      title: "Hero Headline",
      type: "string",
      initialValue: "Every style we make",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "heroBody",
      title: "Hero Body",
      type: "text",
      rows: 2,
      initialValue:
        "Solid British oak, made one at a time in Bournemouth. Pick a style and add personalisation if you want it.",
    }),
  ],
  preview: {
    prepare: () => ({ title: "Shop Page" }),
  },
});
