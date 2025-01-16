'use client';

import { useState } from 'react';

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

// Componente para la selección de categoría
const CategorySelection = ({ onCategorySelect }: { onCategorySelect: (category: string) => void }) => {
  return (
    <div className="flex flex-wrap gap-4 p-4 justify-center">
      <button 
        onClick={() => onCategorySelect('Seriado')}
        className="w-full md:w-1/4 h-fit text-center bg-gradient-to-r from-red-500 to-pink-500 text-white py-4 px-6 rounded-lg hover:shadow-lg transition-all">
        Seriado
      </button>
      <button 
        onClick={() => onCategorySelect('Individual')}
        className="w-full md:w-1/4 h-fit text-center bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-4 px-6 rounded-lg hover:shadow-lg transition-all">
        Individual
      </button>
      <button 
        onClick={() => onCategorySelect('Novel Novel')}
        className="w-full md:w-1/4 h-fit text-center bg-gradient-to-r from-green-500 to-teal-500 text-white py-4 px-6 rounded-lg hover:shadow-lg transition-all">
        Novel Novel
      </button>
      <button 
        onClick={() => onCategorySelect('Novel Abierto A')}
        className="w-full md:w-1/4 h-fit text-center bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-4 px-6 rounded-lg hover:shadow-lg transition-all">
        Novel Abierto A
      </button>
      <button 
        onClick={() => onCategorySelect('Novel Abierto B')}
        className="w-full md:w-1/4 h-fit text-center bg-gradient-to-r from-purple-500 to-indigo-500 text-white py-4 px-6 rounded-lg hover:shadow-lg transition-all">
        Novel Abierto B
      </button>
      <button 
        onClick={() => onCategorySelect('Nacional')}
        className="w-full md:w-1/4 h-fit text-center bg-gradient-to-r from-gray-500 to-black text-white py-4 px-6 rounded-lg hover:shadow-lg transition-all">
        Nacional
      </button>
    </div>
  );
};

const EventoInscripcion = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setCurrentStep(1); // Avanza al siguiente paso
  };

  const handleNext = () => {
    setCurrentStep(prev => Math.min(prev + 1, 2));
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      <WizardSteps currentStep={currentStep} />
      
      <div className="mt-8">
        {currentStep === 0 && (
          <CategorySelection onCategorySelect={handleCategorySelect} />
        )}

        {currentStep === 1 && (
          <div className="p-4">
            <h3 className="text-xl font-semibold mb-4">Confirmar Datos</h3>
            <p className="mb-4">Categoría seleccionada: <span className="font-semibold">{selectedCategory}</span></p>
            {/* Aquí irá tu formulario de confirmación de datos */}
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