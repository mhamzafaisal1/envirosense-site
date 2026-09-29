import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import LiveDemo from "@/components/LiveDemo";
import ResultsSection from "@/components/ResultsSection";
import ProblemSection from "@/components/ProblemSection";
import ArchitectureSection from "@/components/ArchitectureSection";
import PaperSection from "@/components/PaperSection";
import AboutSection from "@/components/AboutSection";
import Footer from "@/components/Footer";
import CursorGlow from "@/components/CursorGlow";
import PageScan from "@/components/PageScan";

export default function Home() {
  return (
    <main>
      <PageScan />
      <CursorGlow />
      <Navbar />
      <Hero />
      <LiveDemo />
      <ResultsSection />
      <ProblemSection />
      <ArchitectureSection />
      <PaperSection />
      <AboutSection />
      <Footer />
    </main>
  );
}
