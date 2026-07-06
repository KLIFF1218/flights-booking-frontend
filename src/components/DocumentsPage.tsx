'use client';

import { useState } from "react";
import { User } from "lucide-react";

interface SavedDocument {
  id: string;
  type: string;
  name: string;
  icon: "passport" | "user";
}

function SavedDocumentCard({ document }: { document: SavedDocument }) {
  return (
    <div className="flex flex-col items-center p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
        <User className="w-8 h-8 text-gray-400" />
      </div>
      <div className="text-xs text-gray-500 mb-1">{document.type}</div>
      <div className="text-sm font-medium text-gray-900">{document.name}</div>
    </div>
  );
}

export function DocumentsPage() {
  const [citizenship, setCitizenship] = useState("Россия");
  const [docType, setDocType] = useState("Паспорт РФ");
  const [gender, setGender] = useState<"M" | "F">("M");
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [patronymic, setPatronymic] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [docNumber, setDocNumber] = useState("");
  const [noPatronymic, setNoPatronymic] = useState(false);
  const [autoSave, setAutoSave] = useState(false);

  const savedDocuments: SavedDocument[] = [
    { id: "1", type: "Паспорт РФ", name: "Альмашева П.", icon: "passport" },
    { id: "2", type: "Документ", name: "Gadget F.", icon: "user" },
    { id: "3", type: "Документ", name: "Роренра П.", icon: "user" },
  ];

  const handleClearForm = () => {
    setLastName("");
    setFirstName("");
    setPatronymic("");
    setBirthDate("");
    setDocNumber("");
    setNoPatronymic(false);
  };

  return (
    <div className="flex-1">
      <h1 className="text-3xl font-bold mb-6">Документы</h1>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Сохранённые</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {savedDocuments.map((doc) => (
            <SavedDocumentCard key={doc.id} document={doc} />
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Новый документ</h2>
          <button
            onClick={handleClearForm}
            className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Очистить форму
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm text-gray-600 mb-2">Гражданство</label>
            <input
              type="text"
              value={citizenship}
              onChange={(e) => setCitizenship(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-2">Документ</label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option>Паспорт РФ</option>
              <option>Заграничный паспорт</option>
              <option>Свидетельство о рождении</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-2">Пол</label>
            <div className="flex gap-2">
              <button
                onClick={() => setGender("M")}
                className={`flex-1 px-4 py-2.5 border rounded-lg transition-colors ${
                  gender === "M"
                    ? "border-blue-500 bg-blue-50 text-blue-600"
                    : "border-gray-300 text-gray-700 hover:border-gray-400"
                }`}
              >
                М
              </button>
              <button
                onClick={() => setGender("F")}
                className={`flex-1 px-4 py-2.5 border rounded-lg transition-colors ${
                  gender === "F"
                    ? "border-blue-500 bg-blue-50 text-blue-600"
                    : "border-gray-300 text-gray-700 hover:border-gray-400"
                }`}
              >
                Ж
              </button>
            </div>
          </div>
        </div>

        <h3 className="font-semibold mb-4">Данные паспорта РФ</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <input
              type="text"
              placeholder="Фамилия"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <input
              type="text"
              placeholder="Имя"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <input
              type="text"
              placeholder="Отчество"
              value={patronymic}
              onChange={(e) => setPatronymic(e.target.value)}
              disabled={noPatronymic}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <input
              type="text"
              placeholder="Дата рождения"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <input
              type="text"
              placeholder="№ Документа"
              value={docNumber}
              onChange={(e) => setDocNumber(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center mb-6">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={noPatronymic}
              onChange={(e) => setNoPatronymic(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-600">В документе нет отчества</span>
          </label>
        </div>

        <button className="w-full sm:w-auto px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors mb-4">
          Добавить
        </button>

        <p className="text-xs text-gray-500 mb-6">
          Сохраняя документ вы соглашаетесь с{" "}
          <a href="#" className="text-blue-600 hover:underline">
            Политикой использования
          </a>{" "}
          и{" "}
          <a href="#" className="text-blue-600 hover:underline">
            Правилами конфиденциальности
          </a>
        </p>

        <div className="flex items-start justify-between pt-6 border-t border-gray-200">
          <div className="flex-1 pr-4">
            <h3 className="font-semibold mb-1">Сохранять данные пассажиров при покупке</h3>
            <p className="text-sm text-gray-500">
              Чтобы автоматически их заполнить и оформить билеты быстрее
            </p>
          </div>
          <button
            onClick={() => setAutoSave(!autoSave)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex-shrink-0 ${
              autoSave ? "bg-blue-600" : "bg-gray-300"
            }`}
            role="switch"
            aria-checked={autoSave}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                autoSave ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
