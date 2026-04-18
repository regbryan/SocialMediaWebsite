import GlowingEdgeCard from "./GlowingEdgeCard";

type IconName = "grid" | "layers" | "play" | "briefcase";

const Icon = ({ name }: { name: IconName }) => {
  const common = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "url(#icon-grad)",
    strokeWidth: 1.75,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  return (
    <svg {...common}>
      <defs>
        <linearGradient id="icon-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#c084fc" />
          <stop offset="100%" stopColor="#3b81ff" />
        </linearGradient>
      </defs>
      {name === "grid" && (
        <>
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </>
      )}
      {name === "layers" && (
        <>
          <path d="M12 2 2 7l10 5 10-5-10-5Z" />
          <path d="m2 17 10 5 10-5" />
          <path d="m2 12 10 5 10-5" />
        </>
      )}
      {name === "play" && (
        <>
          <rect x="3" y="5" width="18" height="14" rx="2.5" />
          <path d="M10 9l5 3-5 3V9Z" fill="url(#icon-grad)" />
        </>
      )}
      {name === "briefcase" && (
        <>
          <rect x="2" y="7" width="20" height="14" rx="2" />
          <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          <path d="M2 13h20" />
        </>
      )}
    </svg>
  );
};

const services: { icon: IconName; title: string; description: string; tags: string[] }[] = [
  {
    icon: "grid",
    title: "Feed Posts",
    description: "Scroll-stopping static posts & stories built from branded templates.",
    tags: ["5–7 / week", "Templates", "Captions"],
  },
  {
    icon: "layers",
    title: "Carousels",
    description: "Swipeable, value-packed carousels that boost saves and shares.",
    tags: ["Educational", "Branded", "Engagement"],
  },
  {
    icon: "play",
    title: "Reels & Shorts",
    description: "Trend-aware short video with scripting, editing, and posting.",
    tags: ["Trending", "Edited", "Optimized"],
  },
  {
    icon: "briefcase",
    title: "LinkedIn",
    description: "Thought-leadership posts that build authority and inbound traffic.",
    tags: ["Authority", "Professional", "Growth"],
  },
];

export default function Services() {
  return (
    <section
      id="services"
      style={{
        backgroundColor: "#090912",
        padding: "100px clamp(24px, 6vw, 120px)",
      }}
    >
      <div
        className="mx-auto flex flex-col"
        style={{ maxWidth: "1280px", gap: "48px" }}
      >
        <div className="flex flex-col items-center text-center" style={{ gap: "12px" }}>
          <span
            style={{
              color: "#8b5cff",
              fontSize: "13px",
              fontWeight: 600,
              letterSpacing: "3px",
              textTransform: "uppercase",
            }}
          >
            What We Do
          </span>
          <h2
            style={{
              fontSize: "clamp(32px, 4vw, 44px)",
              fontWeight: 700,
              color: "white",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              margin: 0,
            }}
          >
            Services Built for Growth
          </h2>
        </div>

        {/* 4-up premium grid */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
          style={{ gap: "16px" }}
        >
          {services.map((service) => (
            <GlowingEdgeCard key={service.title}>
              <div
                className="flex flex-col"
                style={{
                  padding: "22px 20px 20px",
                  gap: "14px",
                  height: "100%",
                }}
              >
                {/* Icon chip */}
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: "38px",
                    height: "38px",
                    borderRadius: "10px",
                    background: "linear-gradient(135deg, rgba(192,132,252,0.12) 0%, rgba(59,129,255,0.12) 100%)",
                    border: "1px solid rgba(192,132,252,0.18)",
                  }}
                >
                  <Icon name={service.icon} />
                </div>

                {/* Title */}
                <h3
                  style={{
                    fontSize: "17px",
                    fontWeight: 600,
                    color: "white",
                    lineHeight: 1.3,
                    letterSpacing: "-0.01em",
                    margin: 0,
                  }}
                >
                  {service.title}
                </h3>

                {/* Description */}
                <p
                  style={{
                    fontSize: "13px",
                    lineHeight: 1.55,
                    color: "#8a8a96",
                    margin: 0,
                    flex: 1,
                  }}
                >
                  {service.description}
                </p>

                {/* Tags */}
                <div
                  className="flex flex-wrap"
                  style={{ gap: "6px", marginTop: "4px" }}
                >
                  {service.tags.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        fontSize: "11px",
                        fontWeight: 500,
                        color: "#bfbfcc",
                        backgroundColor: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.06)",
                        padding: "4px 9px",
                        borderRadius: "999px",
                        letterSpacing: "0.01em",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </GlowingEdgeCard>
          ))}
        </div>
      </div>
    </section>
  );
}
