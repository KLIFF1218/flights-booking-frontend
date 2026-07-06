import { useEffect, useState } from "react";
import { X, Minus, Plus } from "lucide-react";

interface PassengerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (adults: number, children: number, infants: number) => void;
  existingAdults: number;
}

export function PassengerModal({
  isOpen,
  onClose,
  onConfirm,
  existingAdults,
}: PassengerModalProps) {
  const [adults, setAdults] = useState(0);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setAdults(0);
      setChildren(0);
      setInfants(0);
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    const totalAdults = existingAdults + adults;

    if (infants > totalAdults) {
      setError("Количество младенцев не может превышать количество взрослых");
      return;
    }

    setError(null);

    onConfirm(adults, children, infants);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-white/30"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-900">
            Добавьте пассажиров
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between py-4 border-b border-gray-100">
            <div>
              <div className="text-lg font-semibold text-gray-900">
                Взрослых
              </div>
              <div className="text-sm text-gray-500">Старше 12 лет</div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setAdults(Math.max(0, adults - 1))}
                className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-gray-300 text-gray-600 hover:border-gray-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                disabled={adults === 0}
              >
                <Minus size={20} />
              </button>
              <span className="text-xl font-medium text-gray-900 w-8 text-center">
                {adults}
              </span>
              <button
                onClick={() => setAdults(adults + 1)}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between py-4 border-b border-gray-100">
            <div>
              <div className="text-lg font-semibold text-gray-900">Детей</div>
              <div className="text-sm text-gray-500">От 2 до 12 лет</div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setChildren(Math.max(0, children - 1))}
                className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-gray-300 text-gray-600 hover:border-gray-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                disabled={children === 0}
              >
                <Minus size={20} />
              </button>
              <span className="text-xl font-medium text-gray-900 w-8 text-center">
                {children}
              </span>
              <button
                onClick={() => setChildren(children + 1)}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between py-4">
            <div>
              <div className="text-lg font-semibold text-gray-900">
                Младенцев
              </div>
              <div className="text-sm text-gray-500">До 2 лет, без места</div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setInfants(Math.max(0, infants - 1))}
                className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-gray-300 text-gray-600 hover:border-gray-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                disabled={infants === 0}
              >
                <Minus size={20} />
              </button>
              <span className="text-xl font-medium text-gray-900 w-8 text-center">
                {infants}
              </span>
              <button
                onClick={() => setInfants(infants + 1)}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm">
            {error}
          </div>
        )}

        <div className="p-6">
          <button
            onClick={handleConfirm}
            className="w-full bg-blue-400 text-white py-4 rounded-xl text-lg font-medium hover:bg-blue-500 transition-colors"
          >
            Добавить
          </button>
        </div>
      </div>
    </div>
  );
}
