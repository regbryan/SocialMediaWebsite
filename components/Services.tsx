import Image from "next/image";

type Service = {
  title: string;
  tagline: string;
  description: string;
  image: string;
  cta: string;
  href: string;
};

const services: Service[] = [
  {
    title: "Feed Posts",
    tagline: "Stop the scroll",
    description: "Branded posts and stories that feel consistent but never boring.",
    image: "/portfolio/v5_03_pet_hair.png",
    cta: "Book Feed Posts",
    href: "/start",
  },
  {
    title: "Carousels",
    tagline: "Teach, don't sell",
    description: "Swipeable educational decks that drive saves, shares, and follows.",
    image: "/portfolio/v1_01_bright_canary_explainer.png",
    cta: "Book Carousels",
    href: "/start",
  },
  {
    title: "Reels & Shorts",
    tagline: "Built for reach",
    description: "Trend-aware short video, scripted, edited, and posted end-to-end.",
    image: "/portfolio/v6_07_mothers_day.png",
    cta: "Book Reels",
    href: "/start",
  },
  {
    title: "LinkedIn",
    tagline: "Authority at scale",
    description: "Thought-leadership posts that build trust and drive inbound.",
    image: "/portfolio/v1_13_referral.png",
    cta: "Book LinkedIn",
    href: "/start",
  },
  {
    title: "Paid Social Ads",
    tagline: "Scale what works",
    description: "Meta, TikTok, and LinkedIn ads with organic-feel creative.",
    image: "/portfolio/omega-tax.png",
    cta: "Book Paid Ads",
    href: "/start",
  },
  {
    title: "Community",
    tagline: "Stay responsive",
    description: "Comment and DM management that keeps your audience engaged.",
    image: "/portfolio/scboardwalk-ride.png",
    cta: "Book Community",
    href: "/start",
  },
  {
    title: "Strategy",
    tagline: "Built on data",
    description: "Positioning, content pillars, and a 90-day roadmap.",
    image: "/portfolio/v2_02_myth_20pct.png",
    cta: "Book Strategy",
    href: "/start",
  },
];

function ServiceCard({ service }: { service: Service }) {
  return (
    <a
      href={service.href}
      className="service-card"
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        padding: "20px",
        borderRadius: "20px",
        background: "#0f0f1a",
        border: "1px solid #1a1a2e",
        textDecoration: "none",
        transition: "transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.35s ease, box-shadow 0.35s ease",
      }}
    >
      <div
        style={{
          position: "relative",
          aspectRatio: "4 / 5",
          width: "100%",
          borderRadius: "14px",
          overflow: "hidden",
          background: "#0a0a14",
        }}
      >
        <Image
          src={service.image}
          alt={`${service.title} example`}
          fill
          sizes="(max-width: 720px) 100vw, (max-width: 1200px) 33vw, 280px"
          style={{ objectFit: "cover" }}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <h3
          style={{
            fontSize: "20px",
            fontWeight: 700,
            color: "white",
            letterSpacing: "-0.01em",
            margin: 0,
          }}
        >
          {service.title}
        </h3>
        <span
          style={{
            fontSize: "12px",
            fontWeight: 500,
            color: "#b18bff",
            letterSpacing: "0.04em",
          }}
        >
          {service.tagline}
        </span>
        <p style={{ fontSize: "13px", color: "#9999a6", lineHeight: 1.5, margin: "4px 0 0", maxWidth: "32ch" }}>
          {service.description}
        </p>
      </div>

      <div
        style={{
          marginTop: "auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          paddingTop: "12px",
          borderTop: "1px solid #1a1a2e",
        }}
      >
        <span style={{ fontSize: "12px", color: "#b18bff", fontWeight: 500 }} aria-hidden>
          →
        </span>
      </div>
    </a>
  );
}

export default function Services() {
  return (
    <section
      id="services"
      style={{
        backgroundColor: "#090912",
        padding: "120px clamp(24px, 6vw, 120px)",
      }}
    >
      <div className="mx-auto flex flex-col" style={{ maxWidth: "1280px", gap: "56px" }}>
        <div className="flex flex-col" style={{ gap: "14px", maxWidth: "640px" }}>
          <span className="eyebrow">What We Do</span>
          <h2 className="display-heading" style={{ fontSize: "clamp(48px, 7vw, 88px)" }}>
            What we make every week.
          </h2>
        </div>

        <div className="services-grid">
          {services.map((service) => (
            <ServiceCard key={service.title} service={service} />
          ))}
        </div>
      </div>

      <style>{`
        .services-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }
        @media (max-width: 1100px) {
          .services-grid { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 760px) {
          .services-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 480px) {
          .services-grid { grid-template-columns: 1fr; }
        }
        .service-card:hover {
          transform: translateY(-4px);
          border-color: rgba(139, 92, 255, 0.35) !important;
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.45);
        }
        .service-card:active {
          transform: translateY(-1px) scale(0.99);
        }
      `}</style>
    </section>
  );
}
