import { AcademySpotlight } from "@/components/home/academy-spotlight";
import { Capabilities } from "@/components/home/capabilities";
import { DualPath } from "@/components/home/dual-path";
import { HomeHero } from "@/components/home/hero";
import { ServicesPreview } from "@/components/home/services-preview";
import { Testimonials } from "@/components/home/testimonials";
import { CtaPanel } from "@/components/shared/cta-panel";
import { StatsBand } from "@/components/shared/stats-band";

export default function HomePage() {
  return (
    <>
      <HomeHero />
      <Capabilities />
      <DualPath />
      <ServicesPreview />
      <StatsBand />
      <AcademySpotlight />
      <Testimonials />
      <CtaPanel />
    </>
  );
}
