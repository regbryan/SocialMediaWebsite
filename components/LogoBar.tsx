import Image from "next/image";

const logos = [
  { src: "/logos/blitz.png", alt: "Blitz Organization" },
  { src: "/logos/iec.png", alt: "Inland Empire Comfort" },
  { src: "/logos/omega.png", alt: "Omega Mortgage Group" },
  { src: "/logos/doug.png", alt: "Doug Mitchell, Esq." },
  { src: "/logos/boardwalk.png", alt: "SC Boardwalk Crew" },
  { src: "/logos/csc.png", alt: "Cyber Safety Cop" },
];

const loopedLogos = [...logos, ...logos];

export default function LogoBar() {
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
          className="eyebrow"
          style={{
            textAlign: "center",
            padding: "0 clamp(24px, 6vw, 120px)",
          }}
        >
          Trusted by growing brands
        </span>
      </div>

      <div
        style={{
          position: "relative",
          overflow: "hidden",
          marginTop: "36px",
        }}
      >
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
            willChange: "transform",
          }}
        >
          {loopedLogos.map((logo, i) => (
            <div key={`${logo.alt}-${i}`} style={{ height: "60px", flexShrink: 0 }}>
              <div
                className="logo-mono"
                style={{ position: "relative", width: "160px", height: "60px" }}
              >
                <Image
                  src={logo.src}
                  alt={logo.alt}
                  fill
                  sizes="160px"
                  style={{
                    objectFit: "contain",
                    filter: "brightness(0) invert(1)",
                  }}
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
        @media (prefers-reduced-motion: reduce) {
          .logo-strip { animation: none !important; }
        }
      `}</style>
    </section>
  );
}
