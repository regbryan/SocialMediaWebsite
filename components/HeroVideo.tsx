"use client";

import dynamic from "next/dynamic";
import { HeroComposition } from "./HeroComposition";

const Player = dynamic(() => import("@remotion/player").then((m) => m.Player), { ssr: false });

const BG = "#07070e";

export default function HeroVideo() {
  return (
    <div style={{ position: "relative", width: "100%", display: "flex", alignItems: "flex-start", justifyContent: "center" }}>
      {/* Remotion Player — pure React, no video autoplay issues */}
      <Player
        component={HeroComposition}
        durationInFrames={180}
        compositionWidth={520}
        compositionHeight={620}
        fps={30}
        style={{ width: "100%", maxWidth: "520px", background: "#07070e" }}
        autoPlay
        loop
        controls={false}
        clickToPlay={false}
      />

      {/* Edge fades */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 10 }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "22%", background: `linear-gradient(to bottom, ${BG}, transparent)` }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "22%", background: `linear-gradient(to top, ${BG}, transparent)` }} />
        <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: "18%", background: `linear-gradient(to right, ${BG}, transparent)` }} />
        <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: "18%", background: `linear-gradient(to left, ${BG}, transparent)` }} />
      </div>
    </div>
  );
}
