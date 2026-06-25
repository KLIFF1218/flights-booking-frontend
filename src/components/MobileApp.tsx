import { Download, Smartphone, Bell, MapPin } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export function MobileApp() {
  return (
    <section className="py-20 px-4 bg-white overflow-hidden">
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Download Our Mobile App
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Book flights on the go with our award-winning mobile app. Get exclusive mobile-only deals and instant notifications.
            </p>

            <div className="space-y-4 mb-8">
              {[
                { icon: Smartphone, text: "Easy mobile booking in seconds" },
                { icon: Bell, text: "Real-time flight status notifications" },
                { icon: MapPin, text: "Offline access to boarding passes" }
              ].map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-gray-700">{feature.text}</span>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button className="flex items-center justify-center gap-3 px-6 py-4 bg-black text-white rounded-xl hover:bg-gray-800 transition">
                <Download className="w-6 h-6" />
                <div className="text-left">
                  <div className="text-xs">Download on the</div>
                  <div className="text-lg font-semibold">App Store</div>
                </div>
              </button>
              
              <button className="flex items-center justify-center gap-3 px-6 py-4 bg-black text-white rounded-xl hover:bg-gray-800 transition">
                <Download className="w-6 h-6" />
                <div className="text-left">
                  <div className="text-xs">Get it on</div>
                  <div className="text-lg font-semibold">Google Play</div>
                </div>
              </button>
            </div>

            <p className="text-sm text-gray-500 mt-6">
              Available for iOS 14+ and Android 8+
            </p>
          </div>

          <div className="relative">
            <div className="relative mx-auto max-w-sm">
              <div className="absolute -top-10 -right-10 w-72 h-72 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full blur-3xl opacity-20"></div>
              <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full blur-3xl opacity-20"></div>
              
              <div className="relative bg-gray-900 rounded-[3rem] p-3 shadow-2xl">
                <div className="bg-white rounded-[2.5rem] overflow-hidden aspect-[9/19]">
                  <ImageWithFallback 
                    src="https://images.unsplash.com/photo-1759835358721-92ec5e8f80d2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWFydHBob25lJTIwdHJhdmVsJTIwYXBwJTIwbW9ja3VwfGVufDF8fHx8MTc3MjgzNzcyOXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                    alt="Mobile app"
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="absolute top-6 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-full"></div>
              </div>

              <div className="absolute -right-8 top-1/4 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-full shadow-xl font-bold rotate-12 hidden lg:block">
                Save 60%
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
