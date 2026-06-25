import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-16 pb-8 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-400 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </div>
              <span className="text-xl font-semibold text-white">CheapTickets</span>
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Your trusted partner for finding the best flight deals worldwide. We compare prices from hundreds of airlines to help you save money and travel more.
            </p>
            <div className="flex gap-3">
              {[Facebook, Twitter, Instagram, Linkedin].map((Icon, index) => (
                <a 
                  key={index}
                  href="#"
                  className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-3">
              {["About Us", "Destinations", "Flight Deals", "Airlines", "Help Center"].map((link, index) => (
                <li key={index}>
                  <a href="#" className="hover:text-blue-400 transition">{link}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-3">
              {["Contact Us", "FAQs", "Booking Help", "Cancellations", "Refunds"].map((link, index) => (
                <li key={index}>
                  <a href="#" className="hover:text-blue-400 transition">{link}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Mail className="w-5 h-5 mt-0.5 text-blue-400 flex-shrink-0" />
                <span className="text-sm">support@cheaptickets.com</span>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="w-5 h-5 mt-0.5 text-blue-400 flex-shrink-0" />
                <span className="text-sm">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 mt-0.5 text-blue-400 flex-shrink-0" />
                <span className="text-sm">123 Travel Street, NY 10001</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
              © 2026 CheapTickets. All rights reserved.
            </p>
            <div className="flex flex-wrap gap-6 text-sm">
              <a href="#" className="hover:text-blue-400 transition">Privacy Policy</a>
              <a href="#" className="hover:text-blue-400 transition">Terms of Service</a>
              <a href="#" className="hover:text-blue-400 transition">Cookie Policy</a>
              <a href="#" className="hover:text-blue-400 transition">Sitemap</a>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-8 items-center">
          {["Secure Payment", "24/7 Support", "Best Price Guarantee", "Trusted by Millions"].map((badge, index) => (
            <div key={index} className="text-sm text-gray-500 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              {badge}
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
