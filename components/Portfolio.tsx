"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";

type Item = {
  title: string;
  subtitle: string;
  image: string;
};

const portfolioItems: Item[] = [
  {
    title: "M&A Readiness",
    subtitle: "3 Questions Every Founder Should Answer Before Considering a Sale",
    image: "/portfolio/doug-posts/v2_post_01_founder_questions.png",
  },
  {
    title: "Deal Terms",
    subtitle: "The Most Overlooked Clause in Every LOI",
    image: "/portfolio/doug-posts/v2_post_02_overlooked_clause.png",
  },
  {
    title: "Legal Strategy",
    subtitle: "The Cheapest Hour You'll Ever Spend on a Lawyer",
    image: "/portfolio/doug-posts/v2_post_03_cheapest_hour.png",
  },
  {
    title: "Entity Structure",
    subtitle: "LLC vs S-Corp vs C-Corp — The Truth Most Founders Don't Hear",
    image: "/portfolio/doug-posts/v2_post_04_entity_structure.png",
  },
  {
    title: "Deal Stories",
    subtitle: "The Deal That Almost Died at Closing",
    image: "/portfolio/doug-posts/v2_post_05_deal_almost_died.png",
  },
  {
    title: "Buyer Diligence",
    subtitle: "What Buyer Reps Really Mean When They Say That",
    image: "/portfolio/doug-posts/v2_post_06_buyer_reps.png",
  },
  {
    title: "Deal Structure",
    subtitle: "How Earnouts Actually Work (And When They Backfire)",
    image: "/portfolio/doug-posts/v2_post_07_earnouts.png",
  },
  {
    title: "Personal",
    subtitle: "Why I Left BigLaw to Do This",
    image: "/portfolio/doug-posts/v2_post_08_left_biglaw.png",
  },
  {
    title: "Deal Structure",
    subtitle: "Asset Sale vs Stock Sale — The Simple Framework",
    image: "/portfolio/doug-posts/v2_post_09_asset_vs_stock.png",
  },
  {
    title: "Founder Ops",
    subtitle: "Fix This Before the End of the Quarter",
    image: "/portfolio/doug-posts/v2_post_10_fix_this_quarter.png",
  },
  {
    title: "Risk",
    subtitle: "The True Cost of a Handshake Deal",
    image: "/portfolio/doug-posts/v2_post_11_handshake_cost.png",
  },
  {
    title: "Contract Law",
    subtitle: "'Reasonable Efforts' — The Phrase That Sinks Deals",
    image: "/portfolio/doug-posts/v2_post_12_reasonable_efforts.png",
  },
  {
    title: "Milestone",
    subtitle: "100 Deals In — Here's What I'd Tell Past Me",
    image: "/portfolio/doug-posts/v2_post_13_100_deals.png",
  },
  {
    title: "Due Diligence",
    subtitle: "The Diligence Gaps That Kill Valuations",
    image: "/portfolio/doug-posts/v2_post_14_diligence_gaps.png",
  },
  {
    title: "Retention",
    subtitle: "How Founder Retention Really Gets Negotiated",
    image: "/portfolio/doug-posts/v2_post_15_founder_retention.png",
  },
  {
    title: "Due Diligence",
    subtitle: "Controlling Diligence Sprawl Before It Costs You",
    image: "/portfolio/doug-posts/v2_post_16_diligence_sprawl.png",
  },
  {
    title: "Strategy",
    subtitle: "Building a Deal Thesis That Actually Closes",
    image: "/portfolio/doug-posts/v2_post_17_deal_thesis.png",
  },
];

function lightboxNavStyle(side: "left" | "right"): CSSProperties {
  return {
    position: "absolute",
    top: "50%",
    [side]: "-56px",
    transform: "translateY(-50%)",
    width: "44px",
    height: "44px",
    borderRadius: "999px",
    background: "rgba(15,15,26,0.85)",
    border: "1px solid #1a1a2e",
    color: "white",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };
}

export default function Portfolio() {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const looped = [...portfolioItems, ...portfolioItems];
  const lightbox = lightboxIdx === null ? null : portfolioItems[lightboxIdx];

  const next = () => setLightboxIdx((i) => (i === null ? null : (i + 1) % portfolioItems.length));
  const prev = () =>
    setLightboxIdx((i) =>
      i === null ? null : (i - 1 + portfolioItems.length) % portfolioItems.length
    );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxIdx(null);
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
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
          padding: "72px 0",
          overflow: "hidden",
        }}
      >
        <div className="mx-auto flex flex-col" style={{ maxWidth: "1280px", gap: "36px" }}>
          <div
            className="flex flex-col items-center text-center"
            style={{ gap: "14px", padding: "0 clamp(24px, 6vw, 120px)" }}
          >
            <span className="eyebrow">Our Work</span>
            <h2
              className="display-heading"
              style={{ fontSize: "clamp(48px, 7vw, 88px)" }}
            >
              Posts we shipped this quarter.
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
              Real client work. Tap any post to see it bigger.
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
              gap: "16px",
              width: "max-content",
              animation: `marquee ${portfolioItems.length * 8}s linear infinite`,
            }}
          >
            {looped.map((item, idx) => (
              <div
                key={`${item.image}-${idx}`}
                className="portfolio-card"
                onClick={() => setLightboxIdx(idx % portfolioItems.length)}
                style={{
                  flex: "0 0 auto",
                  width: "clamp(320px, 32vw, 420px)",
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

                {/* Caption — post title only */}
                <div style={{ padding: "14px 18px 16px" }}>
                  <span
                    style={{
                      color: "white",
                      fontSize: "13px",
                      fontWeight: 600,
                      letterSpacing: "-0.01em",
                      display: "block",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {item.title}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
      {lightbox && (
        <motion.div
          key="lightbox-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          onClick={() => setLightboxIdx(null)}
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
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8, filter: "blur(6px)" }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.98, y: 4, filter: "blur(4px)" }}
            transition={{ type: "spring", duration: 0.4, bounce: 0 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              maxWidth: "min(1100px, 100%)",
              width: "100%",
              cursor: "default",
            }}
          >
            <button
              onClick={() => setLightboxIdx(null)}
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

            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              aria-label="Previous"
              className="lightbox-nav lightbox-nav--prev"
              style={lightboxNavStyle("left")}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              aria-label="Next"
              className="lightbox-nav lightbox-nav--next"
              style={lightboxNavStyle("right")}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
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
              <div style={{ padding: "20px 24px" }}>
                <span style={{ color: "white", fontSize: "16px", fontWeight: 600, display: "block" }}>
                  {lightbox.title}
                </span>
                <span style={{ color: "#9999a6", fontSize: "13px", marginTop: "4px", display: "block" }}>
                  {lightbox.subtitle}
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
    </>
  );
}

