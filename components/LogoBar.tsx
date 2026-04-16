"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

const logos = [
  { src: "/logos/blitz.png", alt: "Blitz Organization" },
  { src: "/logos/iec.png", alt: "Inland Empire Comfort" },
  { src: "/logos/omega.png", alt: "Omega Mortgage Group" },
  { src: "/logos/doug.png", alt: "Doug Mitchell, Esq." },
  { src: "/logos/boardwalk.png", alt: "SC Boardwalk Crew" },
  { src: "/logos/csc.png", alt: "Cyber Safety Cop" },
];

// Triple so there's plenty of content across the full scroll range
const loopedLogos = [...logos, ...logos, ...logos];

export default function LogoBar() {
  const stripRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!stripRef.current) return;
      // 0.4px of strip travel per 1px of page scroll
      const offset = window.scrollY * 0.4;
      stripRef.current.style.transform = `translateX(-${offset}px)`;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // set initial position
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section
      style={{
        backgroundColor: "#07070e",
        padding: "60px 0",
        borderTop: "1px solid #1a1a2e",
        borderBottom: "1px solid #1a1a2e",
        overflow: "hidden",
      }}
    >
      <div
        className="mx-auto flex flex-col items-center"
        style={{ maxWidth: "1280px", gap: "36px" }}
      >
        <span
          style={{
            color: "#9999a6",
            fontSize: "13px",
            fontWeight: 600,
            letterSpacing: "3px",
            textTransform: "uppercase",
            textAlign: "center",
            padding: "0 clamp(24px, 6vw, 120px)",
          }}
        >
          Trusted by growing brands
        </span>
      </div>

      {/* Scroll-driven strip — full bleed */}
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          marginTop: "36px",
        }}
      >
        {/* Fade edges */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to right, #07070e 0%, transparent 12%, transparent 88%, #07070e 100%)",
            zIndex: 2,
            pointerEvents: "none",
          }}
        />

        <div
          ref={stripRef}
          style={{
            display: "flex",
            gap: "80px",
            width: "max-content",
            alignItems: "center",
            willChange: "transform",
          }}
        >
          {loopedLogos.map((logo, i) => (
            <div
              key={`${logo.alt}-${i}`}
              style={{ height: "60px", flexShrink: 0 }}
            >
              <div style={{ position: "relative", width: "160px", height: "60px" }}>
                <Image
                  src={logo.src}
                  alt={logo.alt}
                  fill
                  sizes="160px"
                  style={{ objectFit: "contain" }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
