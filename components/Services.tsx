"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type IconName = "grid" | "layers" | "play" | "briefcase" | "target" | "mail" | "chat" | "spark";

const Icon = ({ name, size = 20 }: { name: IconName; size?: number }) => {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "url(#svc-grad)",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  return (
    <svg {...common}>
      <defs>
        <linearGradient id="svc-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#c084fc" />
          <stop offset="100%" stopColor="#3b81ff" />
        </linearGradient>
      </defs>
      {name === "grid" && (
        <>
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </>
      )}
      {name === "layers" && (
        <>
          <path d="M12 2 2 7l10 5 10-5-10-5Z" />
          <path d="m2 17 10 5 10-5" />
          <path d="m2 12 10 5 10-5" />
        </>
      )}
      {name === "play" && (
        <>
          <rect x="3" y="5" width="18" height="14" rx="2.5" />
          <path d="M10 9l5 3-5 3V9Z" fill="url(#svc-grad)" />
        </>
      )}
      {name === "briefcase" && (
        <>
          <rect x="2" y="7" width="20" height="14" rx="2" />
          <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          <path d="M2 13h20" />
        </>
      )}
      {name === "target" && (
        <>
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="5" />
          <circle cx="12" cy="12" r="1.5" fill="url(#svc-grad)" />
        </>
      )}
      {name === "mail" && (
        <>
          <rect x="2.5" y="5" width="19" height="14" rx="2" />
          <path d="m3 7 9 6 9-6" />
        </>
      )}
      {name === "chat" && (
        <>
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </>
      )}
      {name === "spark" && (
        <>
          <path d="M12 3v3M12 18v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M3 12h3M18 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
          <circle cx="12" cy="12" r="3" />
        </>
      )}
    </svg>
  );
};

type Service = {
  icon: IconName;
  title: string;
  tagline: string;
  description: string;
  image: string;
  stat: { value: string; label: string };
  tint: string;
  features: string[];
  cta: string;
};

const services: Service[] = [
  {
    icon: "grid",
    title: "Feed Posts",
    tagline: "Stop the scroll",
    description:
      "Branded static posts and stories that feel consistent but never boring. Custom templates, captions, hashtag strategy.",
    image: "/portfolio/blitz-signature.png",
    stat: { value: "5–7", label: "posts / week" },
    tint: "rgba(192,132,252,0.28)",
    features: [
      "Custom branded templates",
      "5–7 posts per week",
      "Caption writing & hashtag strategy",
      "Stories & highlight covers",
      "Monthly performance report",
    ],
    cta: "Book Feed Posts",
  },
  {
    icon: "layers",
    title: "Carousels",
    tagline: "Teach, don't sell",
    description:
      "Swipeable educational decks that drive saves, shares, and follows.",
    image: "/portfolio/carousel-5things.png",
    stat: { value: "3x", label: "save rate" },
    tint: "rgba(255,158,109,0.28)",
    features: [
      "Educational, save-worthy content",
      "7–10 slides per deck",
      "Brand-consistent design system",
      "Hook + CTA optimization",
      "Engagement-focused structure",
    ],
    cta: "Book Carousels",
  },
  {
    icon: "play",
    title: "Reels & Shorts",
    tagline: "Built for reach",
    description:
      "Trend-aware short video with scripting, editing, and posting handled end-to-end.",
    image: "/portfolio/reel-pantry.png",
    stat: { value: "10M+", label: "views driven" },
    tint: "rgba(236,72,153,0.28)",
    features: [
      "Trend monitoring & matching",
      "Full scripting & storyboarding",
      "Professional editing & sound design",
      "Cross-platform export (IG · TT · YT)",
      "Posting cadence optimization",
    ],
    cta: "Book Reels",
  },
  {
    icon: "briefcase",
    title: "LinkedIn",
    tagline: "Authority at scale",
    description:
      "Thought-leadership posts that build trust and drive inbound opportunities.",
    image: "/portfolio/doug-founder.png",
    stat: { value: "4x", label: "inbound leads" },
    tint: "rgba(59,129,255,0.28)",
    features: [
      "Founder-voice ghostwriting",
      "Industry thought-leadership angles",
      "Carousel & document posts",
      "Network growth strategy",
      "Inbound opportunity tracking",
    ],
    cta: "Book LinkedIn",
  },
  {
    icon: "grid",
    title: "Static Campaigns",
    tagline: "Launch windows",
    description:
      "Cohesive visual campaigns for product drops, seasonal promos, and brand moments.",
    image: "/portfolio/riverside-drop.png",
    stat: { value: "100%", label: "on-brand" },
    tint: "rgba(102,217,239,0.28)",
    features: [
      "Launch arc planning (pre / drop / post)",
      "Cohesive visual system",
      "Story sequence & countdown assets",
      "Paid-ready creative variants",
      "Performance tracking per campaign",
    ],
    cta: "Book a Campaign",
  },
  {
    icon: "target",
    title: "Paid Social Ads",
    tagline: "Scale what works",
    description:
      "Meta, TikTok, and LinkedIn ads with organic-feel creative, tight targeting, and weekly optimization.",
    image: "/portfolio/omega-tax.png",
    stat: { value: "2.8×", label: "ROAS average" },
    tint: "rgba(255,107,107,0.28)",
    features: [
      "Meta, TikTok & LinkedIn campaigns",
      "Organic-style creative variants",
      "Audience + lookalike targeting",
      "Weekly budget optimization",
      "Transparent ROAS reporting",
    ],
    cta: "Book Paid Ads",
  },
  {
    icon: "mail",
    title: "Email & SMS",
    tagline: "Own your audience",
    description:
      "Flows, broadcasts, and lifecycle automations that turn followers into repeat buyers.",
    image: "/portfolio/omega-credit.png",
    stat: { value: "38%", label: "open rate" },
    tint: "rgba(251,191,36,0.28)",
    features: [
      "Welcome, browse, cart, post-purchase flows",
      "Weekly broadcast calendar",
      "Segmented list strategy",
      "SMS + email integration",
      "Revenue-per-email tracking",
    ],
    cta: "Book Email / SMS",
  },
  {
    icon: "chat",
    title: "Community",
    tagline: "Stay responsive",
    description:
      "Comment and DM management that keeps your audience engaged while you focus on the product.",
    image: "/portfolio/scboardwalk-ride.png",
    stat: { value: "< 1h", label: "response time" },
    tint: "rgba(167,243,208,0.28)",
    features: [
      "Comment + DM response daily",
      "Brand-voice training",
      "Lead handoff workflow",
      "Sentiment weekly digest",
      "Flag-&-escalate on crises",
    ],
    cta: "Book Community",
  },
  {
    icon: "spark",
    title: "Strategy",
    tagline: "Built on data",
    description:
      "Positioning, content pillars, and a 90-day roadmap so every post actually ladders to a goal.",
    image: "/portfolio/iec-summer.png",
    stat: { value: "90", label: "day plans" },
    tint: "rgba(139,92,255,0.32)",
    features: [
      "Audience & voice deep-dive",
      "Content pillar framework",
      "Competitive audit",
      "90-day rolling roadmap",
      "Monthly performance review",
    ],
    cta: "Book Strategy",
  },
];

// Flared tunnel: center cards are SMALL and RECESSED, edges are LARGE and FORWARD.
function arcRotation(
  delta: number,
  maxDelta: number,
  hoveredIdx: number | null,
  activeIdx: number | null,
  myIdx: number
): string {
  // Active card flies forward out of the arc
  if (activeIdx === myIdx) {
    return "translateZ(340px) rotateY(0deg) scale(1.55)";
  }
  // Hover peeks forward (only when nothing is active)
  if (activeIdx === null && hoveredIdx === myIdx) {
    return "rotateY(0deg) translateZ(220px) scale(1.25)";
  }
  const absD = Math.abs(delta);
  const progress = maxDelta > 0 ? absD / maxDelta : 0;

  const step = 16;
  const rotY = -delta * step;
  const scale = 0.62 + progress * 0.55;
  const z = -140 + progress * 200;

  return `translateZ(${z}px) rotateY(${rotY}deg) scale(${scale})`;
}

function NavButton({ dir, onClick }: { dir: "left" | "right"; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label={dir === "left" ? "Previous" : "Next"}
      style={{
        width: "48px",
        height: "48px",
        borderRadius: "999px",
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.12)",
        color: "rgba(255,255,255,0.9)",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.2s",
        flexShrink: 0,
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        position: "relative",
        zIndex: 200,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(139,92,255,0.2)";
        e.currentTarget.style.borderColor = "rgba(139,92,255,0.5)";
        e.currentTarget.style.transform = "scale(1.05)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "rgba(255,255,255,0.04)";
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
        e.currentTarget.style.transform = "scale(1)";
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {dir === "left" ? <polyline points="15 18 9 12 15 6" /> : <polyline points="9 18 15 12 9 6" />}
      </svg>
    </button>
  );
}

export default function Services() {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  const n = services.length;
  const center = (n - 1) / 2;

  // ESC clears active card
  useEffect(() => {
    if (activeIdx === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveIdx(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeIdx]);

  return (
    <section
      id="services"
      style={{
        backgroundColor: "#090912",
        padding: "110px 0",
        overflow: "hidden",
      }}
    >
      <div
        className="mx-auto flex flex-col"
        style={{ maxWidth: "1280px", gap: "48px", padding: "0 clamp(24px, 6vw, 120px)" }}
      >
        <div className="flex flex-col items-center text-center" style={{ gap: "12px" }}>
          <span
            style={{
              color: "#8b5cff",
              fontSize: "13px",
              fontWeight: 600,
              letterSpacing: "3px",
              textTransform: "uppercase",
            }}
          >
            What We Do
          </span>
          <h2
            style={{
              fontSize: "clamp(32px, 4vw, 44px)",
              fontWeight: 700,
              color: "white",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              margin: 0,
            }}
          >
            Services Built for Growth
          </h2>
        </div>
      </div>

      {/* Fixed-arc tunnel — all cards visible, each rotated toward center */}
      <div
        onClick={() => setActiveIdx(null)}
        style={{
          margin: "56px auto 0",
          padding: "0 clamp(16px, 3vw, 40px)",
          perspective: "1100px",
          perspectiveOrigin: "50% 50%",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 0,
            transformStyle: "preserve-3d",
            minHeight: "460px",
          }}
        >
          {services.map((s, i) => {
            const delta = i - center;
            const transform = arcRotation(delta, center, hoveredIdx, activeIdx, i);
            const isActive = activeIdx === i;
            const isDimmed = activeIdx !== null && !isActive;
            return (
              <article
                key={s.title}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveIdx((prev) => (prev === i ? null : i));
                }}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
                style={{
                  flex: "0 0 auto",
                  width: "145px",
                  height: "310px",
                  marginLeft: i === 0 ? 0 : "-30px",
                  transform,
                  transformOrigin: "center center",
                  transition:
                    "transform 0.55s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.35s ease, filter 0.35s ease",
                  cursor: "pointer",
                  borderRadius: "18px",
                  overflow: "hidden",
                  background: "#0f0f1a",
                  border: isActive
                    ? "1px solid rgba(192,132,252,0.45)"
                    : "1px solid rgba(255,255,255,0.06)",
                  boxShadow: isActive
                    ? "0 40px 100px rgba(0,0,0,0.8), 0 0 0 1px rgba(192,132,252,0.25), 0 0 60px rgba(139,92,255,0.3)"
                    : "0 24px 60px rgba(0,0,0,0.5)",
                  opacity: isDimmed ? 0.28 : 1,
                  filter: isDimmed ? "blur(1px)" : "none",
                  willChange: "transform, opacity",
                  position: "relative",
                  zIndex: isActive ? 200 : 100 - Math.abs(delta),
                }}
              >
                  {/* Background image */}
                  <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
                    <Image src={s.image} alt={s.title} fill sizes="340px" style={{ objectFit: "cover" }} priority={i < 3} />
                  </div>

                  {/* Tint */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: `radial-gradient(ellipse at 25% 20%, ${s.tint} 0%, transparent 55%)`,
                      zIndex: 1,
                      mixBlendMode: "screen",
                    }}
                  />

                  {/* Bottom scrim */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "linear-gradient(180deg, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.3) 35%, rgba(9,9,18,0.93) 80%, #090912 100%)",
                      zIndex: 2,
                    }}
                  />

                  {/* Bottom content */}
                  <div
                    style={{
                      position: "absolute",
                      left: "22px",
                      right: "22px",
                      bottom: "22px",
                      zIndex: 4,
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                    }}
                  >
                    <h3
                      style={{
                        fontSize: "18px",
                        fontWeight: 700,
                        color: "white",
                        lineHeight: 1.15,
                        letterSpacing: "-0.02em",
                        margin: 0,
                      }}
                    >
                      {s.title}
                    </h3>
                    <p
                      style={{
                        fontSize: "11px",
                        lineHeight: 1.45,
                        color: "rgba(220,220,232,0.82)",
                        margin: 0,
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical" as const,
                        overflow: "hidden",
                      }}
                    >
                      {s.description}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "4px" }}>
                      <span
                        style={{
                          fontSize: "20px",
                          fontWeight: 700,
                          background: "linear-gradient(135deg, #c084fc, #3b81ff)",
                          WebkitBackgroundClip: "text",
                          backgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          letterSpacing: "-0.01em",
                        }}
                      >
                        {s.stat.value}
                      </span>
                      <span
                        style={{
                          fontSize: "11px",
                          color: "rgba(255,255,255,0.55)",
                          letterSpacing: "0.05em",
                          textTransform: "uppercase",
                        }}
                      >
                        {s.stat.label}
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
        </div>
      </div>

      {/* Inline details panel — slides in below the arc when a card is active */}
      <div
        style={{
          maxWidth: "680px",
          margin: "0 auto",
          padding: "0 clamp(24px, 5vw, 40px)",
          overflow: "hidden",
          maxHeight: activeIdx !== null ? "600px" : "0px",
          opacity: activeIdx !== null ? 1 : 0,
          transition: "max-height 0.6s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.45s ease",
        }}
      >
        {activeIdx !== null && (
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "rgba(15,15,26,0.72)",
              border: "1px solid rgba(192,132,252,0.25)",
              borderRadius: "20px",
              padding: "28px 32px",
              marginTop: "32px",
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
              boxShadow: "0 24px 70px rgba(0,0,0,0.55), 0 0 40px rgba(139,92,255,0.12)",
              display: "flex",
              flexDirection: "column",
              gap: "18px",
              animation: "svc-fade-up 0.5s cubic-bezier(0.22, 1, 0.36, 1) both",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "12px",
                  background: "rgba(10,10,18,0.6)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon name={services[activeIdx].icon} size={22} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3
                  style={{
                    fontSize: "22px",
                    fontWeight: 700,
                    color: "white",
                    margin: 0,
                    letterSpacing: "-0.02em",
                    lineHeight: 1.2,
                  }}
                >
                  {services[activeIdx].title}
                </h3>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "rgba(192,132,252,0.95)",
                  }}
                >
                  {services[activeIdx].tagline}
                </span>
              </div>
              <button
                aria-label="Close"
                onClick={() => setActiveIdx(null)}
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "999px",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "rgba(255,255,255,0.75)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <p style={{ fontSize: "14px", lineHeight: 1.6, color: "rgba(220,220,232,0.88)", margin: 0 }}>
              {services[activeIdx].description}
            </p>

            <ul style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "8px 16px", listStyle: "none", padding: 0, margin: 0 }}>
              {services[activeIdx].features.map((f) => (
                <li
                  key={f}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "8px",
                    fontSize: "13px",
                    color: "rgba(230,230,240,0.92)",
                    lineHeight: 1.45,
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="url(#svc-grad)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: "3px", flexShrink: 0 }}>
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>

            <div style={{ display: "flex", alignItems: "center", gap: "16px", justifyContent: "space-between", flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                <span
                  style={{
                    fontSize: "26px",
                    fontWeight: 700,
                    background: "linear-gradient(135deg, #c084fc, #3b81ff)",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {services[activeIdx].stat.value}
                </span>
                <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  {services[activeIdx].stat.label}
                </span>
              </div>
              <a
                href={`mailto:hello@socialpulse.media?subject=${encodeURIComponent(services[activeIdx].cta)}`}
                onClick={(e) => e.stopPropagation()}
                style={{
                  padding: "11px 20px",
                  borderRadius: "10px",
                  fontSize: "13px",
                  fontWeight: 600,
                  letterSpacing: "0.02em",
                  textDecoration: "none",
                  background: "linear-gradient(135deg, #8b5cff 0%, #3b81ff 100%)",
                  color: "white",
                  boxShadow: "0 8px 24px rgba(139,92,255,0.35)",
                }}
              >
                {services[activeIdx].cta} →
              </a>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes svc-fade-up {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}
