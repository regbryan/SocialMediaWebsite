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

      {/* Phone mockup */}
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
        <div
          style={{
            position: "absolute",
            left: "-2px",
            top: "120px",
            width: "2px",
            height: "60px",
            background: "#1a1a2e",
            borderRadius: "2px",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: "-2px",
            top: "200px",
            width: "2px",
            height: "40px",
            background: "#1a1a2e",
            borderRadius: "2px",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: "-2px",
            top: "150px",
            width: "2px",
            height: "80px",
            background: "#1a1a2e",
            borderRadius: "2px",
          }}
        />

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
          {/* Video */}
          <video
            autoPlay
            muted
            loop
            playsInline
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          >
            <source src="/hero-video.mp4" type="video/mp4" />
          </video>

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

          {/* Gradient overlays */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "100px",
              background:
                "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.6) 100%)",
              zIndex: 3,
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "80px",
              background:
                "linear-gradient(180deg, rgba(0,0,0,0.4) 0%, transparent 100%)",
              zIndex: 3,
              pointerEvents: "none",
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes phoneFloat {
          0%, 100% { transform: rotate(-4deg) rotateY(6deg) translateY(0); }
          50% { transform: rotate(-4deg) rotateY(6deg) translateY(-12px); }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.08); }
        }
      `}</style>
    </div>
  );
}
