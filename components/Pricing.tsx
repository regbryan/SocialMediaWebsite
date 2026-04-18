"use client";

import { useState } from "react";

type Plan = {
  label: string;
  name: string;
  price: string;
  period: string;
  teaser: string;
  description: string;
  features: string[];
  cta: string;
  href: string;
  popular?: boolean;
};

const plans: Plan[] = [
  {
    label: "Starter",
    name: "Starter",
    price: "$497",
    period: "/mo",
    teaser: "5 posts / week · 1 platform",
    description: "Perfect for small businesses building a consistent social presence.",
    features: [
      "5 posts per week",
      "1 platform (IG or FB)",
      "Custom graphics & captions",
      "Monthly performance report",
      "Email support",
    ],
    cta: "Get Started",
    href: "mailto:hello@socialpulse.media?subject=Starter Plan",
  },
  {
    label: "Most Popular",
    name: "Growth",
    price: "$997",
    period: "/mo",
    teaser: "7 posts / week · 3 platforms",
    description: "For brands serious about growing across multiple platforms.",
    features: [
      "7 posts per week",
      "3 platforms (IG · FB · LinkedIn)",
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
    label: "Agency",
    name: "Agency",
    price: "Custom",
    period: "",
    teaser: "Unlimited · All platforms",
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
  },
];

function PricingCard({ plan, position }: { plan: Plan; position: number }) {
  const [flipped, setFlipped] = useState(false);
  const [hovered, setHovered] = useState(false);

  // Stacked 3D: middle card forward, side cards behind and tilted inward
  const isLeft = position === 0;
  const isRight = position === 2;
  const isMiddle = position === 1;
  const tiltDeg = isLeft ? 14 : isRight ? -14 : 0;
  const behindZ = isMiddle ? 60 : -40;
  const scaleRest = isMiddle ? 1.05 : 0.9;
  const shiftX = isLeft ? 40 : isRight ? -40 : 0;
  const restTransform = `translateX(${shiftX}px) translateZ(${behindZ}px) rotateY(${tiltDeg}deg) scale(${scaleRest})`;
  const hoverTransform = `translateX(0) translateZ(${isMiddle ? 80 : 30}px) rotateY(0deg) scale(${isMiddle ? 1.1 : 1.02})`;
  const zIndex = isMiddle ? 3 : 1;

  const frontBg = plan.popular
    ? "linear-gradient(145deg, #1a0f3a 0%, #2a1566 55%, #3b1f8a 100%)"
    : "linear-gradient(145deg, #0d0d1a 0%, #141428 60%, #1a1a34 100%)";
  const backBg = plan.popular
    ? "linear-gradient(145deg, #0f2656 0%, #1a3c8a 60%, #2448b8 100%)"
    : "linear-gradient(145deg, #0f0f1a 0%, #1a1a2e 60%, #212139 100%)";

  return (
    <div
      className="pricing-scene"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: "100%",
        maxWidth: "300px",
        transformStyle: "preserve-3d",
        transform: hovered ? hoverTransform : restTransform,
        transition: "transform 0.6s cubic-bezier(0.4, 0.2, 0.2, 1)",
        zIndex,
        position: "relative",
      }}
    >
      <div
        className={`pricing-card-wrap ${flipped ? "flipped" : ""}`}
        style={{ width: "100%", height: "410px", cursor: "pointer", perspective: "1200px" }}
        onClick={() => setFlipped((f) => !f)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setFlipped((f) => !f);
          }
        }}
      >
        <div
          className="pricing-card-inner"
          style={{
            width: "100%",
            height: "100%",
            position: "relative",
            transformStyle: "preserve-3d",
            transition: "transform 0.8s cubic-bezier(0.4, 0.2, 0.2, 1)",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0)",
          }}
        >
          {/* FRONT */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "22px",
              padding: "24px 22px 20px",
              background: frontBg,
              border: plan.popular ? "1px solid rgba(139,92,255,0.45)" : "1px solid rgba(255,255,255,0.08)",
              boxShadow: plan.popular
                ? "0 30px 80px rgba(0,0,0,0.5), 0 0 40px rgba(139,92,255,0.18), inset 0 0 0 1px rgba(192,132,252,0.15)"
                : "0 30px 80px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.04)",
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {plan.popular && (
              <div
                style={{
                  position: "absolute",
                  top: "-12px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "linear-gradient(90deg, #8b5cff, #3b81ff)",
                  color: "white",
                  fontSize: "10px",
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  padding: "5px 14px",
                  borderRadius: "999px",
                  whiteSpace: "nowrap",
                  boxShadow: "0 6px 16px rgba(139,92,255,0.4)",
                }}
              >
                Most Popular
              </div>
            )}

            {/* Category tag */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "10px",
                fontWeight: 600,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "rgba(192,132,252,0.9)",
                marginBottom: "14px",
              }}
            >
              <span style={{ width: "20px", height: "1px", background: "rgba(192,132,252,0.6)" }} />
              {plan.label}
            </div>

            {/* Title */}
            <div
              style={{
                fontSize: "24px",
                fontWeight: 700,
                color: "#fff",
                letterSpacing: "-0.02em",
                marginBottom: "10px",
              }}
            >
              {plan.name}
            </div>

            {/* Price */}
            <div style={{ display: "flex", alignItems: "baseline", gap: "3px", marginBottom: "4px" }}>
              {plan.price.startsWith("$") ? (
                <>
                  <span style={{ fontSize: "15px", fontWeight: 500, color: "rgba(192,132,252,0.95)" }}>$</span>
                  <span style={{ fontSize: "36px", fontWeight: 300, color: "#fff", lineHeight: 1 }}>
                    {plan.price.slice(1)}
                  </span>
                </>
              ) : (
                <span style={{ fontSize: "30px", fontWeight: 400, color: "#fff", lineHeight: 1 }}>{plan.price}</span>
              )}
              {plan.period && (
                <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", fontWeight: 300 }}>{plan.period}</span>
              )}
            </div>
            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", letterSpacing: "0.03em", marginBottom: "16px" }}>
              billed monthly · cancel anytime
            </div>

            {/* Divider */}
            <div
              style={{
                width: "34px",
                height: "1px",
                background: "linear-gradient(90deg, rgba(192,132,252,0.6), transparent)",
                marginBottom: "16px",
              }}
            />

            {/* Teaser */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "12px",
                color: "rgba(255,255,255,0.7)",
                marginBottom: "14px",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(192,132,252,0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {plan.teaser}
            </div>

            <div style={{ flex: 1 }} />

            {/* Choose prompt */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "10px",
                fontWeight: 600,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "rgba(192,132,252,0.95)",
                borderBottom: "1px solid rgba(192,132,252,0.25)",
                paddingBottom: "8px",
                marginBottom: "14px",
                width: "fit-content",
              }}
            >
              See Full Details
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>

            {/* Visual accent */}
            <div
              style={{
                borderRadius: "12px",
                overflow: "hidden",
                height: "72px",
                position: "relative",
                background: "linear-gradient(180deg, rgba(139,92,255,0.22) 0%, rgba(59,129,255,0.12) 50%, rgba(0,0,0,0.2) 100%)",
                border: "1px solid rgba(255,255,255,0.04)",
              }}
            >
              {/* Animated dot pattern */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage: "radial-gradient(circle at 1px 1px, rgba(192,132,252,0.25) 1px, transparent 0)",
                  backgroundSize: "14px 14px",
                  maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
                  WebkitMaskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
                }}
              />
              {/* Floating glow */}
              <div
                className="pricing-card-glow"
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  width: "140px",
                  height: "60px",
                  transform: "translate(-50%, -50%)",
                  background: "radial-gradient(ellipse, rgba(192,132,252,0.5) 0%, rgba(59,129,255,0.18) 50%, transparent 80%)",
                  filter: "blur(20px)",
                  animation: "pricingGlowFloat 4s ease-in-out infinite",
                }}
              />
            </div>
          </div>

          {/* BACK */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "22px",
              padding: "24px 22px 20px",
              background: backBg,
              border: plan.popular ? "1px solid rgba(139,92,255,0.45)" : "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 30px 80px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.04)",
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Back header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: 600,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "rgba(192,132,252,0.9)",
                }}
              >
                What&apos;s Included
              </span>
              <span style={{ fontSize: "18px", fontWeight: 700, color: "white", letterSpacing: "-0.01em" }}>{plan.name}</span>
            </div>

            <div
              style={{
                width: "100%",
                height: "1px",
                background: "linear-gradient(90deg, transparent, rgba(192,132,252,0.3), transparent)",
                marginBottom: "20px",
              }}
            />

            {/* Description */}
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.65)", lineHeight: 1.6, margin: "0 0 18px" }}>
              {plan.description}
            </p>

            {/* Features list */}
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
                    alignItems: "flex-start",
                    gap: "10px",
                    fontSize: "13px",
                    color: "rgba(255,255,255,0.82)",
                    lineHeight: 1.45,
                  }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="url(#pg)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ marginTop: "2px", flexShrink: 0 }}
                  >
                    <defs>
                      <linearGradient id="pg">
                        <stop offset="0%" stopColor="#c084fc" />
                        <stop offset="100%" stopColor="#3b81ff" />
                      </linearGradient>
                    </defs>
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>

            {/* CTA */}
            <a
              href={plan.href}
              onClick={(e) => e.stopPropagation()}
              style={{
                display: "block",
                textAlign: "center",
                padding: "13px 20px",
                marginTop: "20px",
                borderRadius: "11px",
                fontSize: "14px",
                fontWeight: 600,
                letterSpacing: "0.02em",
                textDecoration: "none",
                background: "linear-gradient(135deg, #8b5cff 0%, #3b81ff 100%)",
                color: "white",
                boxShadow: "0 8px 24px rgba(139,92,255,0.35)",
                cursor: "pointer",
              }}
            >
              {plan.cta}
            </a>

            {/* Back hint */}
            <div
              style={{
                marginTop: "12px",
                fontSize: "10px",
                color: "rgba(255,255,255,0.3)",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                textAlign: "center",
              }}
            >
              ← Click to flip back
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

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
          style={{ gap: "14px", marginBottom: "64px", textAlign: "center" }}
        >
          <span
            style={{
              fontSize: "13px",
              fontWeight: 600,
              letterSpacing: "0.18em",
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
          <p style={{ fontSize: "16px", color: "#8a8a96", maxWidth: "480px", margin: 0 }}>
            Click any card to see full details. No contracts. Cancel anytime.
          </p>
        </div>

        {/* Cards */}
        <div
          className="grid grid-cols-1 md:grid-cols-3 justify-items-center"
          style={{
            gap: "0px",
            alignItems: "center",
            perspective: "1800px",
            perspectiveOrigin: "center center",
          }}
        >
          {plans.map((plan, i) => (
            <PricingCard key={plan.name} plan={plan} position={i} />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes pricingGlowFloat {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.8; }
          50% { transform: translate(-50%, -55%) scale(1.1); opacity: 1; }
        }
      `}</style>
    </section>
  );
}
