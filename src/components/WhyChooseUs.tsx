"use client";

import { DollarSign, Zap, Shield, Headphones } from "lucide-react";
import { useTranslations } from "next-intl";

export function WhyChooseUs() {
  const t = useTranslations("home.whyChooseUs");

  const features = [
    {
      icon: DollarSign,
      title: t("cheapestTitle"),
      description: t("cheapestDesc"),
      gradient: "from-blue-500 to-blue-600",
    },
    {
      icon: Zap,
      title: t("fastTitle"),
      description: t("fastDesc"),
      gradient: "from-purple-500 to-purple-600",
    },
    {
      icon: Shield,
      title: t("trustedTitle"),
      description: t("trustedDesc"),
      gradient: "from-green-500 to-green-600",
    },
    {
      icon: Headphones,
      title: t("supportTitle"),
      description: t("supportDesc"),
      gradient: "from-orange-500 to-orange-600",
    },
  ];

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            {t("title")}
          </h2>
          <p className="text-xl text-gray-600">{t("subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                <div className="relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 h-full border border-gray-100">
                  <div
                    className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}
                  >
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
