type FooterLink = { label: string; href?: string; external?: boolean };

const footerSections: { heading: string; links: FooterLink[] }[] = [
  {
    heading: "Services",
    links: [
      { label: "Instagram Posts" },
      { label: "Carousels" },
      { label: "Reels" },
      { label: "LinkedIn Content" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About Us" },
      { label: "Portfolio", href: "#portfolio" },
      { label: "Pricing" },
      { label: "Contact", href: "#contact" },
    ],
  },
  {
    heading: "Connect",
    links: [
      { label: "Client Login", href: "https://dashboard-eight-theta-24.vercel.app/", external: true },
      { label: "Instagram" },
      { label: "LinkedIn" },
      { label: "Email Us", href: "mailto:hello@socialpulse.media" },
    ],
  },
];

export default function Footer() {
  return (
    <footer
      style={{
        backgroundColor: "#07070e",
        borderTop: "1px solid #1a1a2e",
        padding: "64px clamp(24px, 6vw, 120px) 32px",
      }}
    >
      <div
        className="mx-auto flex flex-col"
        style={{ maxWidth: "1280px", gap: "48px" }}
      >
        <div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4"
          style={{ gap: "40px" }}
        >
          {/* Brand column */}
          <div className="flex flex-col" style={{ gap: "12px" }}>
            <span
              style={{
                fontSize: "22px",
                fontWeight: 700,
                color: "white",
                letterSpacing: "-0.01em",
              }}
            >
              SocialPulse
            </span>
          </div>

          {/* Link columns */}
          {footerSections.map(({ heading, links }) => (
            <div key={heading} className="flex flex-col" style={{ gap: "16px" }}>
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "white",
                }}
              >
                {heading}
              </span>
              <ul
                className="flex flex-col"
                style={{ gap: "10px", listStyle: "none", padding: 0, margin: 0 }}
              >
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href || "#"}
                      target={link.external ? "_blank" : undefined}
                      rel={link.external ? "noopener noreferrer" : undefined}
                      style={{
                        fontSize: "13px",
                        color: "#9999a6",
                        textDecoration: "none",
                      }}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div style={{ height: "1px", backgroundColor: "#1a1a2e" }} />

        {/* Copyright */}
        <p
          style={{
            fontSize: "13px",
            color: "#9999a6",
            textAlign: "center",
            margin: 0,
          }}
        >
          © 2026 SocialPulse Media. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
