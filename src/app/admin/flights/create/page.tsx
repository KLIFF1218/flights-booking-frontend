"use client";

import { useCallback, useState } from "react";
import { FlightForm, FlightFormData } from "@/components/FlightForm";
import { FlightSummary } from "@/components/FlightSummary";
import { FlightTemplateCombobox } from "@/components/FlightTemplateCombobox";
import {
  createFlightInstance,
  type AdminFlightTemplate,
} from "@/features/flights/api/admin-flights.api";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

function parsePositivePrice(value: string): number | null {
  if (value.trim() === "") return null;
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

export default function CreateFlightPage() {
  const router = useRouter();

  const [formData, setFormData] = useState<FlightFormData>({
    aircraftId: "",
    aircraftLabel: "",
    departureDate: "",
    departureTime: "",
    economyPrice: "",
    premiumEconomyPrice: "",
    businessPrice: "",
    firstPrice: "",
    currency: "USD",
  });

  const [selectedTemplate, setSelectedTemplate] =
    useState<AdminFlightTemplate | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFormChange = useCallback((data: FlightFormData) => {
    setFormData(data);
  }, []);

  const handleCreate = async () => {
    try {
      setError(null);

      if (!selectedTemplate) {
        return setError("Select a flight template from the list");
      }

      if (!formData.aircraftId) {
        return setError("Select an aircraft");
      }

      if (!formData.departureDate || !formData.departureTime) {
        return setError("Enter date and time");
      }

      const economy = parsePositivePrice(formData.economyPrice);
      const premiumEconomy = parsePositivePrice(formData.premiumEconomyPrice);
      const business = parsePositivePrice(formData.businessPrice);
      const first = parsePositivePrice(formData.firstPrice);

      if (economy == null || premiumEconomy == null || business == null) {
        return setError("Enter valid adult prices for Economy, Premium Economy, and Business");
      }

      if (selectedTemplate.supportsFirstClass && first == null) {
        return setError("Enter a valid First class adult price for this airline");
      }

      setLoading(true);

      await createFlightInstance({
        flightId: selectedTemplate.id,
        aircraftId: formData.aircraftId,
        departureLocalDate: formData.departureDate,
        departureLocalTime: formData.departureTime,
        currency: formData.currency,
        fares: {
          economy,
          premiumEconomy,
          business,
          ...(selectedTemplate.supportsFirstClass && first != null
            ? { first }
            : {}),
        },
      });

      router.push("/admin/flights");
      router.refresh();
    } catch (e: unknown) {
      console.error(e);
      setError(e instanceof Error ? e.message : "Failed to create flight");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
      <div>
        <div className="mb-6 space-y-2">
          <Label>Flight template</Label>
          <FlightTemplateCombobox
            value={selectedTemplate}
            onChange={setSelectedTemplate}
          />
          <p className="text-xs text-slate-500">
            Enter at least 2 characters: flight number, airline, or airport code
          </p>
        </div>

        <FlightForm
          airlineId={selectedTemplate?.airlineId}
          supportsFirstClass={selectedTemplate?.supportsFirstClass ?? false}
          onFormChange={handleFormChange}
        />

        {error && <div className="text-red-500 mt-4">{error}</div>}

        <Button
          className="w-full mt-6"
          size="lg"
          onClick={handleCreate}
          disabled={loading}
        >
          {loading ? "Creating..." : "Create flight"}
        </Button>
      </div>

      <FlightSummary formData={formData} selectedTemplate={selectedTemplate} />
    </div>
  );
}
