import { Star } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Frequent Traveler",
    image:
      "https://images.unsplash.com/photo-1768933294181-82778103e501?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXBweSUyMHdvbWFuJTIwdHJhdmVsZXIlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NzI3ODg5MDN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    text: "I saved over $500 on my last trip to Europe! CheapTickets found me deals I couldn't find anywhere else. Absolutely recommend it!",
    rating: 5,
  },
  {
    name: "Michael Chen",
    role: "Business Consultant",
    image:
      "https://images.unsplash.com/photo-1723537742563-15c3d351dbf2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMG1hbiUyMHByb2Zlc3Npb25hbCUyMGhlYWRzaG90fGVufDF8fHx8MTc3MjgwNjUwN3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    text: "As someone who travels frequently for work, this platform has become indispensable. Fast, reliable, and always the best prices.",
    rating: 5,
  },
  {
    name: "Emma Rodriguez",
    role: "Content Creator",
    image:
      "https://images.unsplash.com/photo-1748344386932-f0b9c7b925e6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMHdvbWFuJTIwc21pbGluZyUyMHBvcnRyYWl0fGVufDF8fHx8MTc3MjgyMjEyOHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    text: "The mobile app is amazing! Booked my entire Southeast Asia trip in minutes. The 24/7 support team was super helpful too.",
    rating: 5,
  },
];

export function Testimonials() {
  return (
    <section className="py-20 px-4 bg-white">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Loved by Travelers
          </h2>
          <p className="text-xl text-gray-600">
            Join millions of happy customers worldwide
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-8 hover:shadow-xl transition-shadow duration-300"
            >
              {/* Rating */}
              <div className="flex gap-1 mb-6">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>

              <p className="text-gray-700 leading-relaxed mb-6 italic">
                "{testimonial.text}"
              </p>

              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full overflow-hidden ring-2 ring-white shadow-md">
                  <ImageWithFallback
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-gray-600">
                    {testimonial.role}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-8 bg-white rounded-2xl px-8 py-6 shadow-lg">
            <div>
              <div className="text-3xl font-bold text-gray-900">4.9/5</div>
              <div className="text-sm text-gray-600">Average Rating</div>
            </div>
            <div className="w-px h-12 bg-gray-300"></div>
            <div>
              <div className="text-3xl font-bold text-gray-900">50K+</div>
              <div className="text-sm text-gray-600">Reviews</div>
            </div>
            <div className="w-px h-12 bg-gray-300"></div>
            <div>
              <div className="text-3xl font-bold text-gray-900">5M+</div>
              <div className="text-sm text-gray-600">Happy Customers</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
