const plans = [
  {
    label: "STARTER",
    name: "Starter",
    price: "$497",
    period: "/month",
    description: "Perfect for small businesses ready to build a consistent social presence.",
    features: [
      "5 posts per week",
      "1 platform (Instagram or Facebook)",
      "Custom graphics & captions",
      "Monthly performance report",
      "Email support",
    ],
    cta: "Get Started",
    href: "mailto:hello@socialpulse.media?subject=Starter Plan",
    popular: false,
  },
  {
    label: "MOST POPULAR",
    name: "Growth",
    price: "$997",
    period: "/month",
    description: "For brands serious about growing their audience across multiple platforms.",
    features: [
      "7 posts per week",
      "3 platforms (Instagram, Facebook, LinkedIn)",
      "Reels & carousel content",
      "Weekly performance reports",
      "Priority support",
      "Content strategy calls",
    ],
    cta: "Get Started",
    href: "mailto:hello@socialpulse.media?subject=Growth Plan",
    popular: true,
  },
  {
    label: "FOR AGENCIES",
    name: "Agency",
    price: "Custom",
    period: "",
    description: "Full-service content production for agencies and high-volume brands.",
    features: [
      "Unlimited posts",
      "All platforms",
      "Dedicated content team",
      "White-label options",
      "Custom reporting & strategy",
    ],
    cta: "Contact Us",
    href: "mailto:hello@socialpulse.media?subject=Agency Plan",
    popular: false,
  },
];

export default function Pricing() {
  return (
    <section
      id="pricing"
      style={{
        backgroundColor: "#07070e",
        padding: "96px clamp(24px, 6vw, 120px)",
      }}
    >
      <div className="mx-auto" style={{ maxWidth: "1280px" }}>
        {/* Header */}
        <div
          className="flex flex-col items-center"
          style={{ gap: "16px", marginBottom: "56px", textAlign: "center" }}
        >
          <span
            style={{
              fontSize: "13px",
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#8b5cff",
            }}
          >
            Pricing
          </span>
          <h2
            style={{
              fontSize: "clamp(32px, 4vw, 48px)",
              fontWeight: 700,
              letterSpacing: "-0.03em",
              color: "white",
              margin: 0,
            }}
          >
            Simple, Transparent Pricing
          </h2>
          <p style={{ fontSize: "17px", color: "#9999a6", maxWidth: "480px", margin: 0 }}>
            No contracts. No surprises. Cancel anytime.
          </p>
        </div>

        {/* Cards */}
        <div
          className="grid grid-cols-1 md:grid-cols-3"
          style={{ gap: "24px", alignItems: "stretch" }}
        >
          {plans.map((plan) => (
            <div
              key={plan.name}
              style={{
                backgroundColor: plan.popular ? "#0f0f1a" : "#090912",
                border: plan.popular
                  ? "1px solid #8b5cff"
                  : "1px solid #1a1a2e",
                borderRadius: "20px",
                padding: "36px 32px",
                display: "flex",
                flexDirection: "column",
                gap: "24px",
                position: "relative",
                boxShadow: plan.popular
                  ? "0 0 40px rgba(139,92,255,0.12)"
                  : "none",
              }}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div
                  style={{
                    position: "absolute",
                    top: "-14px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "linear-gradient(90deg, #8b5cff, #3b81ff)",
                    color: "white",
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    padding: "4px 16px",
                    borderRadius: "999px",
                    whiteSpace: "nowrap",
                  }}
                >
                  Most Popular
                </div>
              )}

              {/* Top */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "#8b5cff",
                  }}
                >
                  {plan.label}
                </span>
                <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
                  <span
                    style={{
                      fontSize: "clamp(32px, 4vw, 42px)",
                      fontWeight: 700,
                      color: "white",
                      lineHeight: 1,
                    }}
                  >
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span style={{ fontSize: "14px", color: "#9999a6" }}>
                      {plan.period}
                    </span>
                  )}
                </div>
                <p style={{ fontSize: "14px", color: "#9999a6", margin: 0, lineHeight: 1.5 }}>
                  {plan.description}
                </p>
              </div>

              {/* Divider */}
              <div style={{ height: "1px", backgroundColor: "#1a1a2e" }} />

              {/* Features */}
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  flex: 1,
                }}
              >
                {plan.features.map((f) => (
                  <li
                    key={f}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      fontSize: "14px",
                      color: "#bfbfcc",
                    }}
                  >
                    <span style={{ color: "#8b5cff", fontSize: "16px", lineHeight: 1 }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <a
                href={plan.href}
                style={{
                  display: "block",
                  textAlign: "center",
                  padding: "13px 24px",
                  borderRadius: "10px",
                  fontSize: "15px",
                  fontWeight: 600,
                  textDecoration: "none",
                  background: plan.popular
                    ? "linear-gradient(135deg, #8b5cff 0%, #3b81ff 100%)"
                    : "transparent",
                  border: plan.popular ? "none" : "1px solid #1a1a2e",
                  color: plan.popular ? "white" : "#bfbfcc",
                  cursor: "pointer",
                }}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
