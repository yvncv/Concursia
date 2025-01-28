'use client';

import { useState } from 'react';
import { Event } from "@/app/types/eventType";
import useAcademias from "@/app/hooks/useAcademias";

// Componente para los pasos del wizard
const WizardSteps = ({ currentStep }: { currentStep: number }) => {
  const steps = [
    'Seleccionar Categoría',
    'Confirmar Datos',
    'Finalizar Inscripción'
  ];

  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-center mb-8">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 
              ${currentStep >= index
                ? 'border-red-600 bg-red-600 text-white'
                : 'border-gray-300 text-gray-300'
              }`}>
              {index + 1}
            </div>
            <div className={`hidden sm:block ml-2 mr-8 text-sm 
              ${currentStep >= index ? 'text-gray-900' : 'text-gray-400'}`}>
              {step}
            </div>
            {index < steps.length - 1 && (
              <div className={`w-12 h-1 sm:w-20 mx-2 
                ${currentStep > index ? 'bg-red-600' : 'bg-gray-300'}`}>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const AcademySelector = ({ onAcademySelect }: { onAcademySelect: (academyId: string) => void }) => {
  const { academias, loadingAcademias, errorAcademias } = useAcademias();
  const [selectedAcademy, setSelectedAcademy] = useState<string>("");

  const handleAcademyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    setSelectedAcademy(selectedId);
    onAcademySelect(selectedId); // Notificamos al componente padre la academia seleccionada
  };

  return (
    <div className="w-full">
      <label htmlFor="academyId" className="block text-sm font-medium text-gray-700">
        Academia
      </label>
      {loadingAcademias ? (
        <div className="mt-1 px-4 py-4 text-gray-500">Cargando academias...</div>
      ) : errorAcademias ? (
        <div className="mt-1 px-4 py-4 text-red-500">Error: {errorAcademias}</div>
      ) : (
        <select
          id="academyId"
          value={selectedAcademy}
          onChange={handleAcademyChange}
          className="w-full mt-1 px-4 py-4 rounded-2xl bg-gray-200 placeholder:text-gray-500 focus:ring-0 focus:shadow-none transition-all outline-none"
        >
          <option value="" disabled>
            Selecciona una academia
          </option>
          {academias.map((academy) => (
            <option key={academy.id} value={academy.id}>
              {academy.name}
            </option>
          ))}
        </select>
      )}
    </div>
  );
};


// Componente para la selección de categoría
const CategorySelection = ({ event, onCategorySelect }: { event: Event, onCategorySelect: (category: string) => void }) => {
  return (
    <div className="flex flex-wrap gap-4 p-4 justify-center">
      {Object.entries(event.settings.levels).map(([level]) => (
        <button
          key={level}
          onClick={() => onCategorySelect(level)}
          className="w-full md:w-1/4 h-fit text-center bg-gradient-to-r from-red-700 to-red-500 text-white py-4 px-6 rounded-lg hover:shadow-lg transition-all"
        >
          {level.charAt(0).toUpperCase() + level.slice(1)}
        </button>
      ))}
    </div>
  );
};

const EventoInscripcion = ({ event, user }: { event: Event; user: any }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedEmail, setSelectedEmail] = useState(user.email[0] || "");
  const [selectedPhone, setSelectedPhone] = useState(user.phoneNumber?.[0] || "");
  const [selectedAcademy, setSelectedAcademy] = useState<string>("");

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setCurrentStep(1); // Avanza al siguiente paso
  };

  const handleAcademySelect = (academyId: string) => {
    setSelectedAcademy(academyId); // Guardamos la academia seleccionada
  };

  const handleNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, 2));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1));
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      <WizardSteps currentStep={currentStep} />
      <div className="mt-2">
        {currentStep === 0 && event && (
          <CategorySelection
            event={event}
            onCategorySelect={handleCategorySelect}
          />
        )}
        {currentStep === 1 && (
          <div className="p-4">
            <h3 className="text-xl font-semibold mb-4">Confirmar tus datos</h3>
            <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Campos readonly */}
              <div className="w-full">
                <label htmlFor="dni" className="block text-sm font-medium text-gray-700">DNI</label>
                <input
                  type="text"
                  className="w-full mt-1 px-4 py-4 rounded-2xl bg-gray-200 placeholder:text-gray-500 focus:ring-0 focus:shadow-none transition-all outline-none"
                  value={user.dni}
                  readOnly
                />
              </div>
              <div className="w-full">
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">Nombres</label>
                <input
                  type="text"
                  className="w-full mt-1 px-4 py-4 rounded-2xl bg-gray-200 placeholder:text-gray-500 focus:ring-0 focus:shadow-none transition-all outline-none"
                  value={user.firstName}
                  readOnly
                />
              </div>
              <div className="w-full">
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Apellido(s)</label>
                <input
                  type="text"
                  className="w-full mt-1 px-4 py-4 rounded-2xl bg-gray-200 placeholder:text-gray-500 focus:ring-0 focus:shadow-none transition-all outline-none"
                  value={user.lastName}
                  readOnly
                />
              </div>
              <div className="w-full">
                <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700">Fecha de Nacimiento</label>
                <input
                  type="date"
                  className="w-full mt-1 px-4 py-4 rounded-2xl bg-gray-200 placeholder:text-gray-500 focus:ring-0 focus:shadow-none transition-all outline-none"
                  value={user.birthDate.toDate().toISOString().split('T')[0]}
                  readOnly
                />
              </div>
              <div className="w-full">
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Género</label>
                <input
                  type="text"
                  className="w-full mt-1 px-4 py-4 rounded-2xl bg-gray-200 placeholder:text-gray-500 focus:ring-0 focus:shadow-none transition-all outline-none"
                  value={user.gender}
                  readOnly
                />
              </div>
              <div className="w-full">
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">Categoría</label>
                <input
                  type="text"
                  className="w-full mt-1 px-4 py-4 rounded-2xl bg-gray-200 placeholder:text-gray-500 focus:ring-0 focus:shadow-none transition-all outline-none"
                  value={user.category}
                  readOnly
                />
              </div>
              <div className="w-full">
                <label htmlFor="level" className="block text-sm font-medium text-gray-700">Nivel</label>
                <input
                  type="text"
                  className="w-full mt-1 px-4 py-4 rounded-2xl bg-gray-200 placeholder:text-gray-500 focus:ring-0 focus:shadow-none transition-all outline-none"
                  value={selectedCategory}
                  readOnly
                />
              </div>
              <div className="w-full">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Correo de contacto</label>
                <select
                  id="email"
                  value={selectedEmail}
                  onChange={(e) => setSelectedEmail(e.target.value)}
                  className="w-full mt-1 px-4 py-4 rounded-2xl bg-gray-200 placeholder:text-gray-500 focus:ring-0 focus:shadow-none transition-all outline-none"
                >
                  {user.email.map((email: string, index: number) => (
                    <option key={index} value={email}>
                      {email}
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-full">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Celular de contacto</label>
                <select
                  id="phoneNumber"
                  value={selectedPhone}
                  onChange={(e) => setSelectedPhone(e.target.value)}
                  className="w-full mt-1 px-4 py-4 rounded-2xl bg-gray-200 placeholder:text-gray-500 focus:ring-0 focus:shadow-none transition-all outline-none"
                >
                  {user.phoneNumber.map((phoneNumber: string, index: number) => (
                    <option key={index} value={phoneNumber}>
                      {phoneNumber}
                    </option>
                  ))}
                </select>
              </div>
              <AcademySelector onAcademySelect={handleAcademySelect} />
            </form>
          </div>
        )}

        {currentStep === 2 && (
          <div className="p-4">
            <h3 className="text-xl font-semibold mb-4">Finalizar Inscripción</h3>
            {/* Aquí irá el resumen y confirmación final */}
          </div>
        )}
        <div className="flex justify-between mt-8 px-4 pb-4">
          {currentStep > 0 && (
            <button
              onClick={handleBack}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all"
            >
              Atrás
            </button>
          )}
          {currentStep < 2 && currentStep !== 0 && (
            <button
              onClick={handleNext}
              className="ml-auto px-6 py-2 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-lg hover:from-red-500 hover:to-red-400 transition-all"
            >
              Siguiente
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventoInscripcion;