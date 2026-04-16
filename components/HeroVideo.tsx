"use client";

export default function HeroVideo() {
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
      }}
    >
      {/* Glow behind video */}
      <div
        style={{
          position: "absolute",
          width: "520px",
          height: "420px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(139,92,255,0.35) 0%, rgba(59,129,255,0.18) 40%, transparent 70%)",
          filter: "blur(60px)",
          pointerEvents: "none",
          animation: "pulseGlow 4s ease-in-out infinite",
          zIndex: 1,
        }}
      />

      {/* Video — no phone frame */}
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "520px",
          borderRadius: "20px",
          overflow: "hidden",
          boxShadow:
            "0 30px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(139,92,255,0.15)",
          animation: "videoFloat 6s ease-in-out infinite",
          zIndex: 3,
        }}
      >
        <video
          autoPlay
          muted
          loop
          playsInline
          style={{
            display: "block",
            width: "100%",
            height: "auto",
          }}
        >
          <source src="/hero-video.mp4" type="video/mp4" />
        </video>

        {/* Subtle edge vignette */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "20px",
            boxShadow: "inset 0 0 40px rgba(0,0,0,0.3)",
            pointerEvents: "none",
            zIndex: 2,
          }}
        />
      </div>

      <style>{`
        @keyframes videoFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.08); }
        }
      `}</style>
    </div>
  );
}
