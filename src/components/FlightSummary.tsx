import { FlightFormData } from "./FlightForm";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Separator } from "./ui/separator";
import { Plane, Calendar, DollarSign, Users } from "lucide-react";

interface FlightSummaryProps {
  formData: FlightFormData;
}

export function FlightSummary({ formData }: FlightSummaryProps) {
  const getRouteDisplay = () => {
    if (!formData.route) return "—";
    return formData.route;
  };

  const getAircraftDisplay = () => {
    if (!formData.aircraft) return "—";
    return formData.aircraft;
  };

  const getSeatCount = () => {
    if (!formData.aircraft) return "—";
    const match = formData.aircraft.match(/(\d+)\s*seats/);
    return match ? match[1] : "—";
  };

  const getDateTimeDisplay = () => {
    if (!formData.departureDate || !formData.departureTime) return "—";
    const date = new Date(
      `${formData.departureDate}T${formData.departureTime}`,
    );
    return date.toLocaleString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPriceDisplay = () => {
    if (!formData.basePrice) return "—";
    return `${formData.currency} ${parseFloat(formData.basePrice).toFixed(2)}`;
  };

  return (
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle className="text-lg">Flight Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
            <Plane className="w-4 h-4 text-gray-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500">Route</p>
            <p className="text-sm font-medium text-gray-900 mt-0.5 truncate">
              {getRouteDisplay()}
            </p>
          </div>
        </div>

        <Separator />

        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
            <Users className="w-4 h-4 text-gray-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500">Aircraft</p>
            <p className="text-sm font-medium text-gray-900 mt-0.5 truncate">
              {getAircraftDisplay()}
            </p>
          </div>
        </div>

        <Separator />

        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
            <Calendar className="w-4 h-4 text-gray-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500">Departure</p>
            <p className="text-sm font-medium text-gray-900 mt-0.5">
              {getDateTimeDisplay()}
            </p>
          </div>
        </div>

        <Separator />

        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
            <DollarSign className="w-4 h-4 text-gray-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500">Base Price</p>
            <p className="text-sm font-medium text-gray-900 mt-0.5">
              {getPriceDisplay()}
            </p>
          </div>
        </div>

        <Separator />

        <div className="bg-indigo-50 rounded-lg p-4 mt-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-indigo-600 font-medium">
                Estimated Seat Count
              </p>
              <p className="text-2xl font-semibold text-indigo-900 mt-1">
                {getSeatCount()}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
              <Users className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
