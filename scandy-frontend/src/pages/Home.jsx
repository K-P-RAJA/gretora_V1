import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import TrustBar from "../components/Trustbar";
import HowItWorks from "../components/HowItWorks";
import WhyScandy from "../components/WhyScandy";
import Occasions from "../components/Occasions";
import Testimonials from "../components/Testimonials";
import FAQ from "../components/Faq";
import CTASection from "../components/CTASection";
import Footer from "../components/Footer";
import GreetingCards from "../components/GreetingCard";

export default function Home() {
  return (
    <>
      {/* NAVBAR */}
       <Navbar />

        <main>
        <Hero />
        <TrustBar />
        <GreetingCards/>
        <HowItWorks/>
        <WhyScandy/>
        <Occasions/>
        <Testimonials/>
        <FAQ/>
        <CTASection/>
        
        {/* next sections go here */}
      </main>
      <Footer/>
    </>
  );
}