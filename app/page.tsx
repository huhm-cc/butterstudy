import { Hero } from "@/components/landing/hero";
import { How } from "@/components/landing/how";
import { Features } from "@/components/landing/features";
import { OverviewPreview } from "@/components/landing/overview-preview";
import { StatsStrip } from "@/components/landing/stats-strip";
import { ClosingCta } from "@/components/landing/closing-cta";

export default function LandingPage() {
  return (
    <>
      <Hero />
      <How />
      <Features />
      <OverviewPreview />
      <StatsStrip />
      <ClosingCta />
    </>
  );
}