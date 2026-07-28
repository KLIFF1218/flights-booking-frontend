"use client";

import { useState, type FormEvent } from "react";
import { Mail, ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";

export function Newsletter() {
  const t = useTranslations("home.newsletter");
  const [message, setMessage] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(t("success"));
  }

  const benefits = [
    { emoji: "✈️", text: t("benefit1") },
    { emoji: "🎁", text: t("benefit2") },
    { emoji: "📍", text: t("benefit3") },
  ];

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-700 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>

      <div className="container mx-auto max-w-4xl relative z-10">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Mail className="w-10 h-10 text-white" />
          </div>

          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            {t("title")}
          </h2>
          <p className="text-xl text-white/90">{t("subtitle")}</p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
          <form
            className="flex flex-col sm:flex-row gap-4"
            onSubmit={handleSubmit}
          >
            <input
              type="email"
              name="email"
              required
              placeholder={t("emailPlaceholder")}
              className="flex-1 px-6 py-4 rounded-xl bg-white/90 backdrop-blur-sm border-0 outline-none focus:ring-4 focus:ring-white/30 transition text-gray-900 placeholder-gray-500"
            />
            <button
              type="submit"
              className="px-8 py-4 bg-white text-blue-600 rounded-xl hover:bg-gray-100 transition font-semibold flex items-center justify-center gap-2 group shadow-xl"
            >
              {t("subscribe")}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
            </button>
          </form>

          {message && (
            <p className="text-sm text-white mt-4 text-center">{message}</p>
          )}

          <p className="text-sm text-white/80 mt-4 text-center">{t("noSpam")}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {benefits.map((benefit) => (
            <div
              key={benefit.text}
              className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20"
            >
              <div className="text-3xl mb-2">{benefit.emoji}</div>
              <div className="text-white font-medium">{benefit.text}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
