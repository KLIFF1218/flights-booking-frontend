import { DollarSign, Zap, Shield, Headphones } from "lucide-react";

const features = [
  {
    icon: DollarSign,
    title: "Cheapest Prices",
    description: "We guarantee the lowest prices or we'll refund the difference. Save up to 60% on every booking.",
    gradient: "from-blue-500 to-blue-600"
  },
  {
    icon: Zap,
    title: "Lightning Fast Search",
    description: "Search hundreds of airlines in seconds. Our advanced algorithm finds you the best deals instantly.",
    gradient: "from-purple-500 to-purple-600"
  },
  {
    icon: Shield,
    title: "Trusted Airlines",
    description: "Partner with 500+ trusted airlines worldwide. Your safety and comfort are our top priorities.",
    gradient: "from-green-500 to-green-600"
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "Our expert team is always here to help. Get assistance anytime, anywhere via chat, email, or phone.",
    gradient: "from-orange-500 to-orange-600"
  }
];

export function WhyChooseUs() {
  return (
    <section className="py-20 px-4 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Why Choose CheapTickets?
          </h2>
          <p className="text-xl text-gray-600">
            The smartest way to book your flights
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div 
                key={index}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 h-full border border-gray-100">
                  <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
