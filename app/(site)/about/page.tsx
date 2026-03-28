import Image from "next/image";
import Link from "next/link";
import { getAboutPage } from "@/lib/sanity/queries";
import { urlFor } from "@/lib/sanity/image";
import type { AboutPageData } from "@/lib/sanity/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — SipShield",
  description:
    "Oak drink covers made by hand in Bournemouth by Ben. One-person workshop, thirteen styles, solid British oak.",
};

/* ── Fallback content when Sanity has no about page yet ── */
const fallback: Required<AboutPageData> = {
  opener: {
    kicker: "About SipShield",
    headline: "Oak drink covers, made by hand in Bournemouth",
    body: "Solid British oak, shaped and finished by one person in a Bournemouth workshop. Sits on top of your glass and keeps the bugs out.",
  },
  story: {
    heading: "How it started",
    body: "Ben's a woodworker in Bournemouth. A few summers ago he got fed up fishing insects out of his pint at a barbecue, so he made a cover from a bit of oak he had in the workshop. It worked. Friends asked for one. Then their friends did too.\n\nThirteen styles later, he's still making them all himself. Simple round ones, ones shaped for wine glasses, personalised ones with names or photos burned in. It's still a one-man operation in the same workshop.",
    photoAlt: "Ben in the workshop",
  },
  process: {
    heading: "How they're made",
    steps: [
      {
        _key: "1",
        title: "Pick the oak",
        description:
          "Ben sources British oak and picks each piece by the grain. Anything knotty or split doesn't make the cut.",
      },
      {
        _key: "2",
        title: "Cut, shape, sand",
        description:
          "Each cover is cut to size on a bandsaw, shaped by hand, then sanded down through four grits.",
      },
      {
        _key: "3",
        title: "Finish and personalise",
        description:
          "A food-safe oil finish goes on last. If you've ordered personalisation, your text or image gets burned in before finishing.",
      },
    ],
  },
  values: {
    heading: "The short version",
    items: [
      {
        _key: "1",
        title: "One person, no factory",
        description:
          "Ben makes every cover himself. There's no production line. That's why stock is sometimes limited.",
      },
      {
        _key: "2",
        title: "Oak lasts",
        description:
          "Oak handles moisture and heat well. Leave one on the garden table all summer and it'll be fine.",
      },
      {
        _key: "3",
        title: "Made and shipped from Bournemouth",
        description:
          "British oak, finished in Dorset, posted from Bournemouth. The whole thing happens within about 20 miles.",
      },
    ],
  },
  cta: {
    heading: "See the full range",
    body: "Thirteen styles so far. Most can be personalised with a name, date, or your own image.",
    buttonLabel: "Shop drink covers",
    buttonLink: "/shop",
  },
};

export default async function AboutPage() {
  const data = await getAboutPage();

  const opener = data?.opener ?? fallback.opener;
  const story = data?.story ?? fallback.story;
  const process = data?.process ?? fallback.process;
  const values = data?.values ?? fallback.values;
  const cta = data?.cta ?? fallback.cta;

  return (
    <main>
      {/* ── Editorial Opener ── */}
      <section
        aria-label="Introduction"
        className="max-w-[1200px] mx-auto px-6 pt-16 pb-12 md:pt-24 md:pb-20"
      >
        <p className="text-sm font-semibold uppercase tracking-widest text-forest-600 mb-4">
          {opener.kicker}
        </p>
        <h1 className="font-display text-[clamp(2.25rem,5vw+0.75rem,4rem)] leading-[1.1] tracking-tight text-oak-800 max-w-[20ch] mb-6">
          {opener.headline}
        </h1>
        <p className="text-[clamp(1.125rem,1.5vw+0.5rem,1.375rem)] text-neutral-600 leading-relaxed max-w-[52ch]">
          {opener.body}
        </p>
      </section>

      {/* ── Story Split ── */}
      <section aria-label="Our story" className="bg-oak-50">
        <div className="max-w-[1200px] mx-auto px-6 py-12 md:py-20">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_1.2fr] gap-8 md:gap-12 items-center">
            {/* Photo */}
            {story.photo ? (
              <div className="relative aspect-[4/5] rounded-xl overflow-hidden shadow-lg">
                <Image
                  src={urlFor(story.photo).width(600).height(750).url()}
                  alt={story.photoAlt || "The maker"}
                  width={600}
                  height={750}
                  className="object-cover w-full h-full"
                  sizes="(max-width: 768px) 100vw, 45vw"
                />
              </div>
            ) : (
              <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-oak-200 flex items-center justify-center">
                <div className="text-center px-8">
                  <p className="font-display text-oak-500 text-lg">
                    Workshop photo
                  </p>
                  <p className="text-oak-400 text-sm mt-2">
                    Add in Sanity Studio
                  </p>
                </div>
              </div>
            )}

            {/* Text */}
            <div>
              <h2 className="font-display text-[clamp(1.5rem,2.5vw+0.75rem,2.25rem)] text-oak-800 mb-5 leading-tight">
                {story.heading}
              </h2>
              {story.body?.split("\n\n").map((paragraph, i) => (
                <p
                  key={i}
                  className="text-neutral-600 leading-relaxed mb-4 last:mb-0 max-w-[48ch]"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Process Steps ── */}
      {process.steps && process.steps.length > 0 && (
        <section
          aria-label="Our process"
          className="max-w-[1200px] mx-auto px-6 py-12 md:py-20"
        >
          <h2 className="font-display text-[clamp(1.5rem,2.5vw+0.75rem,2.25rem)] text-oak-800 mb-10 leading-tight text-center">
            {process.heading}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
            {process.steps.map((step, i) => (
              <div key={step._key} className="relative">
                {/* Step number */}
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-forest-100 text-forest-700 font-semibold text-sm mb-4">
                  {i + 1}
                </span>

                {/* Step image */}
                {step.image ? (
                  <div className="relative aspect-[3/2] rounded-lg overflow-hidden mb-4 shadow-sm">
                    <Image
                      src={urlFor(step.image).width(400).height(267).url()}
                      alt={step.title}
                      width={400}
                      height={267}
                      className="object-cover w-full h-full"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                ) : null}

                <h3 className="font-display text-lg text-oak-800 mb-2">
                  {step.title}
                </h3>
                <p className="text-neutral-500 leading-relaxed text-[0.9375rem]">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Values Band ── */}
      {values.items && values.items.length > 0 && (
        <section aria-label="Our values" className="bg-oak-900">
          <div className="max-w-[1200px] mx-auto px-6 py-12 md:py-20">
            <h2 className="font-display text-[clamp(1.5rem,2.5vw+0.75rem,2.25rem)] text-oak-100 mb-10 leading-tight">
              {values.heading}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {values.items.map((item) => (
                <div key={item._key}>
                  <h3 className="text-oak-200 font-semibold text-lg mb-2">
                    {item.title}
                  </h3>
                  <p className="text-oak-400 leading-relaxed text-[0.9375rem]">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ── */}
      <section
        aria-label="Shop"
        className="max-w-[1200px] mx-auto px-6 py-16 md:py-24 text-center"
      >
        <h2 className="font-display text-[clamp(1.5rem,2.5vw+0.75rem,2.5rem)] text-oak-800 mb-4 leading-tight">
          {cta.heading}
        </h2>
        {cta.body && (
          <p className="text-neutral-500 leading-relaxed max-w-[48ch] mx-auto mb-8">
            {cta.body}
          </p>
        )}
        <Link
          href={cta.buttonLink}
          className="inline-block px-8 py-3.5 bg-forest-500 text-white font-medium rounded-lg shadow-sm hover:bg-forest-600 hover:shadow-md transition-all duration-[var(--duration-fast)] focus-visible:outline-none focus-visible:shadow-focus"
        >
          {cta.buttonLabel}
        </Link>
      </section>
    </main>
  );
}
