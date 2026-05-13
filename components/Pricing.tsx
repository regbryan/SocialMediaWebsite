import CheckoutButton from "@/components/CheckoutButton";

type Plan = {
  name: string;
  // Stripe tier identifier — `null` for the contact-sales tier.
  tier: "starter" | "growth" | null;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  // Fallback link when tier is null (Agency → contact form).
  href?: string;
  popular?: boolean;
};

const plans: Plan[] = [
  {
    name: "Starter",
    tier: "starter",
    price: "$497",
    period: "/mo",
    description: "For small businesses building a consistent presence.",
    features: [
      "5 posts per week",
      "1 platform (IG or FB)",
      "Custom graphics & captions",
      "Monthly performance report",
      "Email support",
    ],
    cta: "Get Started",
  },
  {
    name: "Growth",
    tier: "growth",
    price: "$997",
    period: "/mo",
    description: "For brands serious about growing across platforms.",
    features: [
      "7 posts per week",
      "3 platforms (IG · FB · LinkedIn)",
      "Reels & carousel content",
      "Weekly performance reports",
      "Priority support",
      "Content strategy calls",
    ],
    cta: "Get Started",
    popular: true,
  },
  {
    name: "Agency",
    tier: null,
    price: "Custom",
    period: "",
    description: "Full-service content production for agencies.",
    features: [
      "Unlimited posts",
      "All platforms",
      "Dedicated content team",
      "White-label options",
      "Custom reporting & strategy",
    ],
    cta: "Contact Us",
    href: "#contact",
  },
];

function PriceTag({ price, period }: { price: string; period: string }) {
  if (!price.startsWith("$")) {
    return (
      <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
        <span style={{ fontSize: "36px", fontWeight: 400, color: "#fff", lineHeight: 1, letterSpacing: "-0.02em" }}>
          {price}
        </span>
      </div>
    );
  }
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: "3px" }}>
      <span style={{ fontSize: "18px", fontWeight: 500, color: "#bfbfcc" }}>$</span>
      <span style={{ fontSize: "48px", fontWeight: 400, color: "#fff", lineHeight: 1, letterSpacing: "-0.03em" }}>
        {price.slice(1)}
      </span>
      {period && (
        <span style={{ fontSize: "14px", color: "#9999a6", fontWeight: 400 }}>{period}</span>
      )}
    </div>
  );
}

function PlanCard({ plan }: { plan: Plan }) {
  return (
    <article
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        padding: "32px 28px",
        borderRadius: "20px",
        background: plan.popular ? "#0d0a1c" : "#0f0f1a",
        border: plan.popular
          ? "1px solid rgba(139,92,255,0.55)"
          : "1px solid #1a1a2e",
        boxShadow: plan.popular
          ? "0 24px 60px rgba(0,0,0,0.4), 0 0 28px rgba(139,92,255,0.12)"
          : "0 12px 32px rgba(0,0,0,0.3)",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <span
          style={{
            fontSize: "13px",
            fontWeight: 600,
            color: plan.popular ? "#b18bff" : "#9999a6",
            letterSpacing: "0.16em",
            textTransform: "uppercase",
          }}
        >
          {plan.name}
        </span>
        <PriceTag price={plan.price} period={plan.period} />
        <p style={{ fontSize: "14px", color: "#bfbfcc", lineHeight: 1.5, margin: 0, maxWidth: "26ch" }}>
          {plan.description}
        </p>
      </div>

      <div style={{ height: "1px", background: "#1a1a2e" }} />

      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
        {plan.features.map((f) => (
          <li
            key={f}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "10px",
              fontSize: "14px",
              color: "#d6d6e0",
              lineHeight: 1.45,
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#8b5cff"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ marginTop: "3px", flexShrink: 0 }}
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>{f}</span>
          </li>
        ))}
      </ul>

      {plan.tier ? (
        <CheckoutButton
          tier={plan.tier}
          label={plan.cta}
          variant={plan.popular ? "primary" : "secondary"}
        />
      ) : (
        <a
          href={plan.href ?? "#contact"}
          className={plan.popular ? "sp-shiny" : "sp-shiny sp-shiny--secondary"}
          style={{
            display: "block",
            textAlign: "center",
            textDecoration: "none",
            marginTop: "auto",
          }}
        >
          {plan.cta} →
        </a>
      )}
    </article>
  );
}

export default function Pricing() {
  return (
    <section
      id="pricing"
      style={{
        backgroundColor: "#07070e",
        padding: "120px clamp(24px, 6vw, 120px)",
      }}
    >
      <div className="mx-auto" style={{ maxWidth: "1180px" }}>
        <div
          className="flex flex-col"
          style={{ gap: "14px", marginBottom: "56px", maxWidth: "640px" }}
        >
          <h2 className="display-heading" style={{ fontSize: "clamp(48px, 7vw, 88px)" }}>
            Three retainers. Pick one.
          </h2>
          <p style={{ fontSize: "16px", color: "#9999a6", margin: 0, maxWidth: "52ch" }}>
            No contracts. Cancel anytime.
          </p>
        </div>

        <div
          className="grid grid-cols-1 md:grid-cols-3"
          style={{ gap: "20px", alignItems: "stretch" }}
        >
          {plans.map((plan) => (
            <PlanCard key={plan.name} plan={plan} />
          ))}
        </div>
      </div>
    </section>
  );
}
