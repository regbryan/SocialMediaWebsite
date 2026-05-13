"use client";

import ContactForm from "@/components/ContactForm";

export default function CTASection() {
  return (
    <section
      id="contact"
      style={{
        backgroundColor: "#07070e",
        padding: "80px clamp(24px, 6vw, 120px)",
      }}
    >
      <div style={{ maxWidth: "960px", margin: "0 auto" }}>
        <div
          className="flex flex-col items-center text-center"
          style={{
            backgroundColor: "#0f0f1a",
            border: "1px solid #1a1a2e",
            borderRadius: "24px",
            padding: "64px 40px",
            gap: "20px",
            boxShadow: "0 24px 60px rgba(0,0,0,0.45)",
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 14px",
              borderRadius: "999px",
              border: "1px solid rgba(139,92,255,0.35)",
              backgroundColor: "rgba(139,92,255,0.08)",
              color: "#b18bff",
              fontSize: "12px",
              fontWeight: 500,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                backgroundColor: "#8b5cff",
              }}
            />
            Self-serve signup coming soon
          </span>
          <h2
            className="display-heading"
            style={{ fontSize: "clamp(44px, 6vw, 80px)", maxWidth: "900px" }}
          >
            Book a call.
          </h2>
          <p
            style={{
              fontSize: "16px",
              lineHeight: 1.65,
              color: "#9999a6",
              maxWidth: "540px",
              margin: 0,
            }}
          >
            While we finish the signup flow, the fastest way in is a 20-minute
            call. We&apos;ll plan your first 30 days for free. No commitment.
          </p>
          <div style={{ width: "100%", maxWidth: "560px", marginTop: "12px" }}>
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  );
}
