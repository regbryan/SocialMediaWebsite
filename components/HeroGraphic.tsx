"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const reels = [
  { src: "/portfolio/reel-closet.png", username: "@blitzyourspace", caption: "Kid's closet reset 🧺" },
  { src: "/portfolio/reel-pantry.png", username: "@blitzyourspace", caption: "Pantry tips that stick ✨" },
  { src: "/portfolio/reel-family.png", username: "@iec.hvac", caption: "Family-owned since '98" },
  { src: "/portfolio/iec-night.png", username: "@iec.hvac", caption: "24/7 emergency service 🔧" },
  { src: "/portfolio/riverside-drop.png", username: "@riversidehatco", caption: "New drop just landed 🤠" },
];

// 9 thumbnails for the content-wall backdrop (3×3 grid)
const gridThumbs = [
  "/portfolio/iec-summer.png",
  "/portfolio/omega-tax.png",
  "/portfolio/blitz-signature.png",
  "/portfolio/carousel-3bin.png",
  "/portfolio/iec-tuneup.png",
  "/portfolio/riverside-made.png",
  "/portfolio/scboardwalk-ride.png",
  "/portfolio/omega-credit.png",
  "/portfolio/carousel-5things.png",
];

const hearts = [
  { left: "18%", delay: 0, size: 22, duration: 4.2 },
  { left: "35%", delay: 1.1, size: 28, duration: 4.8 },
  { left: "58%", delay: 2.2, size: 18, duration: 3.9 },
  { left: "78%", delay: 0.6, size: 24, duration: 4.4 },
  { left: "25%", delay: 3.0, size: 20, duration: 4.1 },
  { left: "65%", delay: 1.7, size: 26, duration: 4.6 },
  { left: "48%", delay: 2.6, size: 22, duration: 4.3 },
  { left: "88%", delay: 3.4, size: 18, duration: 4.0 },
];

export default function HeroGraphic() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIdx((prev) => (prev + 1) % reels.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const current = reels[idx];

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        minHeight: "600px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        perspective: "1200px",
      }}
    >
      {/* Glow behind phone */}
      <div
        style={{
          position: "absolute",
          width: "420px",
          height: "420px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(139,92,255,0.35) 0%, rgba(59,129,255,0.18) 40%, transparent 70%)",
          filter: "blur(50px)",
          pointerEvents: "none",
          animation: "pulseGlow 4s ease-in-out infinite",
          zIndex: 1,
        }}
      />

      {/* ========== LAYER 2: floating hearts ========== */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          pointerEvents: "none",
          zIndex: 2,
        }}
      >
        {hearts.map((h, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              bottom: "0",
              left: h.left,
              width: `${h.size}px`,
              height: `${h.size}px`,
              animation: `floatHeart ${h.duration}s ease-in-out ${h.delay}s infinite`,
              opacity: 0,
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="#ff3366"
              xmlns="http://www.w3.org/2000/svg"
              style={{
                width: "100%",
                height: "100%",
                filter: "drop-shadow(0 0 12px rgba(255, 51, 102, 0.8))",
              }}
            >
              <path d="M12 21s-7-4.5-9.5-9.5C.5 7 3.5 3 7 3c2 0 3.5 1 5 2.5C13.5 4 15 3 17 3c3.5 0 6.5 4 4.5 8.5C19 16.5 12 21 12 21z" />
            </svg>
          </div>
        ))}
      </div>

      {/* ========== LAYER 3: Phone mockup ========== */}
      <div
        style={{
          position: "relative",
          width: "280px",
          height: "560px",
          borderRadius: "48px",
          background: "linear-gradient(145deg, #1a1a2e 0%, #0a0a14 100%)",
          padding: "10px",
          boxShadow:
            "0 40px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(139,92,255,0.2), inset 0 0 0 2px rgba(255,255,255,0.05)",
          transform: "rotate(-4deg) rotateY(6deg)",
          zIndex: 3,
          animation: "phoneFloat 6s ease-in-out infinite",
        }}
      >
        {/* Side buttons */}
        <div style={{ position: "absolute", left: "-2px", top: "120px", width: "2px", height: "60px", background: "#1a1a2e", borderRadius: "2px" }} />
        <div style={{ position: "absolute", left: "-2px", top: "200px", width: "2px", height: "40px", background: "#1a1a2e", borderRadius: "2px" }} />
        <div style={{ position: "absolute", right: "-2px", top: "150px", width: "2px", height: "80px", background: "#1a1a2e", borderRadius: "2px" }} />

        {/* Screen */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            borderRadius: "38px",
            overflow: "hidden",
            background: "#000",
          }}
        >
          {/* Reel image with crossfade */}
          {reels.map((reel, i) => (
            <div
              key={reel.src}
              style={{
                position: "absolute",
                inset: 0,
                opacity: i === idx ? 1 : 0,
                transition: "opacity 0.8s ease-in-out",
              }}
            >
              <Image
                src={reel.src}
                alt={reel.caption}
                fill
                sizes="280px"
                style={{ objectFit: "cover" }}
                priority={i === 0}
              />
            </div>
          ))}

          {/* Dynamic Island */}
          <div
            style={{
              position: "absolute",
              top: "12px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "88px",
              height: "26px",
              borderRadius: "999px",
              background: "#000",
              zIndex: 5,
            }}
          />

          {/* Top UI */}
          <div
            style={{
              position: "absolute",
              top: "46px",
              left: "16px",
              right: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              zIndex: 4,
            }}
          >
            <span
              style={{
                color: "white",
                fontSize: "15px",
                fontWeight: 700,
                textShadow: "0 1px 4px rgba(0,0,0,0.8)",
              }}
            >
              Reels
            </span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ filter: "drop-shadow(0 1px 4px rgba(0,0,0,0.8))" }}>
              <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12c0 1.6.376 3.112 1.043 4.453L2 22l5.547-1.043A9.953 9.953 0 0 0 12 22z" />
            </svg>
          </div>

          {/* Progress segments */}
          <div
            style={{
              position: "absolute",
              top: "72px",
              left: "16px",
              right: "16px",
              display: "flex",
              gap: "3px",
              zIndex: 4,
            }}
          >
            {reels.map((_, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: "2px",
                  borderRadius: "2px",
                  background: "rgba(255,255,255,0.25)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: i < idx ? "100%" : "0%",
                    height: "100%",
                    background: "white",
                    animation: i === idx ? "progressFill 3.5s linear" : "none",
                  }}
                />
              </div>
            ))}
          </div>

          {/* Right side actions */}
          <div
            style={{
              position: "absolute",
              right: "14px",
              bottom: "100px",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              alignItems: "center",
              zIndex: 4,
            }}
          >
            <div className="flex flex-col items-center" style={{ gap: "4px" }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.5))", animation: "heartPulse 1.8s ease-in-out infinite" }}>
                <path d="M12 21s-7-4.5-9.5-9.5C.5 7 3.5 3 7 3c2 0 3.5 1 5 2.5C13.5 4 15 3 17 3c3.5 0 6.5 4 4.5 8.5C19 16.5 12 21 12 21z" />
              </svg>
              <span style={{ color: "white", fontSize: "11px", fontWeight: 600, textShadow: "0 1px 4px rgba(0,0,0,0.8)" }}>12.4K</span>
            </div>
            <div className="flex flex-col items-center" style={{ gap: "4px" }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.5))" }}>
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <span style={{ color: "white", fontSize: "11px", fontWeight: 600, textShadow: "0 1px 4px rgba(0,0,0,0.8)" }}>318</span>
            </div>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.5))" }}>
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.5))" }}>
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          </div>

          {/* Bottom caption */}
          <div style={{ position: "absolute", bottom: "20px", left: "16px", right: "70px", zIndex: 4 }}>
            <div style={{ color: "white", fontSize: "13px", fontWeight: 700, textShadow: "0 1px 6px rgba(0,0,0,0.8)", marginBottom: "4px" }}>
              {current.username}
            </div>
            <div style={{ color: "white", fontSize: "12px", lineHeight: 1.4, textShadow: "0 1px 6px rgba(0,0,0,0.8)", opacity: 0.95 }}>
              {current.caption}
            </div>
          </div>

          {/* Gradient overlays */}
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "140px", background: "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.7) 100%)", zIndex: 3 }} />
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "110px", background: "linear-gradient(180deg, rgba(0,0,0,0.5) 0%, transparent 100%)", zIndex: 3 }} />
        </div>
      </div>

      <style>{`
        @keyframes thumbFadeIn {
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes floatHeart {
          0% { opacity: 0; transform: translateY(0) scale(0.5); }
          15% { opacity: 1; transform: translateY(-40px) scale(1); }
          85% { opacity: 1; transform: translateY(-340px) scale(1.1) translateX(10px); }
          100% { opacity: 0; transform: translateY(-420px) scale(0.8) translateX(-10px); }
        }
        @keyframes heartPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
        @keyframes phoneFloat {
          0%, 100% { transform: rotate(-4deg) rotateY(6deg) translateY(0); }
          50% { transform: rotate(-4deg) rotateY(6deg) translateY(-12px); }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.08); }
        }
        @keyframes progressFill {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
}
