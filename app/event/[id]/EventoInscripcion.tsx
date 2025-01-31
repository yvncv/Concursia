'use client';

import { useState } from 'react';
import { Event } from "@/app/types/eventType";
import useAcademias from "@/app/hooks/useAcademias";
import { User } from '@/app/types/userType';
import useUsers from '@/app/hooks/useUsers';
import { Academy } from '@/app/types/academyType';

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

// Componente para el selector de academias con búsqueda
const AcademySelector = ({ onAcademySelect }: { onAcademySelect: (academyId: string) => void }) => {
  const { academias, loadingAcademias, errorAcademias } = useAcademias(); // Asegúrate de que saveAcademy esté disponible
  const [selectedAcademy, setSelectedAcademy] = useState<string>(''); // Para almacenar el nombre de la academia seleccionada
  const [searchQuery, setSearchQuery] = useState<string>(''); // Para el texto de búsqueda
  const [isNewAcademy, setIsNewAcademy] = useState<boolean>(false); // Para saber si el usuario está creando una nueva academia

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value); // Actualiza el texto de búsqueda
  };

  const handleAcademySelect = (academyId: string, academyName: string) => {
    setSelectedAcademy(academyName); // Actualiza el nombre de la academia seleccionada
    setSearchQuery(''); // Limpiamos el campo de búsqueda
    setIsNewAcademy(false); // Resetear la bandera de nueva academia
    onAcademySelect(academyId); // Notificamos al componente padre con el ID de la academia seleccionada
  };

  const handleSaveNewAcademy = () => {
    // Formatear el nombre de la academia (capitalizar palabras y eliminar espacios extra)
    const formattedAcademyName = searchQuery
      .replace(/\s+/g, ' ') // Eliminar espacios extra
      .replace(/(?:^|\s)\S/g, (char) => char.toUpperCase()); // Capitalizar la primera letra de cada palabra
    setSelectedAcademy(formattedAcademyName); // Muestra el nombre formateado en el campo
    setSearchQuery(''); // Limpiar el campo de búsqueda
    setIsNewAcademy(false); // Resetear la bandera de nueva academia
  };

  // Filtrar academias según el texto ingresado
  const filteredAcademies = academias.filter(academy =>
    academy.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full">
      <label htmlFor="academyId" className="block text-sm font-medium text-white">
        Academia
      </label>
      {loadingAcademias ? (
        <div className="mt-1 px-4 py-4 text-gray-500">Cargando academias...</div>
      ) : errorAcademias ? (
        <div className="mt-1 px-4 py-4 text-red-500">Error: {errorAcademias}</div>
      ) : (
        <div>
          <input
            id="academyId"
            type="text"
            value={searchQuery || selectedAcademy} // Muestra el texto de búsqueda si está activo, de lo contrario muestra el nombre de la academia seleccionada
            onChange={handleSearchChange}
            className="w-full mt-1 px-4 py-4 rounded-2xl bg-gray-200 placeholder:text-gray-600 focus:ring-0 focus:shadow-none transition-all outline-none"
            placeholder="Buscar academia"
          />
          {searchQuery && (
            <div className="w-full bg-white border mt-1 rounded-2xl shadow-lg overflow-y-auto">
              {filteredAcademies.length > 0 ? (
                filteredAcademies.map(academy => (
                  <div
                    key={academy.id}
                    className="px-4 py-3 hover:bg-gray-200 cursor-pointer"
                    onClick={() => handleAcademySelect(academy.id, academy.name)}
                  >
                    {academy.name}
                  </div>
                ))
              ) : (
                <div className="px-4 py-3 text-gray-500">
                  No se encontró la academia en nuestros registros.
                  <div
                    className="mt-2 text-blue-500 cursor-pointer"
                    onClick={() => setIsNewAcademy(true)}
                  >
                    ¿Quiere usar "{searchQuery}" como academia de todos modos?
                  </div>
                </div>
              )}
            </div>
          )}
          {isNewAcademy && (
            <div className="mt-2">
              <button
                onClick={handleSaveNewAcademy}
                className="px-4 py-2 bg-blue-600 text-white rounded-2xl"
              >
                Usar esta academia
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Componente para la selección de categoría
const CategorySelection = ({ event, onCategorySelect }: { event: Event, onCategorySelect: (category: string) => void }) => {
  if (!event?.settings?.categories) {
    return <p className="text-center text-gray-500">No hay categorías disponibles.</p>;
  }

  return (
    <div className="flex flex-wrap gap-4 p-4 justify-center">
      {event?.settings?.levels && Object.keys(event.settings.levels).length > 0 ? (
        Object.entries(event.settings.levels).map(([level]) => (
          <button
            key={level}
            onClick={() => onCategorySelect(level)}
            className="w-full md:w-1/4 h-fit text-center bg-gradient-to-r from-red-700 to-red-500 text-white py-4 px-6 rounded-lg hover:shadow-lg transition-all"
          >
            {level.charAt(0).toUpperCase() + level.slice(1)}
            {/* {level.charAt(0).toUpperCase() + level.slice(1)} {details.couple == true && (<span className='text-orange-200'>(Con Pareja)</span>)} */}
          </button>
        ))
      ) : (
        <p className="text-center text-gray-500">No hay niveles disponibles.</p>
      )}
    </div>
  );

};

const EventoInscripcion = ({ event, user }: { event: Event; user: User }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedEmail, setSelectedEmail] = useState(user.email[0] || "");
  const [selectedPhone, setSelectedPhone] = useState(user.phoneNumber?.[0] || "");
  const [selectedAcademy, setSelectedAcademy] = useState<string>("");
  const [dniPareja, setDniPareja] = useState('');
  const [pareja, setPareja] = useState<User | null>(null);
  const { users, loadingUsers, error } = useUsers();

  // Función para buscar el usuario por DNI
  const buscarPareja = () => {
    const parejaEncontrada = users.find((usuario) => usuario.dni === dniPareja);
    if (parejaEncontrada) {
      setPareja(parejaEncontrada);  // Establece los datos de la pareja si se encuentra
    } else {
      setPareja(null);  // Si no se encuentra, limpia el estado de la pareja
      alert("No se encontró ningún usuario con ese DNI.");
    }
  };

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
          <div className="p-4 bg-gradient-to-r from-red-500 to-red-800 rounded-2xl">
            <h3 className="text-xl font-semibold mb-4 text-white border-b">Datos del Participante</h3>
            <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Campos readonly */}
              {[
                { id: "dni", label: "DNI", value: user.dni, type: "text" },
                {
                  id: "birthDate",
                  label: "Fecha de Nacimiento",
                  value: user.birthDate.toDate().toISOString().split('T')[0],
                  type: "text"
                },
                { id: "firstName", label: "Nombres", value: user.firstName, type: "text" },
                { id: "lastName", label: "Apellido(s)", value: user.lastName, type: "text" },
                { id: "gender", label: "Género", value: user.gender, type: "text" },
                { id: "category", label: "Categoría", value: user.category, type: "text" },
                { id: "level", label: "Nivel", value: selectedCategory, type: "text" },
              ].map(({ id, label, value, type }) => (
                <div key={id} className="w-full">
                  <label htmlFor={id} className="block text-sm font-medium text-white">{label}</label>
                  <input
                    id={id}
                    type={type}
                    className="w-full mt-1 px-4 py-4 rounded-2xl bg-gray-100 placeholder:text-gray-600 focus:ring-0 focus:shadow-none transition-all outline-none"
                    placeholder={value}
                    readOnly
                  />
                </div>
              ))}

              <div className="w-full">
                <label htmlFor="email" className="block text-sm font-medium text-white">Correo de contacto</label>
                <select
                  required
                  id="email"
                  value={selectedEmail}
                  onChange={(e) => setSelectedEmail(e.target.value)}
                  className="w-full mt-1 px-4 py-4 rounded-2xl bg-gray-200 placeholder:text-gray-600 focus:ring-0 focus:shadow-none transition-all outline-none"
                >
                  {user.email.map((email: string, index: number) => (
                    <option key={index} value={email}>
                      {email}
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-full">
                <label htmlFor="phone" className="block text-sm font-medium text-white">Celular de contacto</label>
                <select
                  required
                  id="phoneNumber"
                  value={selectedPhone}
                  onChange={(e) => setSelectedPhone(e.target.value)}
                  className="w-full mt-1 px-4 py-4 rounded-2xl bg-gray-200 placeholder:text-gray-600 focus:ring-0 focus:shadow-none transition-all outline-none"
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

            <div className="w-full my-4 p-4 bg-gradient-to-r from-orange-600 to-orange-400 rounded-2xl">
              {/* Campos de la pareja */}
              <label htmlFor="dniPareja" className="block text-md font-medium text-white">DNI de la Pareja</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                <div className="w-full">
                  <input
                    required
                    id="dniPareja"
                    type="text"
                    value={dniPareja}
                    onChange={(e) => setDniPareja(e.target.value)}
                    className="w-full mt-1 px-4 py-3 rounded-2xl bg-gray-200 placeholder:text-gray-500 focus:ring-0 focus:shadow-none transition-all outline-none"
                    placeholder="Ingresa el DNI de la pareja"
                  />
                </div>
                <div className="w-full">
                  <button
                    type="button"
                    onClick={buscarPareja}
                    className="px-6 py-3 text-white rounded-2xl bg-gradient-to-r from-red-600 to-red-400 transition-all"
                  >
                    Buscar Pareja
                  </button>
                </div>
              </div>
            </div>


            {/* Mostrar datos de la pareja si se encuentra */}
            {pareja && (
              <>
                <h3 className="text-xl font-semibold mb-4 text-white border-b">Datos de la Pareja</h3>
                <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Campos readonly */}
                  {[
                    { id: "firstName", label: "Nombres", value: pareja.firstName, type: "text" },
                    { id: "lastName", label: "Apellido(s)", value: pareja.lastName, type: "text" },
                    {
                      id: "birthDate",
                      label: "Fecha de Nacimiento",
                      value: pareja.birthDate.toDate().toISOString().split('T')[0],
                      type: "text"
                    },
                    { id: "gender", label: "Género", value: pareja.gender, type: "text" },
                    { id: "category", label: "Categoría", value: pareja.category, type: "text" },
                    { id: "level", label: "Nivel", value: selectedCategory, type: "text" },
                  ].map(({ id, label, value, type }) => (
                    <div key={id} className="w-full">
                      <label htmlFor={id} className="block text-sm font-medium text-white">{label} de la pareja</label>
                      <input
                        id={id}
                        type={type}
                        className="w-full mt-1 px-4 py-4 rounded-2xl bg-gray-100 placeholder:text-gray-600 focus:ring-0 focus:shadow-none transition-all outline-none"
                        placeholder={value}
                        readOnly
                      />
                    </div>
                  ))}

                  <div className="w-full">
                    <label htmlFor="email" className="block text-sm font-medium text-white">Correo de contacto de la pareja</label>
                    <select
                      required
                      id="email"
                      value={selectedEmail}
                      onChange={(e) => setSelectedEmail(e.target.value)}
                      className="w-full mt-1 px-4 py-4 rounded-2xl bg-gray-200 placeholder:text-gray-600 focus:ring-0 focus:shadow-none transition-all outline-none"
                    >
                      {pareja.email.map((email: string, index: number) => (
                        <option key={index} value={email}>
                          {email}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="w-full">
                    <label htmlFor="phone" className="block text-sm font-medium text-white">Celular de contacto de la pareja</label>
                    <select
                      required
                      id="phoneNumber"
                      value={selectedPhone}
                      onChange={(e) => setSelectedPhone(e.target.value)}
                      className="w-full mt-1 px-4 py-4 rounded-2xl bg-gray-200 placeholder:text-gray-600 focus:ring-0 focus:shadow-none transition-all outline-none"
                    >
                      {pareja.phoneNumber.map((phoneNumber: string, index: number) => (
                        <option key={index} value={phoneNumber}>
                          {phoneNumber}
                        </option>
                      ))}
                    </select>
                  </div>
                  <AcademySelector onAcademySelect={handleAcademySelect} />
                </form>
              </>
            )}
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
