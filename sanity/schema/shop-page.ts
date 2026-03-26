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
      initialValue: "The Collection",
    }),
    defineField({
      name: "heroHeadline",
      title: "Hero Headline",
      type: "string",
      initialValue: "Handcrafted Oak Drink Covers",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "heroBody",
      title: "Hero Body",
      type: "text",
      rows: 2,
      initialValue:
        "Each piece is cut, shaped and finished by hand in Bournemouth. No two are exactly the same.",
    }),
  ],
  preview: {
    prepare: () => ({ title: "Shop Page" }),
  },
});
