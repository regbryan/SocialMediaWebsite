"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type IconName = "grid" | "layers" | "play" | "briefcase";

const Icon = ({ name }: { name: IconName }) => {
  const common = {
    width: 20,
    height: 20,
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
};

const services: Service[] = [
  {
    icon: "grid",
    title: "Feed Posts",
    tagline: "Stop the scroll",
    description:
      "Branded static posts & stories that feel consistent but never boring. Custom templates, captions, hashtag strategy.",
    image: "/portfolio/blitz-signature.png",
    stat: { value: "5–7", label: "posts / week" },
    tint: "rgba(192,132,252,0.35)",
  },
  {
    icon: "layers",
    title: "Carousels",
    tagline: "Teach, don't sell",
    description:
      "Swipeable educational carousels that drive saves, shares, and follows. Value-packed slides your audience actually reads.",
    image: "/portfolio/carousel-5things.png",
    stat: { value: "3x", label: "save rate" },
    tint: "rgba(255,158,109,0.35)",
  },
  {
    icon: "play",
    title: "Reels & Shorts",
    tagline: "Built for reach",
    description:
      "Trend-aware short video with scripting, editing, and posting handled end-to-end. We chase the trend so you don't have to.",
    image: "/portfolio/reel-pantry.png",
    stat: { value: "10M+", label: "views driven" },
    tint: "rgba(236,72,153,0.35)",
  },
  {
    icon: "briefcase",
    title: "LinkedIn",
    tagline: "Authority at scale",
    description:
      "Thought-leadership posts that build trust and drive inbound. Turn expertise into a pipeline of dream clients.",
    image: "/portfolio/doug-founder.png",
    stat: { value: "4x", label: "inbound leads" },
    tint: "rgba(59,129,255,0.35)",
  },
  {
    icon: "grid",
    title: "Static Campaigns",
    tagline: "Launch windows that hit",
    description:
      "Cohesive visual campaigns for product drops, seasonal promos, and brand moments. Multi-post arcs that build momentum.",
    image: "/portfolio/riverside-drop.png",
    stat: { value: "100%", label: "on-brand" },
    tint: "rgba(102,217,239,0.35)",
  },
];

export default function Services() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

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

  const scrollBy = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector(".svc-card") as HTMLElement | null;
    const step = card ? card.offsetWidth + 20 : 340;
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
        style={{ maxWidth: "1280px", gap: "40px", padding: "0 clamp(24px, 6vw, 120px)" }}
      >
        <div className="flex flex-col md:flex-row md:items-end md:justify-between" style={{ gap: "24px" }}>
          <div className="flex flex-col" style={{ gap: "12px" }}>
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
                fontSize: "clamp(32px, 4vw, 48px)",
                fontWeight: 700,
                color: "white",
                lineHeight: 1.05,
                letterSpacing: "-0.03em",
                margin: 0,
                maxWidth: "600px",
              }}
            >
              Scroll through the work
            </h2>
          </div>

          <div className="hidden md:flex items-center" style={{ gap: "10px" }}>
            <ScrollBtn dir="left" disabled={!canPrev} onClick={() => scrollBy(-1)} />
            <ScrollBtn dir="right" disabled={!canNext} onClick={() => scrollBy(1)} />
          </div>
        </div>
      </div>

      {/* Scroll reel */}
      <div
        style={{
          position: "relative",
          marginTop: "32px",
        }}
      >
        {/* Edge fades */}
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            width: "60px",
            background: "linear-gradient(to right, #090912, transparent)",
            pointerEvents: "none",
            zIndex: 3,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            right: 0,
            width: "60px",
            background: "linear-gradient(to left, #090912, transparent)",
            pointerEvents: "none",
            zIndex: 3,
          }}
        />

        <div
          ref={scrollerRef}
          className="svc-scroller"
          style={{
            display: "flex",
            gap: "20px",
            overflowX: "auto",
            overflowY: "hidden",
            scrollSnapType: "x mandatory",
            scrollPaddingLeft: "clamp(24px, 6vw, 120px)",
            scrollPaddingRight: "clamp(24px, 6vw, 120px)",
            padding: "8px clamp(24px, 6vw, 120px) 24px",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {services.map((s, i) => (
            <article
              key={s.title + i}
              className="svc-card"
              style={{
                flex: "0 0 auto",
                width: "clamp(280px, 80vw, 340px)",
                height: "460px",
                scrollSnapAlign: "start",
                borderRadius: "22px",
                overflow: "hidden",
                position: "relative",
                background: "#0f0f1a",
                border: "1px solid rgba(255,255,255,0.06)",
                cursor: "pointer",
                transition: "transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.3s",
                willChange: "transform",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-6px)";
                e.currentTarget.style.borderColor = "rgba(192,132,252,0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
              }}
            >
              {/* Background image */}
              <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
                <Image
                  src={s.image}
                  alt={s.title}
                  fill
                  sizes="340px"
                  style={{ objectFit: "cover" }}
                />
              </div>

              {/* Tint overlay */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: `radial-gradient(ellipse at 20% 20%, ${s.tint} 0%, transparent 55%)`,
                  zIndex: 1,
                  mixBlendMode: "screen",
                }}
              />

              {/* Bottom dark gradient for legibility */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.3) 40%, rgba(9,9,18,0.95) 82%, #090912 100%)",
                  zIndex: 2,
                }}
              />

              {/* Top chip */}
              <div
                style={{
                  position: "absolute",
                  top: "16px",
                  left: "16px",
                  right: "16px",
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
                    background: "rgba(10,10,18,0.65)",
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
                    color: "rgba(255,255,255,0.7)",
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
                    color: "rgba(220,220,232,0.8)",
                    margin: 0,
                  }}
                >
                  {s.description}
                </p>
                <div className="flex items-center" style={{ gap: "10px", marginTop: "6px" }}>
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
      </div>

      {/* Mobile scroll buttons */}
      <div
        className="md:hidden flex items-center justify-center"
        style={{ gap: "10px", marginTop: "16px" }}
      >
        <ScrollBtn dir="left" disabled={!canPrev} onClick={() => scrollBy(-1)} />
        <ScrollBtn dir="right" disabled={!canNext} onClick={() => scrollBy(1)} />
      </div>

      <style>{`
        .svc-scroller::-webkit-scrollbar { display: none; }
        .svc-scroller { scrollbar-width: none; }
      `}</style>
    </section>
  );
}

function ScrollBtn({
  dir,
  onClick,
  disabled,
}: {
  dir: "left" | "right";
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={dir === "left" ? "Scroll left" : "Scroll right"}
      style={{
        width: "42px",
        height: "42px",
        borderRadius: "999px",
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.1)",
        color: disabled ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.85)",
        cursor: disabled ? "default" : "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.2s",
        opacity: disabled ? 0.4 : 1,
      }}
      onMouseEnter={(e) => {
        if (disabled) return;
        e.currentTarget.style.background = "rgba(139,92,255,0.15)";
        e.currentTarget.style.borderColor = "rgba(139,92,255,0.4)";
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
