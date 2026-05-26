import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import TrustBar from "../components/TrustBar";
import HowItWorks from "../components/HowItWorks";
import WhyScandy from "../components/WhyScandy";
import Occasions from "../components/Occasions";
import Testimonials from "../components/Testimonials";
import FAQ from "../components/Faq";
import PricingSection from "../components/PricingSection";
import CTASection from "../components/CTASection";
import Footer from "../components/Footer";
import GreetingCards from "../components/GreetingCard";

export default function Home() {
  return (
    <>
      {/* NAVBAR */}
       <Navbar />

        <main style={{ paddingTop: '120px' }}>
        <Hero />
        <TrustBar />
        <GreetingCards/>
        <HowItWorks/>
        <WhyScandy/>
        <Occasions/>
        <Testimonials/>
        <FAQ/>
        <PricingSection/>
        <CTASection/>
        
        {/* next sections go here */}
      </main>
      <Footer/>
    </>
  );
}