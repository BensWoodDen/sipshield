import { getContactPage } from "@/lib/sanity/queries";
import { ContactForm } from "@/components/contact-form";
import type { ContactPageData } from "@/lib/sanity/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact — SipShield",
  description:
    "Get in touch with Ben about custom orders, personalisation, or anything else. We typically reply within a day or two.",
};

const fallback: Required<ContactPageData> = {
  opener: {
    kicker: "Get in touch",
    headline: "Have a question? Drop us a message",
    body: "Whether it's about a custom order, personalisation options, or anything else, we'd love to hear from you. Ben typically replies within a day or two.",
  },
};

export default async function ContactPage() {
  const data = await getContactPage();

  const opener = data?.opener ?? fallback.opener;

  return (
    <main>
      <div className="max-w-[1200px] mx-auto px-6 pt-16 pb-16 md:pt-24 md:pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-start">
          {/* ── Opener ── */}
          <section aria-label="Introduction">
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

          {/* ── Form ── */}
          <section aria-label="Contact form" className="relative">
            <ContactForm />
          </section>
        </div>
      </div>
    </main>
  );
}
