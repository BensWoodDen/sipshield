import Link from "next/link";
import { getFaqPage } from "@/lib/sanity/queries";
import type { FaqPageData } from "@/lib/sanity/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ — SipShield",
  description:
    "Common questions about SipShield oak drink covers, including delivery, personalisation, sizing, and care.",
};

const fallback: Required<FaqPageData> = {
  opener: {
    kicker: "FAQ",
    headline: "Frequently asked questions",
    body: "Everything you need to know about our oak drink covers.",
  },
  faqs: [
    {
      _key: "1",
      question: "How long does delivery take?",
      answer:
        "Most orders are posted within 3-5 working days. Ben makes each cover to order, so busy periods can take a little longer.",
    },
    {
      _key: "2",
      question: "Can I personalise any cover?",
      answer:
        'Most covers can be personalised with a name, date, or your own image. Look for the "Personalisable" badge on the product page.',
    },
    {
      _key: "3",
      question: "How do I look after my drink cover?",
      answer:
        "Wipe it down with a damp cloth after use. The food-safe oil finish protects the oak, but avoid soaking it or putting it in the dishwasher.",
    },
    {
      _key: "4",
      question: "What sizes are available?",
      answer:
        "Covers come in different sizes to fit standard pint glasses, wine glasses, and tumblers. Check each product for exact dimensions.",
    },
    {
      _key: "5",
      question: "Can I return or exchange a cover?",
      answer:
        "Personalised covers are made to order and can't be returned unless faulty. Standard covers can be returned unused within 14 days.",
    },
  ],
  cta: {
    heading: "Still have questions?",
    body: "Drop Ben a message or take a look at the full range.",
    buttonLabel: "Shop drink covers",
    buttonLink: "/shop",
  },
};

export default async function FaqPage() {
  const data = await getFaqPage();

  const opener = data?.opener ?? fallback.opener;
  const faqs = data?.faqs ?? fallback.faqs;
  const cta = data?.cta ?? fallback.cta;

  return (
    <main>
      {/* ── Opener ── */}
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
        {opener.body && (
          <p className="text-[clamp(1.125rem,1.5vw+0.5rem,1.375rem)] text-neutral-600 leading-relaxed max-w-[52ch]">
            {opener.body}
          </p>
        )}
      </section>

      {/* ── FAQ Accordion ── */}
      {faqs && faqs.length > 0 && (
        <section
          aria-label="Frequently asked questions"
          className="max-w-[720px] mx-auto px-6 pb-12 md:pb-20"
        >
          <div className="divide-y divide-oak-200">
            {faqs.map((faq) => (
              <details
                key={faq._key}
                className="group py-5"
              >
                <summary className="flex items-center justify-between cursor-pointer list-none font-display text-lg text-oak-800 hover:text-forest-600 transition-colors duration-[var(--duration-fast)]">
                  {faq.question}
                  <span className="ml-4 shrink-0 text-oak-400 group-open:rotate-45 transition-transform duration-[var(--duration-fast)]">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-neutral-600 leading-relaxed max-w-[56ch]">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* ── CTA ── */}
      <section
        aria-label="Call to action"
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
