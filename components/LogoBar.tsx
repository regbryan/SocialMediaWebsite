import Image from "next/image";

const logos = [
  { src: "/logos/blitz.png", alt: "Blitz Organization" },
  { src: "/logos/iec.png", alt: "Inland Empire Comfort" },
  { src: "/logos/omega.png", alt: "Omega Mortgage Group" },
  { src: "/logos/doug.png", alt: "Doug Mitchell, Esq." },
  { src: "/logos/boardwalk.png", alt: "SC Boardwalk Crew" },
  { src: "/logos/csc.png", alt: "Cyber Safety Cop" },
];

// Duplicate for seamless infinite loop
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

      {/* Marquee — full bleed so edges fade */}
      <div
        className="marquee-wrapper logos-marquee"
        style={{
          position: "relative",
          overflow: "hidden",
          marginTop: "36px",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "80px",
            width: "max-content",
            animation: `marquee ${logos.length * 5}s linear infinite`,
            alignItems: "center",
          }}
        >
          {loopedLogos.map((logo, i) => (
            <div
              key={`${logo.alt}-${i}`}
              className="logo-item flex items-center justify-center"
              style={{ height: "60px", flexShrink: 0 }}
            >
              <div
                style={{
                  position: "relative",
                  width: "160px",
                  height: "60px",
                }}
              >
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
