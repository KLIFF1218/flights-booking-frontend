import { PopularDestinations } from "@/components/PopularDestinations";
import { Footer } from "@/components/Footer";
import { HowItWorks } from "@/components/HowItWorks";
import { WhyChooseUs } from "@/components/WhyChooseUs";
import { Hero } from "@/components/Hero";

export default function HomePage() {
  return (
    <>
      <Hero />
      <PopularDestinations />
      <WhyChooseUs />
      <HowItWorks />
      <Footer />
    </>
  );
}
