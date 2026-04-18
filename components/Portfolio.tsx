"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

type Item = {
  title: string;
  tag: string;
  image: string;
  subtitle: string;
};

const portfolioItems: Item[] = [
  { title: "Doug Mitchell, Esq.", tag: "LinkedIn", image: "/portfolio/doug-founder.png", subtitle: "Founder Questions" },
  { title: "Doug Mitchell, Esq.", tag: "LinkedIn", image: "/portfolio/doug-entity.png", subtitle: "Entity Structure Guide" },
  { title: "Doug Mitchell, Esq.", tag: "LinkedIn", image: "/portfolio/doug-biglaw.png", subtitle: "Why I Left BigLaw" },
  { title: "Doug Mitchell, Esq.", tag: "LinkedIn", image: "/portfolio/doug-asset.png", subtitle: "Asset vs Stock Sales" },
];

export default function Portfolio() {
  const [lightbox, setLightbox] = useState<Item | null>(null);

  // Duplicate for seamless infinite loop
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
        <div
          className="mx-auto flex flex-col"
          style={{ maxWidth: "1280px", gap: "56px" }}
        >
          {/* Section header */}
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

        {/* Marquee carousel — full-bleed for edge fade */}
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
              gap: "28px",
              width: "max-content",
              animation: `marquee ${portfolioItems.length * 8}s linear infinite`,
            }}
          >
            {looped.map((item, idx) => {
              return (
                <div
                  key={`${item.title}-${item.subtitle}-${idx}`}
                  className="portfolio-card"
                  onClick={() => setLightbox(item)}
                  style={{
                    flex: "0 0 auto",
                    width: "clamp(360px, 46vw, 560px)",
                    backgroundColor: "#0f0f1a",
                    border: "1px solid #1a1a2e",
                    borderRadius: "22px",
                    overflow: "hidden",
                    cursor: "pointer",
                    position: "relative",
                  }}
                >
                  {/* Framed image */}
                  <div style={{ padding: "14px 14px 0" }}>
                    <div
                      className="silver-frame"
                      style={{
                        position: "relative",
                        width: "100%",
                        aspectRatio: "1.91 / 1",
                        padding: "2px",
                        borderRadius: "14px",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                        background:
                          "linear-gradient(135deg, #ffffff 0%, #c8c8d0 18%, #8a8a94 35%, #f0f0f4 50%, #9a9aa4 65%, #d8d8dc 82%, #ffffff 100%)",
                        backgroundSize: "200% 200%",
                      }}
                    >
                      <div
                        style={{
                          position: "relative",
                          width: "100%",
                          height: "100%",
                          overflow: "hidden",
                          borderRadius: "12px",
                          backgroundColor: "#07070e",
                        }}
                      >
                      <div className="portfolio-img" style={{ position: "absolute", inset: 0 }}>
                        <Image
                          src={item.image}
                          alt={`${item.title} — ${item.subtitle}`}
                          fill
                          sizes="560px"
                          style={{ objectFit: "cover", objectPosition: "top center" }}
                        />
                      </div>

                      {/* Inner shadow overlay */}
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          pointerEvents: "none",
                          boxShadow:
                            "inset 0 0 8px 2px rgba(0,0,0,0.6), inset 0 0 2px rgba(0,0,0,0.8)",
                          borderRadius: "12px",
                          zIndex: 2,
                        }}
                      />

                      {/* Preview overlay */}
                      <div
                        className="preview-overlay"
                        style={{
                          position: "absolute",
                          inset: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background:
                            "linear-gradient(180deg, rgba(7,7,14,0.1) 0%, rgba(7,7,14,0.7) 100%)",
                          zIndex: 3,
                        }}
                      >
                        <button
                          className="preview-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setLightbox(item);
                          }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8" />
                            <path d="m21 21-4.3-4.3" />
                          </svg>
                          Preview
                        </button>
                      </div>
                    </div>
                    </div>
                  </div>

                  {/* Card info */}
                  <div
                    className="flex items-center justify-between"
                    style={{ padding: "16px 20px 20px", gap: "12px" }}
                  >
                    <div className="flex flex-col" style={{ gap: "3px", minWidth: 0 }}>
                      <span
                        style={{
                          color: "white",
                          fontSize: "14px",
                          fontWeight: 600,
                          letterSpacing: "-0.01em",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {item.title}
                      </span>
                      <span
                        style={{
                          color: "#9999a6",
                          fontSize: "12px",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {item.subtitle}
                      </span>
                    </div>
                    <span
                      style={{
                        backgroundColor: "white",
                        color: "#07070e",
                        fontSize: "11px",
                        fontWeight: 600,
                        padding: "4px 10px",
                        borderRadius: "999px",
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                      }}
                    >
                      {item.tag}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="lightbox-backdrop"
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
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              maxWidth: "min(900px, 100%)",
              width: "100%",
              cursor: "default",
            }}
          >
            <button
              onClick={() => setLightbox(null)}
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
                backdropFilter: "blur(12px)",
              }}
              aria-label="Close preview"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <div
              style={{
                padding: "12px",
                backgroundColor: "#0f0f1a",
                borderRadius: "22px",
                border: "1px solid #1a1a2e",
                boxShadow: "0 24px 80px rgba(0,0,0,0.8)",
              }}
            >
              <div
                className="silver-frame"
                style={{
                  position: "relative",
                  aspectRatio: "1.91 / 1",
                  padding: "2px",
                  borderRadius: "14px",
                  background:
                    "linear-gradient(135deg, #ffffff 0%, #c8c8d0 18%, #8a8a94 35%, #f0f0f4 50%, #9a9aa4 65%, #d8d8dc 82%, #ffffff 100%)",
                  backgroundSize: "200% 200%",
                }}
              >
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    height: "100%",
                    borderRadius: "12px",
                    overflow: "hidden",
                  }}
                >
                  <Image
                    src={lightbox.image}
                    alt={`${lightbox.title} — ${lightbox.subtitle}`}
                    fill
                    sizes="900px"
                    style={{ objectFit: "cover", objectPosition: "top center" }}
                    priority
                  />
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      pointerEvents: "none",
                      boxShadow:
                        "inset 0 0 10px 3px rgba(0,0,0,0.6), inset 0 0 2px rgba(0,0,0,0.8)",
                      borderRadius: "12px",
                    }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between" style={{ padding: "16px 8px 4px" }}>
                <div className="flex flex-col" style={{ gap: "4px" }}>
                  <span
                    style={{
                      color: "white",
                      fontSize: "18px",
                      fontWeight: 600,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {lightbox.title}
                  </span>
                  <span style={{ color: "#9999a6", fontSize: "14px" }}>
                    {lightbox.subtitle}
                  </span>
                </div>
                <span
                  style={{
                    backgroundColor: "white",
                    color: "#07070e",
                    fontSize: "12px",
                    fontWeight: 600,
                    padding: "6px 14px",
                    borderRadius: "999px",
                  }}
                >
                  {lightbox.tag}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

    </>
  );
}
