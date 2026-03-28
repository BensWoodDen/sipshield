import { defineType, defineField } from "sanity";
import { UsersIcon } from "@sanity/icons";

export const aboutPage = defineType({
  name: "aboutPage",
  title: "About Page",
  type: "document",
  icon: UsersIcon,
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
          initialValue: "About SipShield",
        }),
        defineField({
          name: "headline",
          title: "Headline",
          type: "string",
          initialValue: "Oak drink covers, made by hand in Bournemouth",
        }),
        defineField({
          name: "body",
          title: "Intro Text",
          type: "text",
          rows: 4,
        }),
      ],
    }),
    defineField({
      name: "story",
      title: "Our Story Section",
      type: "object",
      fields: [
        defineField({
          name: "heading",
          title: "Heading",
          type: "string",
          initialValue: "How it started",
        }),
        defineField({
          name: "body",
          title: "Story Text",
          type: "text",
          rows: 6,
        }),
        defineField({
          name: "photo",
          title: "Maker Photo",
          type: "image",
          options: { hotspot: true },
        }),
        defineField({
          name: "photoAlt",
          title: "Photo Alt Text",
          type: "string",
          initialValue: "Ben in the workshop",
        }),
      ],
    }),
    defineField({
      name: "process",
      title: "Process Section",
      type: "object",
      fields: [
        defineField({
          name: "heading",
          title: "Section Heading",
          type: "string",
          initialValue: "How they're made",
        }),
        defineField({
          name: "steps",
          title: "Process Steps",
          type: "array",
          of: [
            {
              type: "object",
              fields: [
                defineField({
                  name: "title",
                  title: "Step Title",
                  type: "string",
                }),
                defineField({
                  name: "description",
                  title: "Step Description",
                  type: "text",
                  rows: 3,
                }),
                defineField({
                  name: "image",
                  title: "Step Image",
                  type: "image",
                  options: { hotspot: true },
                }),
              ],
              preview: {
                select: { title: "title", media: "image" },
              },
            },
          ],
          validation: (rule) => rule.max(4),
        }),
      ],
    }),
    defineField({
      name: "values",
      title: "Values Section",
      type: "object",
      fields: [
        defineField({
          name: "heading",
          title: "Section Heading",
          type: "string",
          initialValue: "The short version",
        }),
        defineField({
          name: "items",
          title: "Values",
          type: "array",
          of: [
            {
              type: "object",
              fields: [
                defineField({
                  name: "title",
                  title: "Value Title",
                  type: "string",
                }),
                defineField({
                  name: "description",
                  title: "Value Description",
                  type: "text",
                  rows: 3,
                }),
              ],
              preview: {
                select: { title: "title" },
              },
            },
          ],
          validation: (rule) => rule.max(4),
        }),
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
          initialValue: "See the full range",
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
    prepare: () => ({ title: "About Page" }),
  },
});
