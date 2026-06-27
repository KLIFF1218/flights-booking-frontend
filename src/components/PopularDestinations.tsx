import { ArrowRight } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

const destinations = [
  {
    city: "Paris",
    country: "France",
    code: "CDG",
    price: "$299",
    image: "/destinations/paris.jpg",
  },
  {
    city: "Tokyo",
    country: "Japan",
    code: "NRT",
    price: "$599",
    image: "/destinations/tokyo.jpg",
  },
  {
    city: "New York",
    country: "USA",
    code: "JFK",
    price: "$199",
    image: "/destinations/newyork.jpg",
  },
  {
    city: "London",
    country: "UK",
    code: "LHR",
    price: "$349",
    image: "/destinations/london.jpg",
  },
  {
    city: "Dubai",
    country: "UAE",
    code: "DXB",
    price: "$449",
    image: "/destinations/dubai.jpg",
  },
  {
    city: "Barcelona",
    country: "Spain",
    code: "BCN",
    price: "$279",
    image: "/destinations/barcelona.jpg",
  },
];

export function PopularDestinations() {
  return (
    <section className="pb-20 pt-5 px-4 bg-white">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Popular Destinations
          </h2>
          <p className="text-xl text-gray-600">
            Discover the world's most amazing cities at the best prices
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map((dest, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer"
            >
              <div className="aspect-[4/3] relative">
                <ImageWithFallback
                  src={dest.image}
                  alt={dest.city}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-xs font-medium text-white/80 mb-1">
                      {dest.code}
                    </div>
                    <h3 className="text-2xl font-bold mb-1">{dest.city}</h3>
                    <p className="text-sm text-white/90">{dest.country}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-white/80 mb-1">From</div>
                    <div className="text-3xl font-bold">{dest.price}</div>
                  </div>
                </div>

                <button className="mt-4 w-full px-4 py-3 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-xl flex items-center justify-center gap-2 transition group-hover:bg-white/40">
                  <span>View Flights</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
