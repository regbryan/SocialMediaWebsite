"use client";

import { AbsoluteFill, Img, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

const reels = [
  { src: "/portfolio/reel-closet.png", username: "@blitzyourspace", caption: "Kid's closet reset 🧺" },
  { src: "/portfolio/reel-pantry.png", username: "@blitzyourspace", caption: "Pantry tips that stick ✨" },
  { src: "/portfolio/reel-family.png", username: "@iec.hvac", caption: "Family-owned since '98" },
  { src: "/portfolio/iec-night.png", username: "@iec.hvac", caption: "24/7 emergency service 🔧" },
  { src: "/portfolio/riverside-drop.png", username: "@riversidehatco", caption: "New drop just landed 🤠" },
];

export const HeroComposition = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 6s float cycle
  const floatY = Math.sin((frame / (fps * 6)) * Math.PI * 2) * -12;

  // 4s glow pulse
  const glowOpacity = interpolate(
    Math.sin((frame / (fps * 4)) * Math.PI * 2),
    [-1, 1],
    [0.6, 1]
  );

  // Image carousel: 3.5s per image
  const framesPerImage = Math.round(fps * 3.5);
  const imageIndex = Math.floor(frame / framesPerImage) % reels.length;
  const current = reels[imageIndex];

  return (
    <AbsoluteFill style={{ background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", perspective: 1200 }}>
      {/* Glow */}
      <div style={{
        position: "absolute",
        width: 420, height: 420,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(139,92,255,0.35) 0%, rgba(59,129,255,0.18) 40%, transparent 70%)",
        filter: "blur(50px)",
        opacity: glowOpacity,
      }} />

      {/* Phone */}
      <div style={{
        position: "relative",
        width: 280, height: 560,
        borderRadius: 48,
        background: "linear-gradient(145deg, #1a1a2e 0%, #0a0a14 100%)",
        padding: 10,
        boxShadow: "0 40px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(139,92,255,0.2), inset 0 0 0 2px rgba(255,255,255,0.05)",
        transform: `rotate(-4deg) rotateY(6deg) translateY(${floatY}px)`,
      }}>
        {/* Side buttons */}
        <div style={{ position: "absolute", left: -2, top: 120, width: 2, height: 60, background: "#1a1a2e", borderRadius: 2 }} />
        <div style={{ position: "absolute", left: -2, top: 200, width: 2, height: 40, background: "#1a1a2e", borderRadius: 2 }} />
        <div style={{ position: "absolute", right: -2, top: 150, width: 2, height: 80, background: "#1a1a2e", borderRadius: 2 }} />

        {/* Screen */}
        <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 38, overflow: "hidden", background: "#000" }}>
          {/* Reel images */}
          {reels.map((reel, i) => {
            const frameInCycle = frame % framesPerImage;
            const opacity = i === imageIndex
              ? interpolate(frameInCycle, [0, fps * 0.5], [0, 1], { extrapolateRight: "clamp" })
              : 0;
            return (
              <div key={reel.src} style={{ position: "absolute", inset: 0, opacity }}>
                <Img src={reel.src} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            );
          })}

          {/* Dynamic Island */}
          <div style={{ position: "absolute", top: 12, left: "50%", transform: "translateX(-50%)", width: 88, height: 26, borderRadius: 999, background: "#000", zIndex: 5 }} />

          {/* Reels label */}
          <div style={{ position: "absolute", top: 46, left: 16, right: 16, display: "flex", alignItems: "center", justifyContent: "space-between", zIndex: 4 }}>
            <span style={{ color: "white", fontSize: 15, fontWeight: 700, textShadow: "0 1px 4px rgba(0,0,0,0.8)" }}>Reels</span>
          </div>

          {/* Heart pulse */}
          <div style={{ position: "absolute", right: 14, bottom: 100, display: "flex", flexDirection: "column", gap: 20, alignItems: "center", zIndex: 4 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <svg
                width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2}
                style={{ transform: `scale(${interpolate(frame % (fps * 1.8), [0, fps * 0.9, fps * 1.8], [1, 1.15, 1])})` }}
              >
                <path d="M12 21s-7-4.5-9.5-9.5C.5 7 3.5 3 7 3c2 0 3.5 1 5 2.5C13.5 4 15 3 17 3c3.5 0 6.5 4 4.5 8.5C19 16.5 12 21 12 21z" />
              </svg>
              <span style={{ color: "white", fontSize: 11, fontWeight: 600, textShadow: "0 1px 4px rgba(0,0,0,0.8)" }}>12.4K</span>
            </div>
          </div>

          {/* Caption */}
          <div style={{ position: "absolute", bottom: 20, left: 16, right: 70, zIndex: 4 }}>
            <div style={{ color: "white", fontSize: 13, fontWeight: 700, textShadow: "0 1px 6px rgba(0,0,0,0.8)", marginBottom: 4 }}>{current.username}</div>
            <div style={{ color: "white", fontSize: 12, lineHeight: 1.4, textShadow: "0 1px 6px rgba(0,0,0,0.8)", opacity: 0.95 }}>{current.caption}</div>
          </div>

          {/* Gradients */}
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 140, background: "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.7) 100%)", zIndex: 3 }} />
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 110, background: "linear-gradient(180deg, rgba(0,0,0,0.5) 0%, transparent 100%)", zIndex: 3 }} />
        </div>
      </div>
    </AbsoluteFill>
  );
};
