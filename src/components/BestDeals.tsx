import { Plane, ArrowRight } from "lucide-react";

const deals = [
  {
    from: "New York (JFK)",
    to: "London (LHR)",
    airline: "British Airways",
    price: "$349",
    originalPrice: "$699",
    dates: "Mar 15 - Mar 22",
    type: "Round Trip",
    badge: "Best Deal"
  },
  {
    from: "Los Angeles (LAX)",
    to: "Tokyo (NRT)",
    airline: "ANA",
    price: "$599",
    originalPrice: "$1,299",
    dates: "Apr 1 - Apr 14",
    type: "Round Trip",
    badge: "Popular"
  },
  {
    from: "Miami (MIA)",
    to: "Paris (CDG)",
    airline: "Air France",
    price: "$429",
    originalPrice: "$899",
    dates: "Mar 20 - Mar 27",
    type: "Round Trip",
    badge: "Hot Deal"
  },
  {
    from: "Chicago (ORD)",
    to: "Barcelona (BCN)",
    airline: "Lufthansa",
    price: "$389",
    originalPrice: "$849",
    dates: "May 5 - May 12",
    type: "Round Trip",
    badge: "Save 54%"
  }
];

export function BestDeals() {
  return (
    <section className="py-20 px-4 bg-white">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Best Flight Deals
          </h2>
          <p className="text-xl text-gray-600">
            Limited time offers - Book now and save big!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {deals.map((deal, index) => (
            <div 
              key={index}
              className="group relative bg-white rounded-2xl p-6 border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300"
            >
              {/* Badge */}
              <div className="absolute top-6 right-6 px-3 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-semibold rounded-full">
                {deal.badge}
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                {/* Airline logo placeholder */}
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Plane className="w-8 h-8 text-blue-600" />
                </div>

                {/* Route info */}
                <div className="flex-1">
                  <div className="text-sm text-gray-500 mb-2">{deal.airline}</div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="font-semibold text-gray-900">{deal.from}</span>
                    <ArrowRight className="w-5 h-5 text-gray-400" />
                    <span className="font-semibold text-gray-900">{deal.to}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <span>{deal.dates}</span>
                    <span>•</span>
                    <span>{deal.type}</span>
                  </div>
                </div>

                {/* Price */}
                <div className="text-right sm:text-right w-full sm:w-auto">
                  <div className="text-sm text-gray-500 line-through mb-1">{deal.originalPrice}</div>
                  <div className="text-3xl font-bold text-blue-600 mb-2">{deal.price}</div>
                  <button className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition group-hover:shadow-lg group-hover:shadow-blue-500/30">
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <button className="px-8 py-4 border-2 border-blue-600 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition">
            View All Deals
          </button>
        </div>
      </div>
    </section>
  );
}
