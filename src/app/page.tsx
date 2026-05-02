import Nav from "@/components/Nav";
import HeroSection from "@/components/HeroSection";
import StatsSection from "@/components/StatsSection";
import HowItWorks from "@/components/HowItWorks";
import TrustSignals from "@/components/TrustSignals";
import MatchingForm from "@/components/MatchingForm";
import Footer from "@/components/Footer";

export default function HomePage() {
  return (
    <>
      <Nav />
      <main>
        <HeroSection />
        <StatsSection />
        <HowItWorks />
        <TrustSignals />
        <MatchingForm />
      </main>
      <Footer />
    </>
  );
}
