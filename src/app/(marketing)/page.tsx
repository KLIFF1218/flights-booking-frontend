"use client";
import { PopularDestinations } from "@/components/PopularDestinations";
import { Footer } from "@/components/Footer";
import { Newsletter } from "@/components/Newsletter";
import { MobileApp } from "@/components/MobileApp";
import { AirlinePartners } from "@/components/AirlinePartners";
import { Testimonials } from "@/components/Testimonials";
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
      <Testimonials />
      <AirlinePartners />
      <MobileApp />
      <Newsletter />
      <Footer />{" "}
    </>
  );
}
