import { ArrowRight, Calendar, Users, Edit } from "lucide-react";

interface SearchSummaryProps {
  from: string;
  to: string;
  departureDate: string;
  returnDate: string;
  passengers: string;
}

export function SearchSummary({
  from,
  to,
  departureDate,
  returnDate,
  passengers,
}: SearchSummaryProps) {
  return (
    <div className="bg-white border-b border-gray-200 sticky top-[72px] z-50">
      <div className="max-w-[1200px] mx-auto px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-3">
              <span className="text-lg font-semibold text-gray-900">
                {from}
              </span>
              <ArrowRight className="w-5 h-5 text-gray-400" />
              <span className="text-lg font-semibold text-gray-900">{to}</span>
            </div>

            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>{departureDate}</span>
              <span>-</span>
              <span>{returnDate}</span>
            </div>

            <div className="flex items-center gap-2 text-gray-600">
              <Users className="w-4 h-4" />
              <span>{passengers}</span>
            </div>
          </div>

          <button className="flex items-center gap-2 px-6 py-2.5 border border-blue-600 text-blue-600 rounded-xl hover:bg-blue-50 transition">
            <Edit className="w-4 h-4" />
            Modify Search
          </button>
        </div>
      </div>
    </div>
  );
}
