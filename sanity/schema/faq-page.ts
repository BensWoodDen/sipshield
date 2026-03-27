import { defineType, defineField } from "sanity";
import { HelpCircleIcon } from "@sanity/icons";

export const faqPage = defineType({
  name: "faqPage",
  title: "FAQ Page",
  type: "document",
  icon: HelpCircleIcon,
  fields: [
    defineField({
      name: "opener",
      title: "Page Opener",
      type: "object",
      fields: [
        defineField({
          name: "kicker",
          title: "Kicker",
          type: "string",
          initialValue: "FAQ",
        }),
        defineField({
          name: "headline",
          title: "Headline",
          type: "string",
          initialValue: "Frequently asked questions",
        }),
        defineField({
          name: "body",
          title: "Intro Text",
          type: "text",
          rows: 3,
        }),
      ],
    }),
    defineField({
      name: "faqs",
      title: "Questions",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "question",
              title: "Question",
              type: "string",
            }),
            defineField({
              name: "answer",
              title: "Answer",
              type: "text",
              rows: 4,
            }),
          ],
          preview: {
            select: { title: "question" },
          },
        },
      ],
    }),
    defineField({
      name: "cta",
      title: "Call to Action",
      type: "object",
      fields: [
        defineField({
          name: "heading",
          title: "Heading",
          type: "string",
          initialValue: "Still have questions?",
        }),
        defineField({
          name: "body",
          title: "Body Text",
          type: "text",
          rows: 2,
        }),
        defineField({
          name: "buttonLabel",
          title: "Button Label",
          type: "string",
          initialValue: "Shop drink covers",
        }),
        defineField({
          name: "buttonLink",
          title: "Button Link",
          type: "string",
          initialValue: "/shop",
        }),
      ],
    }),
  ],
  preview: {
    prepare: () => ({ title: "FAQ Page" }),
  },
});
