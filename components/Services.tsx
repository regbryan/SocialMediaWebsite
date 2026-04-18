"use client";

import Image from "next/image";
import { useState } from "react";

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
};

const services: Service[] = [
  {
    icon: "grid",
    title: "Feed Posts",
    tagline: "Stop the scroll",
    description: "Branded posts & stories that feel consistent but never boring.",
    image: "/portfolio/blitz-signature.png",
    stat: { value: "5–7", label: "posts / week" },
    tint: "rgba(192,132,252,0.28)",
  },
  {
    icon: "layers",
    title: "Carousels",
    tagline: "Teach, don't sell",
    description: "Swipeable educational decks that drive saves and shares.",
    image: "/portfolio/carousel-5things.png",
    stat: { value: "3x", label: "save rate" },
    tint: "rgba(255,158,109,0.28)",
  },
  {
    icon: "play",
    title: "Reels & Shorts",
    tagline: "Built for reach",
    description: "Trend-aware short video — scripting, editing, posting, all handled.",
    image: "/portfolio/reel-pantry.png",
    stat: { value: "10M+", label: "views driven" },
    tint: "rgba(236,72,153,0.28)",
  },
  {
    icon: "briefcase",
    title: "LinkedIn",
    tagline: "Authority at scale",
    description: "Thought-leadership posts that build trust and drive inbound.",
    image: "/portfolio/doug-founder.png",
    stat: { value: "4x", label: "inbound leads" },
    tint: "rgba(59,129,255,0.28)",
  },
  {
    icon: "grid",
    title: "Static Campaigns",
    tagline: "Launch windows",
    description: "Cohesive visual arcs for product drops and brand moments.",
    image: "/portfolio/riverside-drop.png",
    stat: { value: "100%", label: "on-brand" },
    tint: "rgba(102,217,239,0.28)",
  },
];

// Stacked offsets for each card at its stack position (0 = top)
const stackedTransforms = [
  "translate(0, 0) rotate(0deg)",
  "translate(14px, 10px) rotate(4deg)",
  "translate(-14px, 18px) rotate(-5deg)",
  "translate(20px, 26px) rotate(6deg)",
  "translate(-18px, 32px) rotate(-6deg)",
];

// Fanned-out positions when hovered
const fannedTransforms = [
  "translate(-340px, 30px) rotate(-14deg)",
  "translate(-170px, -10px) rotate(-7deg)",
  "translate(0, -20px) rotate(0deg)",
  "translate(170px, -10px) rotate(7deg)",
  "translate(340px, 30px) rotate(14deg)",
];

export default function Services() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const cycleNext = () => {
    setActiveIdx((i) => (i + 1) % services.length);
  };

  return (
    <section
      id="services"
      style={{
        backgroundColor: "#090912",
        padding: "110px clamp(24px, 6vw, 120px)",
        overflow: "hidden",
      }}
    >
      <div className="mx-auto flex flex-col" style={{ maxWidth: "1280px", gap: "56px" }}>
        <div className="flex flex-col items-center text-center" style={{ gap: "14px" }}>
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
            }}
          >
            The full content deck
          </h2>
          <p style={{ color: "#8a8a96", fontSize: "16px", maxWidth: "480px", margin: 0 }}>
            Hover to fan the deck. Click the top card to cycle through.
          </p>
        </div>

        {/* Stack container */}
        <div
          className="stack-wrap"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => {
            setHovered(false);
            setHoveredCard(null);
          }}
          style={{
            position: "relative",
            width: "100%",
            height: "520px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            perspective: "1600px",
          }}
        >
          {services.map((s, i) => {
            // Calculate stack position relative to activeIdx
            const stackPos = (i - activeIdx + services.length) % services.length;
            const isTop = stackPos === 0;

            let transform: string;
            if (hovered) {
              // Fan out based on absolute position in array for stable animation
              transform = fannedTransforms[stackPos] || stackedTransforms[stackPos];
            } else {
              transform = stackedTransforms[stackPos] || stackedTransforms[stackedTransforms.length - 1];
            }

            const isHoveredIndividually = hovered && hoveredCard === i;
            if (isHoveredIndividually) {
              transform += " translateY(-12px) scale(1.03)";
            }

            return (
              <article
                key={s.title}
                onClick={(e) => {
                  if (hovered) {
                    // When fanned, clicking any card makes it the new top
                    setActiveIdx(i);
                  } else if (isTop) {
                    cycleNext();
                  }
                  e.stopPropagation();
                }}
                onMouseEnter={() => setHoveredCard(i)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{
                  position: "absolute",
                  width: "320px",
                  height: "440px",
                  borderRadius: "22px",
                  overflow: "hidden",
                  transform,
                  transformStyle: "preserve-3d",
                  transition: "transform 0.7s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.3s",
                  zIndex: 100 - stackPos,
                  cursor: "pointer",
                  background: "#0f0f1a",
                  border: "1px solid rgba(255,255,255,0.08)",
                  boxShadow: isTop
                    ? "0 40px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(192,132,252,0.15)"
                    : "0 30px 60px rgba(0,0,0,0.6)",
                  willChange: "transform",
                }}
              >
                {/* Background image */}
                <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
                  <Image
                    src={s.image}
                    alt={s.title}
                    fill
                    sizes="320px"
                    style={{ objectFit: "cover" }}
                    priority={i < 3}
                  />
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

                {/* Top row */}
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
            );
          })}
        </div>

        {/* Progress dots */}
        <div className="flex items-center justify-center" style={{ gap: "10px" }}>
          {services.map((_, i) => {
            const active = i === activeIdx;
            return (
              <button
                key={i}
                onClick={() => setActiveIdx(i)}
                aria-label={`Show ${services[i].title}`}
                style={{
                  width: active ? "28px" : "8px",
                  height: "8px",
                  borderRadius: "999px",
                  border: "none",
                  background: active ? "linear-gradient(90deg, #8b5cff, #3b81ff)" : "rgba(255,255,255,0.15)",
                  cursor: "pointer",
                  transition: "width 0.35s cubic-bezier(0.22, 1, 0.36, 1), background 0.35s",
                  padding: 0,
                }}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
