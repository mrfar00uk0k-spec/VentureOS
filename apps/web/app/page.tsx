import { BackgroundLayers } from "@/components/landing/BackgroundLayers";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { Hero } from "@/components/landing/Hero";
import { TrustedBy } from "@/components/landing/TrustedBy";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { SolutionSection } from "@/components/landing/SolutionSection";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { AnalysisPreview } from "@/components/landing/AnalysisPreview";
import { FeaturesGrid } from "@/components/landing/FeaturesGrid";
import { BentoFeatures } from "@/components/landing/BentoFeatures";
import { Testimonials } from "@/components/landing/Testimonials";
import { CtaSection } from "@/components/landing/CtaSection";
import { Footer } from "@/components/landing/Footer";

// The full marketing landing page (Milestone 2), ported from the standalone
// HTML/CSS/JS preview into real React + Tailwind components — one file per
// section, sharing the same Reveal/Counter/SpotlightCard building blocks so
// the motion language stays identical everywhere else it's reused.
export default function HomePage() {
  return (
    <>
      <BackgroundLayers />
      <LandingNavbar />
      <main>
        <Hero />
        <TrustedBy />
        <ProblemSection />
        <SolutionSection />
        <HowItWorks />
        <AnalysisPreview />
        <FeaturesGrid />
        <BentoFeatures />
        <Testimonials />
        <CtaSection />
      </main>
      <Footer />
    </>
  );
}
