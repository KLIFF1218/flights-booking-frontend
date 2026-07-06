"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import {
  popularDestinations,
  buildSearchUrl,
} from "@/shared/data/popular-destinations";

export function PopularDestinations() {
  return (
    <section className="bg-white px-4 pb-20 pt-5">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-4xl font-bold text-gray-900 lg:text-5xl">
            Popular destinations
          </h2>
          <p className="text-xl text-gray-600">
            Choose a destination and jump straight into real flight search.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {popularDestinations.map((destination) => (
            <Link
              key={destination.id}
              href={buildSearchUrl(destination)}
              className="group relative overflow-hidden rounded-2xl shadow-lg transition-all duration-300 hover:shadow-2xl"
            >
              <div className="relative aspect-[4/3]">
                <ImageWithFallback
                  src={destination.image}
                  alt={destination.city}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <div className="mb-1 text-xs font-medium text-white/80">
                      {destination.destination}
                    </div>
                    <h3 className="mb-1 text-2xl font-bold">
                      {destination.city}
                    </h3>
                    <p className="text-sm text-white/90">
                      {destination.country}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="mb-1 text-xs text-white/80">From</div>
                    <div className="text-xl font-semibold">
                      {destination.origin}
                    </div>
                  </div>
                </div>

                <p className="mt-3 text-sm text-white/80">
                  {destination.description}
                </p>

                <div className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-white/20 px-4 py-3 backdrop-blur-sm transition group-hover:bg-white/30">
                  <span>View flights</span>
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
