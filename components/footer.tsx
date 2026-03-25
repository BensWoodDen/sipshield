import Link from "next/link";

const shopLinks = [
  { href: "/shop", label: "All Products" },
];

const infoLinks = [
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

interface FooterProps {
  instagramUrl?: string;
}

export function Footer({ instagramUrl }: FooterProps) {
  return (
    <footer className="bg-oak-900 text-oak-200">
      <div className="max-w-[1200px] mx-auto px-6 pt-12 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr_1fr] gap-12 mb-10 pb-8 border-b border-white/10">
          <div>
            <p className="font-display text-[clamp(1.5rem,2.5vw+0.75rem,2.25rem)] text-oak-100 mb-3">
              SipShield
            </p>
            <p className="text-oak-400 leading-relaxed max-w-[32ch]">
              Handcrafted oak drink covers, made in the UK.
              Each piece is unique — no two are the same.
            </p>
          </div>

          <nav aria-label="Shop links">
            <p className="text-sm font-semibold uppercase tracking-wider text-oak-300 mb-4">
              Shop
            </p>
            <ul className="flex flex-col gap-3">
              {shopLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-oak-400 hover:text-oak-100 transition-colors duration-100"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Info links">
            <p className="text-sm font-semibold uppercase tracking-wider text-oak-300 mb-4">
              Info
            </p>
            <ul className="flex flex-col gap-3">
              {infoLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-oak-400 hover:text-oak-100 transition-colors duration-100"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-oak-500">
          <span>&copy; {new Date().getFullYear()} SipShield. All rights reserved.</span>
          {instagramUrl && (
            <div className="flex gap-4">
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-oak-400 font-medium hover:text-oak-100 transition-colors duration-100"
              >
                Instagram
              </a>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
