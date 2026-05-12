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
          <h2
            className="display-heading"
            style={{ fontSize: "clamp(44px, 6vw, 80px)", maxWidth: "900px" }}
          >
            Talk to us.
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
            We&apos;ll plan your first 30 days for free. No commitment.
          </p>
          <div style={{ width: "100%", maxWidth: "560px", marginTop: "12px" }}>
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  );
}
