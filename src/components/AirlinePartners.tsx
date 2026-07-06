import { Plane } from "lucide-react";

const airlines = [
  "American Airlines",
  "Delta",
  "United",
  "Emirates",
  "British Airways",
  "Lufthansa",
  "Air France",
  "Singapore Airlines",
  "Qatar Airways",
  "ANA",
  "KLM",
  "Turkish Airlines"
];

export function AirlinePartners() {
  return (
    <section className="py-20 px-4 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Trusted Airline Partners
          </h2>
          <p className="text-xl text-gray-600">
            We partner with 500+ airlines worldwide to bring you the best deals
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {airlines.map((airline, index) => (
            <div 
              key={index}
              className="bg-white rounded-xl p-6 flex flex-col items-center justify-center gap-3 shadow-md hover:shadow-xl transition-all duration-300 group cursor-pointer"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Plane className="w-8 h-8 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-gray-700 text-center">{airline}</span>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600">
            And <span className="font-bold text-blue-600">490+ more airlines</span> to choose from
          </p>
        </div>
      </div>
    </section>
  );
}
