"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const logos = [
  { src: "/logos/blitz.png", alt: "Blitz Organization" },
  { src: "/logos/iec.png", alt: "Inland Empire Comfort" },
  { src: "/logos/omega.png", alt: "Omega Mortgage Group" },
  { src: "/logos/doug.png", alt: "Doug Mitchell, Esq." },
  { src: "/logos/boardwalk.png", alt: "SC Boardwalk Crew" },
  { src: "/logos/csc.png", alt: "Cyber Safety Cop" },
];

// Duplicate once for seamless CSS loop
const loopedLogos = [...logos, ...logos];

export default function LogoBar() {
  // "forward" = scrolling left (default when page scrolls down or idle)
  // "reverse" = scrolling right (when page scrolls up)
  const [direction, setDirection] = useState<"forward" | "reverse">("forward");
  const lastYRef = useRef(0);

  useEffect(() => {
    lastYRef.current = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - lastYRef.current;
      // Ignore tiny deltas so the direction doesn't flap on micro-movements
      if (Math.abs(delta) > 2) {
        setDirection(delta > 0 ? "forward" : "reverse");
      }
      lastYRef.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
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

      {/* Auto-scrolling strip — reverses direction with page scroll direction */}
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
          className="logo-strip"
          style={{
            display: "flex",
            gap: "80px",
            width: "max-content",
            alignItems: "center",
            animation: "logoMarquee 32s linear infinite",
            animationDirection: direction === "forward" ? "normal" : "reverse",
            willChange: "transform",
          }}
        >
          {loopedLogos.map((logo, i) => (
            <div key={`${logo.alt}-${i}`} style={{ height: "60px", flexShrink: 0 }}>
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

      <style>{`
        @keyframes logoMarquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}
