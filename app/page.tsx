import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import LogoBar from "@/components/LogoBar";
import Portfolio from "@/components/Portfolio";
import Services from "@/components/Services";
import Process from "@/components/Process";
import Testimonials from "@/components/Testimonials";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main style={{ backgroundColor: "#07070e" }}>
      <Navbar />
      <Hero />
      <LogoBar />
      <Portfolio />
      <Services />
      <Process />
      <Testimonials />
      <CTASection />
      <Footer />
    </main>
  );
}
