import { HeroSearch } from "@/features/search/components/HeroSearch/HeroSearch";

export function Hero() {
  return (
    <section className="relative pt-34 pb-18 px-4 ">
<div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-sky-400 to-indigo-500 -z-10"></div>
      <div className="absolute top-20 right-0 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-30 -z-10"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-100 rounded-full blur-3xl opacity-20 -z-10"></div>

      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-5">
<h1 className="text-5xl lg:text-7xl font-bold text-white mb-6">            Find Your Perfect Flight
            <span className="block mt-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              At Unbeatable Prices
            </span>
          </h1>
          
        </div>
        
        <HeroSearch />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6  mt-10">
          {[
            { value: "500+", label: "Airlines" },
            { value: "2000+", label: "Destinations" },
            { value: "5M+", label: "Happy Travelers" },
            { value: "60%", label: "Average Savings" },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
