import GlowingEdgeCard from "./GlowingEdgeCard";

const services = [
  {
    icon: "📸",
    title: "Instagram & Facebook Posts",
    description:
      "Eye-catching static posts and stories designed to stop the scroll. Branded templates, captions, and hashtag strategy included.",
    features: ["5-7 posts per week", "Custom branded templates", "Caption writing & hashtags"],
  },
  {
    icon: "🎠",
    title: "Carousel Content",
    description:
      "Swipeable, value-packed carousels that educate your audience and boost saves. Perfect for tips, guides, and product showcases.",
    features: ["Educational slides", "Brand-consistent design", "Engagement-optimized"],
  },
  {
    icon: "🎬",
    title: "Reels & Short-Form Video",
    description:
      "Trending reels and short videos that capture attention in the first second. We handle scripting, editing, and posting.",
    features: ["Trend-aware content", "Professional editing", "Optimized for reach"],
  },
  {
    icon: "💼",
    title: "LinkedIn & Professional Content",
    description:
      "Thought leadership posts and articles that build authority. From industry insights to company culture storytelling.",
    features: ["Authority building", "Professional tone", "Network growth"],
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
        style={{ maxWidth: "1280px", gap: "56px" }}
      >
        {/* Section header */}
        <div
          className="flex flex-col items-center text-center"
          style={{ gap: "12px" }}
        >
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

        {/* Services grid */}
        <div
          className="grid grid-cols-1 md:grid-cols-2"
          style={{ gap: "24px" }}
        >
          {services.map((service) => (
            <GlowingEdgeCard key={service.title}>
              <div
                className="flex flex-col"
                style={{ padding: "36px", gap: "20px", height: "100%" }}
              >
                {/* Icon */}
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: "56px",
                    height: "56px",
                    backgroundColor: "#261a40",
                    borderRadius: "14px",
                    fontSize: "28px",
                  }}
                >
                  {service.icon}
                </div>

                {/* Title & Description */}
                <div className="flex flex-col" style={{ gap: "10px" }}>
                  <h3
                    style={{
                      fontSize: "22px",
                      fontWeight: 600,
                      color: "white",
                      lineHeight: 1.25,
                      margin: 0,
                    }}
                  >
                    {service.title}
                  </h3>
                  <p
                    style={{
                      fontSize: "14px",
                      lineHeight: 1.65,
                      color: "#9999a6",
                      margin: 0,
                    }}
                  >
                    {service.description}
                  </p>
                </div>

                {/* Features */}
                <ul
                  className="flex flex-col"
                  style={{ gap: "10px", listStyle: "none", padding: 0, margin: 0 }}
                >
                  {service.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center"
                      style={{
                        color: "#bfbfcc",
                        fontSize: "13px",
                        gap: "10px",
                      }}
                    >
                      <span
                        style={{
                          color: "#8b5cff",
                          fontSize: "14px",
                          fontWeight: 700,
                        }}
                      >
                        ✓
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </GlowingEdgeCard>
          ))}
        </div>
      </div>
    </section>
  );
}
