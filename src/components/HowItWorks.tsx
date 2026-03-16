import { Search, BarChart3, CheckCircle } from "lucide-react";

const steps = [
  {
    icon: Search,
    step: "01",
    title: "Search",
    description: "Enter your destination and travel dates. Our smart search scans hundreds of airlines instantly."
  },
  {
    icon: BarChart3,
    step: "02",
    title: "Compare",
    description: "Compare prices, flight times, and airlines side-by-side. Find the perfect match for your budget."
  },
  {
    icon: CheckCircle,
    step: "03",
    title: "Book",
    description: "Secure your ticket in just a few clicks. Get instant confirmation and digital boarding pass."
  }
];

export function HowItWorks() {
  return (
    <section className="py-20 px-4 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600">
            Book your flight in three simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connection lines - hidden on mobile */}
          <div className="hidden md:block absolute top-24 left-1/4 right-1/4 h-1 bg-gradient-to-r from-blue-200 via-purple-200 to-green-200"></div>

          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div 
                key={index}
                className="relative text-center"
              >
                <div className="relative inline-block mb-6">
                  {/* Step number background */}
                  <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg z-10">
                    {step.step}
                  </div>
                  
                  {/* Icon container */}
                  <div className="w-32 h-32 bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl flex items-center justify-center relative z-0 border-2 border-white shadow-xl">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
                      <Icon className="w-10 h-10 text-white" />
                    </div>
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {step.title}
                </h3>
                
                <p className="text-gray-600 leading-relaxed max-w-sm mx-auto">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
