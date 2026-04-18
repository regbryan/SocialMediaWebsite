"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

type Item = {
  title: string;
  subtitle: string;
  image: string;
  likes: number;
  comments: number;
};

const portfolioItems: Item[] = [
  {
    title: "M&A Readiness",
    subtitle: "3 Questions Every Founder Should Answer Before Considering a Sale",
    image: "/portfolio/doug-posts/v2_post_01_founder_questions.png",
    likes: 428,
    comments: 37,
  },
  {
    title: "Deal Terms",
    subtitle: "The Most Overlooked Clause in Every LOI",
    image: "/portfolio/doug-posts/v2_post_02_overlooked_clause.png",
    likes: 612,
    comments: 54,
  },
  {
    title: "Legal Strategy",
    subtitle: "The Cheapest Hour You'll Ever Spend on a Lawyer",
    image: "/portfolio/doug-posts/v2_post_03_cheapest_hour.png",
    likes: 384,
    comments: 29,
  },
  {
    title: "Entity Structure",
    subtitle: "LLC vs S-Corp vs C-Corp — The Truth Most Founders Don't Hear",
    image: "/portfolio/doug-posts/v2_post_04_entity_structure.png",
    likes: 1243,
    comments: 89,
  },
  {
    title: "Deal Stories",
    subtitle: "The Deal That Almost Died at Closing",
    image: "/portfolio/doug-posts/v2_post_05_deal_almost_died.png",
    likes: 891,
    comments: 72,
  },
  {
    title: "Buyer Diligence",
    subtitle: "What Buyer Reps Really Mean When They Say That",
    image: "/portfolio/doug-posts/v2_post_06_buyer_reps.png",
    likes: 467,
    comments: 41,
  },
  {
    title: "Deal Structure",
    subtitle: "How Earnouts Actually Work (And When They Backfire)",
    image: "/portfolio/doug-posts/v2_post_07_earnouts.png",
    likes: 723,
    comments: 58,
  },
  {
    title: "Personal",
    subtitle: "Why I Left BigLaw to Do This",
    image: "/portfolio/doug-posts/v2_post_08_left_biglaw.png",
    likes: 1508,
    comments: 134,
  },
  {
    title: "Deal Structure",
    subtitle: "Asset Sale vs Stock Sale — The Simple Framework",
    image: "/portfolio/doug-posts/v2_post_09_asset_vs_stock.png",
    likes: 387,
    comments: 42,
  },
  {
    title: "Founder Ops",
    subtitle: "Fix This Before the End of the Quarter",
    image: "/portfolio/doug-posts/v2_post_10_fix_this_quarter.png",
    likes: 298,
    comments: 24,
  },
  {
    title: "Risk",
    subtitle: "The True Cost of a Handshake Deal",
    image: "/portfolio/doug-posts/v2_post_11_handshake_cost.png",
    likes: 512,
    comments: 47,
  },
  {
    title: "Contract Law",
    subtitle: "'Reasonable Efforts' — The Phrase That Sinks Deals",
    image: "/portfolio/doug-posts/v2_post_12_reasonable_efforts.png",
    likes: 654,
    comments: 51,
  },
  {
    title: "Milestone",
    subtitle: "100 Deals In — Here's What I'd Tell Past Me",
    image: "/portfolio/doug-posts/v2_post_13_100_deals.png",
    likes: 2104,
    comments: 178,
  },
  {
    title: "Due Diligence",
    subtitle: "The Diligence Gaps That Kill Valuations",
    image: "/portfolio/doug-posts/v2_post_14_diligence_gaps.png",
    likes: 442,
    comments: 36,
  },
  {
    title: "Retention",
    subtitle: "How Founder Retention Really Gets Negotiated",
    image: "/portfolio/doug-posts/v2_post_15_founder_retention.png",
    likes: 378,
    comments: 31,
  },
  {
    title: "Due Diligence",
    subtitle: "Controlling Diligence Sprawl Before It Costs You",
    image: "/portfolio/doug-posts/v2_post_16_diligence_sprawl.png",
    likes: 289,
    comments: 22,
  },
  {
    title: "Strategy",
    subtitle: "Building a Deal Thesis That Actually Closes",
    image: "/portfolio/doug-posts/v2_post_17_deal_thesis.png",
    likes: 456,
    comments: 39,
  },
];

function formatCount(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return `${n}`;
}

export default function Portfolio() {
  const [lightbox, setLightbox] = useState<Item | null>(null);
  const looped = [...portfolioItems, ...portfolioItems];

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
    };
    if (lightbox) {
      document.addEventListener("keydown", handler);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [lightbox]);

  return (
    <>
      <section
        id="portfolio"
        style={{
          backgroundColor: "#07070e",
          padding: "100px 0",
          overflow: "hidden",
        }}
      >
        <div className="mx-auto flex flex-col" style={{ maxWidth: "1280px", gap: "56px" }}>
          <div
            className="flex flex-col items-center text-center"
            style={{ gap: "14px", padding: "0 clamp(24px, 6vw, 120px)" }}
          >
            <span
              style={{
                color: "#8b5cff",
                fontSize: "13px",
                fontWeight: 600,
                letterSpacing: "3px",
                textTransform: "uppercase",
              }}
            >
              Our Work
            </span>
            <h2
              style={{
                fontSize: "clamp(32px, 4.5vw, 48px)",
                fontWeight: 700,
                color: "white",
                lineHeight: 1.05,
                letterSpacing: "-0.03em",
                margin: 0,
              }}
            >
              Content That <span className="gradient-text">Converts</span>
            </h2>
            <p
              style={{
                color: "#9999a6",
                fontSize: "17px",
                lineHeight: 1.5,
                margin: 0,
                maxWidth: "520px",
              }}
            >
              LinkedIn thought-leadership that turns expertise into inbound.
            </p>
          </div>
        </div>

        {/* Marquee */}
        <div
          className="marquee-wrapper"
          style={{
            position: "relative",
            overflow: "hidden",
            marginTop: "56px",
            padding: "12px 0",
          }}
        >
          <div
            className="marquee-track"
            style={{
              display: "flex",
              gap: "24px",
              width: "max-content",
              animation: `marquee ${portfolioItems.length * 8}s linear infinite`,
            }}
          >
            {looped.map((item, idx) => (
              <div
                key={`${item.image}-${idx}`}
                className="portfolio-card"
                onClick={() => setLightbox(item)}
                style={{
                  flex: "0 0 auto",
                  width: "clamp(420px, 46vw, 560px)",
                  borderRadius: "18px",
                  overflow: "hidden",
                  cursor: "pointer",
                  position: "relative",
                  background: "#0f0f1a",
                  border: "1px solid rgba(255,255,255,0.06)",
                  boxShadow: "0 14px 40px rgba(0,0,0,0.4)",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 20px 50px rgba(0,0,0,0.55)";
                  e.currentTarget.style.borderColor = "rgba(139,92,255,0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 14px 40px rgba(0,0,0,0.4)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                }}
              >
                {/* The landscape image */}
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    aspectRatio: "1376 / 768",
                    background: "#07070e",
                  }}
                >
                  <Image
                    src={item.image}
                    alt={item.subtitle}
                    fill
                    sizes="560px"
                    style={{ objectFit: "cover", objectPosition: "center" }}
                  />
                </div>

                {/* Metadata row */}
                <div
                  className="flex items-center justify-between"
                  style={{ padding: "14px 18px 16px", gap: "12px" }}
                >
                  <div className="flex flex-col" style={{ minWidth: 0, gap: "2px" }}>
                    <span
                      style={{
                        color: "white",
                        fontSize: "13px",
                        fontWeight: 600,
                        letterSpacing: "-0.01em",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      Doug Mitchell, Esq.
                    </span>
                    <span
                      style={{
                        color: "#9999a6",
                        fontSize: "11px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {item.title}
                    </span>
                  </div>
                  <div
                    className="flex items-center"
                    style={{ gap: "10px", flexShrink: 0, color: "#9999a6", fontSize: "11px" }}
                  >
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="#8b5cff">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      </svg>
                      {formatCount(item.likes)}
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9999a6" strokeWidth="2">
                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                      </svg>
                      {item.comments}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
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
              maxWidth: "min(1100px, 100%)",
              width: "100%",
              cursor: "default",
            }}
          >
            <button
              onClick={() => setLightbox(null)}
              aria-label="Close"
              style={{
                position: "absolute",
                top: "-50px",
                right: 0,
                width: "40px",
                height: "40px",
                borderRadius: "999px",
                background: "rgba(15,15,26,0.85)",
                border: "1px solid #1a1a2e",
                color: "white",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <div
              style={{
                background: "#0f0f1a",
                borderRadius: "18px",
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow: "0 24px 80px rgba(0,0,0,0.8)",
              }}
            >
              <div style={{ position: "relative", width: "100%", aspectRatio: "1376 / 768" }}>
                <Image
                  src={lightbox.image}
                  alt={lightbox.subtitle}
                  fill
                  sizes="1100px"
                  style={{ objectFit: "cover", objectPosition: "center" }}
                  priority
                />
              </div>
              <div
                className="flex items-center justify-between"
                style={{ padding: "20px 24px", gap: "20px" }}
              >
                <div className="flex flex-col" style={{ gap: "4px" }}>
                  <span style={{ color: "white", fontSize: "16px", fontWeight: 600 }}>Doug Mitchell, Esq.</span>
                  <span style={{ color: "#9999a6", fontSize: "13px" }}>{item_label(lightbox)}</span>
                </div>
                <div
                  className="flex items-center"
                  style={{ gap: "18px", color: "#9999a6", fontSize: "13px" }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#8b5cff">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                    {formatCount(lightbox.likes)}
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9999a6" strokeWidth="2">
                      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                    </svg>
                    {lightbox.comments}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function item_label(item: Item) {
  return `${item.title} · ${item.subtitle}`;
}
