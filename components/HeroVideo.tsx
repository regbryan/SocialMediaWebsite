"use client";

import { useEffect, useRef } from "react";

export default function HeroVideo() {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.muted = true;
    v.play().catch(() => {});
  }, []);

  return (
    <div style={{ position: "relative", width: "100%", display: "flex", alignItems: "flex-start", justifyContent: "center" }}>
      <video
        ref={ref}
        autoPlay
        muted
        loop
        playsInline
        style={{
          display: "block",
          width: "100%",
          height: "auto",
          mixBlendMode: "screen",
        }}
      >
        <source src="/hero-video.mp4" type="video/mp4" />
      </video>
    </div>
  );
}
