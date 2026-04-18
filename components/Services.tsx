"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type IconName = "grid" | "layers" | "play" | "briefcase";

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
];

// Fixed-arc tunnel: all cards visible in a row, each rotated toward the center
// so the whole row reads as the inside of a curved wall facing the viewer.
// Delta is the signed distance from the middle of the array.
function arcRotation(delta: number, hoveredIdx: number | null, myIdx: number): string {
  // Base tilt per step. 5 cards → extremes sit at ±2 * 22 = 44deg
  const step = 22;
  const base = -delta * step;
  // If user hovers a card, flatten it and gently unroll the rest
  if (hoveredIdx === myIdx) {
    return "rotateY(0deg) translateZ(60px) scale(1.05)";
  }
  return `rotateY(${base}deg)`;
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
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  const n = services.length;
  const center = (n - 1) / 2;

  // Modal ESC close
  useEffect(() => {
    if (expandedIdx === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setExpandedIdx(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [expandedIdx]);

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
            gap: "4px",
            transformStyle: "preserve-3d",
            minHeight: "460px",
          }}
        >
          {services.map((s, i) => {
            const delta = i - center;
            const transform = arcRotation(delta, hoveredIdx, i);
            return (
              <article
                key={s.title}
                onClick={() => setExpandedIdx(i)}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
                style={{
                  flex: "0 0 auto",
                  width: "200px",
                  height: "360px",
                  transform,
                  transformOrigin: "center center",
                  transition: "transform 0.55s cubic-bezier(0.22, 1, 0.36, 1)",
                  cursor: "pointer",
                  borderRadius: "18px",
                  overflow: "hidden",
                  background: "#0f0f1a",
                  border: "1px solid rgba(255,255,255,0.06)",
                  boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
                  willChange: "transform",
                  position: "relative",
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

                  {/* Top chips */}
                  <div
                    style={{
                      position: "absolute",
                      top: "14px",
                      left: "14px",
                      right: "14px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      zIndex: 4,
                    }}
                  >
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "10px",
                        background: "rgba(10,10,18,0.6)",
                        backdropFilter: "blur(10px)",
                        WebkitBackdropFilter: "blur(10px)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Icon name={s.icon} />
                    </div>
                    <span
                      style={{
                        fontSize: "10px",
                        fontWeight: 600,
                        letterSpacing: "0.15em",
                        textTransform: "uppercase",
                        color: "rgba(255,255,255,0.75)",
                        background: "rgba(10,10,18,0.55)",
                        backdropFilter: "blur(10px)",
                        WebkitBackdropFilter: "blur(10px)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        padding: "6px 10px",
                        borderRadius: "999px",
                      }}
                    >
                      {s.tagline}
                    </span>
                  </div>

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
                        fontSize: "26px",
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
                        fontSize: "13px",
                        lineHeight: 1.55,
                        color: "rgba(220,220,232,0.82)",
                        margin: 0,
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

      {/* Detail modal (reused) */}
      {expandedIdx !== null && (
        <div
          onClick={() => setExpandedIdx(null)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            cursor: "zoom-out",
            background: "rgba(5,5,12,0.88)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              width: "min(460px, 100%)",
              maxHeight: "min(90vh, 720px)",
              background: "#0f0f1a",
              borderRadius: "22px",
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 30px 80px rgba(0,0,0,0.7)",
              cursor: "default",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {(() => {
              const s = services[expandedIdx];
              return (
                <>
                  <div style={{ position: "relative", width: "100%", height: "240px", flexShrink: 0 }}>
                    <Image src={s.image} alt={s.title} fill sizes="460px" style={{ objectFit: "cover" }} priority />
                    <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 25% 20%, ${s.tint} 0%, transparent 55%)`, mixBlendMode: "screen" }} />
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 0%, rgba(15,15,26,0.9) 100%)" }} />
                    <button
                      aria-label="Close"
                      onClick={() => setExpandedIdx(null)}
                      style={{
                        position: "absolute",
                        top: "14px",
                        right: "14px",
                        width: "32px",
                        height: "32px",
                        borderRadius: "999px",
                        background: "rgba(10,10,18,0.7)",
                        border: "1px solid rgba(255,255,255,0.12)",
                        color: "white",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                    <div style={{ position: "absolute", bottom: "18px", left: "20px", right: "20px", display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ width: "42px", height: "42px", borderRadius: "11px", background: "rgba(10,10,18,0.6)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Icon name={s.icon} size={22} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: "22px", fontWeight: 700, color: "white", margin: 0, letterSpacing: "-0.02em" }}>{s.title}</h3>
                        <span style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(192,132,252,0.95)" }}>{s.tagline}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ padding: "22px 24px 24px", overflow: "auto", display: "flex", flexDirection: "column", gap: "16px" }}>
                    <p style={{ fontSize: "14px", lineHeight: 1.6, color: "rgba(220,220,232,0.88)", margin: 0 }}>{s.description}</p>
                    <ul style={{ display: "flex", flexDirection: "column", gap: "8px", listStyle: "none", padding: 0, margin: 0 }}>
                      {s.features.map((f) => (
                        <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "13px", color: "rgba(230,230,240,0.9)", lineHeight: 1.5 }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="url(#svc-grad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: "3px", flexShrink: 0 }}>
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          {f}
                        </li>
                      ))}
                    </ul>
                    <a
                      href={`mailto:hello@socialpulse.media?subject=${encodeURIComponent(s.cta)}`}
                      style={{
                        display: "block",
                        textAlign: "center",
                        padding: "13px 20px",
                        marginTop: "6px",
                        borderRadius: "11px",
                        fontSize: "14px",
                        fontWeight: 600,
                        letterSpacing: "0.02em",
                        textDecoration: "none",
                        background: "linear-gradient(135deg, #8b5cff 0%, #3b81ff 100%)",
                        color: "white",
                        boxShadow: "0 8px 24px rgba(139,92,255,0.35)",
                      }}
                    >
                      {s.cta}
                    </a>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </section>
  );
}
