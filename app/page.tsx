import { HeroSection } from "@/components/hero-section";
import { AboutSection } from "@/components/about-section";
import { Benefits } from "@/components/benefits";
import { Contact } from "@/components/contact";
import { Features } from "@/components/features";
import LoanApprovalBanner from './components/LoanApprovalBanner';

export default function Home() {
  return (
    <div className="flex flex-col w-full overflow-x-hidden">
      <LoanApprovalBanner />
      <HeroSection />
      <Benefits />
      <AboutSection />
      <Features />
      <Contact />
    </div>
  );
}