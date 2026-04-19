"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { FlightForm, FlightFormData } from "@/components/FlightForm";
import { FlightSummary } from "@/components/FlightSummary";
import { apiFetch } from "@/shared/api/apiClient";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function CreateFlightPage() {
  const router = useRouter();

  const [formData, setFormData] = useState<FlightFormData>({
    flightId: "",
    aircraftId: "",
    departureDate: "",
    departureTime: "",
    basePrice: "",
    currency: "EUR",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    try {
      setError(null);

      if (!formData.flightId) {
        return setError("Выберите рейс");
      }

      if (!formData.aircraftId) {
        return setError("Выберите самолёт");
      }

      if (!formData.departureDate || !formData.departureTime) {
        return setError("Укажите дату и время");
      }

      if (isNaN(Number(formData.basePrice))) {
        return setError("Некорректная цена");
      }

      setLoading(true);

      const departure = new Date(
        `${formData.departureDate}T${formData.departureTime}:00`,
      );

      const payload = {
        flightId: formData.flightId,
        aircraftId: formData.aircraftId,
        departure: departure.toISOString(),
        price: Number(formData.basePrice),
        currency: formData.currency,
      };

      await apiFetch("/flight-instances", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      router.push("/flights");
      router.refresh();
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Ошибка создания рейса");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
        <div>
          <FlightForm onFormChange={setFormData} />

          {error && <div className="text-red-500 mt-4">{error}</div>}

          <Button
            className="w-full mt-6"
            size="lg"
            onClick={handleCreate}
            disabled={loading}
          >
            {loading ? "Создание..." : "Создать рейс"}
          </Button>
        </div>

        <FlightSummary formData={formData} />
      </div>
    </DashboardLayout>
  );
}
