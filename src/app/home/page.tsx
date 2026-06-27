"use client";
import { Header } from "@/shared/ui/header/Header";
import { Hero } from "@/components/Hero";
import { PopularDestinations } from "@/components/PopularDestinations";
import { WhyChooseUs } from "@/components/WhyChooseUs";
import { BestDeals } from "@/components/BestDeals";
import { HowItWorks } from "@/components/HowItWorks";
import { Testimonials } from "@/components/Testimonials";
import { AirlinePartners } from "@/components/AirlinePartners";
import { MobileApp } from "@/components/MobileApp";
import { Newsletter } from "@/components/Newsletter";
import { Footer } from "@/components/Footer";

export default function Page() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Hero />
      <PopularDestinations />
      <WhyChooseUs />
      <BestDeals />
      <HowItWorks />
      <Testimonials />
      <AirlinePartners />
      <MobileApp />
      <Newsletter />
      <Footer />
    </div>
  );
}
