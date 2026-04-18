"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

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
      "Swipeable educational decks that drive saves, shares, and follows. Value-packed slides your audience actually reads.",
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

function NavButton({ dir, onClick, disabled }: { dir: "left" | "right"; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={dir === "left" ? "Previous" : "Next"}
      style={{
        width: "46px",
        height: "46px",
        borderRadius: "999px",
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.1)",
        color: disabled ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.85)",
        cursor: disabled ? "default" : "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.2s",
        flexShrink: 0,
        opacity: disabled ? 0.4 : 1,
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
      onMouseEnter={(e) => {
        if (disabled) return;
        e.currentTarget.style.background = "rgba(139,92,255,0.18)";
        e.currentTarget.style.borderColor = "rgba(139,92,255,0.45)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "rgba(255,255,255,0.04)";
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {dir === "left" ? <polyline points="15 18 9 12 15 6" /> : <polyline points="9 18 15 12 9 6" />}
      </svg>
    </button>
  );
}

export default function Services() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  const updateArrows = () => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    updateArrows();
    el.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
  }, []);

  useEffect(() => {
    if (expandedIdx === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setExpandedIdx(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [expandedIdx]);

  const scrollStep = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector(".svc-card") as HTMLElement | null;
    const step = card ? card.offsetWidth + 20 : 320;
    el.scrollBy({ left: step * dir, behavior: "smooth" });
  };

  return (
    <section
      id="services"
      style={{
        backgroundColor: "#090912",
        padding: "100px 0",
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

      {/* Carousel with side arrows */}
      <div
        className="flex items-center"
        style={{
          gap: "16px",
          maxWidth: "1440px",
          margin: "48px auto 0",
          padding: "0 clamp(12px, 3vw, 40px)",
          position: "relative",
        }}
      >
        <NavButton dir="left" onClick={() => scrollStep(-1)} disabled={!canPrev} />

        <div
          ref={scrollerRef}
          className="svc-scroller"
          style={{
            flex: 1,
            display: "flex",
            gap: "20px",
            overflowX: "auto",
            overflowY: "hidden",
            scrollSnapType: "x mandatory",
            scrollPaddingLeft: "8px",
            padding: "10px 8px 20px",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {services.map((s, i) => (
            <article
              key={s.title}
              className="svc-card"
              onClick={() => setExpandedIdx(i)}
              style={{
                flex: "0 0 auto",
                width: "clamp(280px, 30vw, 340px)",
                height: "440px",
                scrollSnapAlign: "start",
                borderRadius: "20px",
                overflow: "hidden",
                position: "relative",
                background: "#0f0f1a",
                border: "1px solid rgba(255,255,255,0.06)",
                cursor: "pointer",
                transition: "transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.3s, box-shadow 0.3s",
                willChange: "transform",
                boxShadow: "0 14px 40px rgba(0,0,0,0.4)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-6px)";
                e.currentTarget.style.borderColor = "rgba(192,132,252,0.3)";
                e.currentTarget.style.boxShadow = "0 20px 55px rgba(0,0,0,0.55)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                e.currentTarget.style.boxShadow = "0 14px 40px rgba(0,0,0,0.4)";
              }}
            >
              {/* Background image */}
              <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
                <Image src={s.image} alt={s.title} fill sizes="340px" style={{ objectFit: "cover" }} priority={i < 2} />
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
                    "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.3) 35%, rgba(9,9,18,0.92) 80%, #090912 100%)",
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
                  className="flex items-center justify-center"
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    background: "rgba(10,10,18,0.6)",
                    backdropFilter: "blur(10px)",
                    WebkitBackdropFilter: "blur(10px)",
                    border: "1px solid rgba(255,255,255,0.1)",
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
                    fontSize: "24px",
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
                <div className="flex items-center" style={{ gap: "10px", marginTop: "4px" }}>
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
          ))}
        </div>

        <NavButton dir="right" onClick={() => scrollStep(1)} disabled={!canNext} />
      </div>

      <style>{`
        .svc-scroller::-webkit-scrollbar { display: none; }
        .svc-scroller { scrollbar-width: none; }
      `}</style>

      {/* Expanded detail modal */}
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
                        backdropFilter: "blur(8px)",
                        WebkitBackdropFilter: "blur(8px)",
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                    <div style={{ position: "absolute", bottom: "18px", left: "20px", right: "20px", display: "flex", alignItems: "center", gap: "12px" }}>
                      <div
                        style={{
                          width: "42px",
                          height: "42px",
                          borderRadius: "11px",
                          background: "rgba(10,10,18,0.6)",
                          backdropFilter: "blur(10px)",
                          WebkitBackdropFilter: "blur(10px)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Icon name={s.icon} size={22} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: "22px", fontWeight: 700, color: "white", margin: 0, letterSpacing: "-0.02em" }}>{s.title}</h3>
                        <span style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(192,132,252,0.95)" }}>{s.tagline}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ padding: "22px 24px 24px", overflow: "auto", display: "flex", flexDirection: "column", gap: "16px" }}>
                    <p style={{ fontSize: "14px", lineHeight: 1.6, color: "rgba(220,220,232,0.88)", margin: 0 }}>
                      {s.description}
                    </p>

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

                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "4px" }}>
                      <span
                        style={{
                          fontSize: "24px",
                          fontWeight: 700,
                          background: "linear-gradient(135deg, #c084fc, #3b81ff)",
                          WebkitBackgroundClip: "text",
                          backgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          letterSpacing: "-0.02em",
                        }}
                      >
                        {s.stat.value}
                      </span>
                      <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.55)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                        {s.stat.label}
                      </span>
                    </div>

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
