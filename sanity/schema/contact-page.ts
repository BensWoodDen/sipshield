import { defineType, defineField } from "sanity";
import { EnvelopeIcon } from "@sanity/icons";

export const contactPage = defineType({
  name: "contactPage",
  title: "Contact Page",
  type: "document",
  icon: EnvelopeIcon,
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
          initialValue: "Get in touch",
        }),
        defineField({
          name: "headline",
          title: "Headline",
          type: "string",
          initialValue: "Have a question? Drop us a message",
        }),
        defineField({
          name: "body",
          title: "Intro Text",
          type: "text",
          rows: 4,
        }),
      ],
    }),
  ],
  preview: {
    prepare: () => ({ title: "Contact Page" }),
  },
});
