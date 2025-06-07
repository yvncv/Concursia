'use client';

import { useState } from 'react';
import { CustomEvent } from "@/app/types/eventType";
import useAcademy from "@/app/hooks/useAcademy";
import { User } from '@/app/types/userType';
import useUsers from '@/app/hooks/useUsers';
import useTicket from '@/app/hooks/useTicket';
import useCreateTicket from '@/app/hooks/tickets/useCreateTicket'; // ← NUEVO HOOK
import { Ticket } from "@/app/types/ticketType";
import TicketComponent from './inscription/components/TicketComponent';
import InscriptionForm from './inscription/components/InscriptionForm';

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
const CategorySelection = ({ event, onCategorySelect, user, tickets }: {
  event: CustomEvent,
  onCategorySelect: (category: string) => void,
  user: User,
  tickets: Ticket[]
}) => {
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const checkExistingTicket = (level: string) => {
    const existingTicket = tickets.find(ticket =>
      ticket.eventId === event.id &&
      Array.isArray(ticket.entries) &&
      ticket.entries.some(entry =>
        entry.level === level &&
        entry.usersId.includes(user?.id)
      )
    );

    if (existingTicket) {
      setAlertMessage(`Ya tienes un ticket para ${level} en este evento.`);
      return false;
    }
    return true;
  };

  return (
    <div className="justify-center">
      {alertMessage && (
        <div className="bg-red-600 text-white p-4 rounded-lg mb-4 text-center">
          <p>{alertMessage}</p>
        </div>
      )}
      <div className="flex flex-wrap gap-4 p-4 justify-center">
        {event?.dance?.levels && Object.keys(event.dance.levels).length > 0 ? (
          Object.entries(event.dance.levels).map(([level]) => (
            <button
              key={level}
              onClick={() => {
                if (checkExistingTicket(level)) {
                  onCategorySelect(level);
                }
              }}
              className="w-full md:w-1/4 h-fit text-center bg-gradient-to-r from-red-700 to-red-500 text-white py-4 px-6 rounded-lg hover:shadow-lg transition-all"
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </button>
          ))
        ) : (
          <p className="text-center text-gray-500">No hay niveles disponibles.</p>
        )}
      </div>
    </div>
  );
};

const EventoInscripcion = ({ event, openModal, user }: {
  event: CustomEvent,
  openModal: () => void,
  user: User
}) => {

  const [currentStep, setCurrentStep] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedEmail, setSelectedEmail] = useState(user?.email[0] || "");
  const [selectedPhone, setSelectedPhone] = useState(user?.phoneNumber?.[0] || "");
  const [selectedAcademy, setSelectedAcademy] = useState<string>('');
  const [selectedAcademyName, setSelectedAcademyName] = useState<string>('');
  const [coupleSelectedAcademy, setCoupleSelectedAcademy] = useState<string>('');
  const [coupleSelectedAcademyName, setCoupleSelectedAcademyName] = useState<string>('');
  const [dniPareja, setDniPareja] = useState('');
  const [pareja, setPareja] = useState<User | null>(null);
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [isCoupleRequired, setIsCoupleRequired] = useState(false);
  const [canProceed, setCanProceed] = useState(false);

  const { users } = useUsers();
  const { academy, loadingAcademy, errorAcademy } = useAcademy(event.academyId);
  const { tickets } = useTicket(event.id);

  // ← USAR EL NUEVO HOOK
  const { createTicket, isCreating, error: createError, clearError } = useCreateTicket();

  // Función para buscar el usuario por DNI
  const buscarPareja = () => {
    const parejaEncontrada = users.find((usuario) => usuario.dni === dniPareja);

    if (parejaEncontrada) {
      if (parejaEncontrada.id === user?.id) {
        setPareja(null);
      } else if (parejaEncontrada.gender === user?.gender) {
        setPareja(null);
      } else {
        setPareja(parejaEncontrada);
      }
    } else {
      setPareja(null);
    }
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setIsCoupleRequired(event.dance.levels[category]?.couple || false);
    setCurrentStep(1);
  };

  const handleAcademySelect = (academyId: string, academyName: string) => {
    setSelectedAcademy(academyId);
    setSelectedAcademyName(academyName);
  };

  const handleCambiarPareja = () => {
    setPareja(null);
    setDniPareja('');
    setCanProceed(false);
  };

  const handleCoupleAcademySelect = (academyId: string, academyName: string) => {
    setCoupleSelectedAcademy(academyId);
    setCoupleSelectedAcademyName(academyName);
  };

  // ← FUNCIÓN PRINCIPAL MODIFICADA
  const handleNextAndSave = async () => {
    clearError();

    // Validaciones de pareja si es requerida
    if (event.settings?.pullCouple?.enabled && pareja != null) {
      if (pareja.gender === user?.gender) {
        alert("La pareja debe ser de género opuesto al tuyo.");
        return;
      }

      const categories: string[] = ["Baby", "Pre-Infante", "Infante", "Infantil", "Junior", "Juvenil", "Adulto", "Senior", "Master", "Oro"];

      const checkAgeDifference = () => {
        const ageDifference = user?.birthDate.toDate().getFullYear() - pareja.birthDate.toDate().getFullYear();
        return ageDifference <= event.settings.pullCouple.difference;
      };

      const checkCategoryDifference = () => {
        const userCategoryIndex = categories.indexOf(user?.marinera?.participant?.category);
        const parejaCategoryIndex = categories.indexOf(pareja.marinera?.participant?.category);
        const categoryDifference = Math.abs(userCategoryIndex - parejaCategoryIndex);
        return categoryDifference <= event.settings.pullCouple.difference;
      };

      if (user?.marinera?.participant?.category !== pareja.marinera?.participant?.category) {
        if (event.settings.pullCouple.criteria === "Age") {
          if (!checkAgeDifference()) {
            alert("La diferencia de edad no es la correcta");
            return;
          }
        } else {
          if (!checkCategoryDifference()) {
            alert("La diferencia de categoría no es la correcta");
            return;
          }
        }
      }
    }

    console.log('=== VALORES ANTES DE CREAR TICKET ===');
    console.log('selectedAcademy:', selectedAcademy);
    console.log('selectedAcademyName:', selectedAcademyName);
    console.log('coupleSelectedAcademy:', coupleSelectedAcademy);
    console.log('coupleSelectedAcademyName:', coupleSelectedAcademyName);
    console.log('====================================');

    // ← CREAR TICKET CON EL NUEVO HOOK
    const newTicketId = await createTicket({
      event,
      user,
      pareja,
      selectedCategory,
      selectedAcademy,
      selectedAcademyName,
      coupleSelectedAcademy,
      coupleSelectedAcademyName,
    });

    if (newTicketId) {
      setTicketId(newTicketId);
      setCurrentStep(2);
    }
    // Si hay error, ya lo maneja el hook automáticamente
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      <WizardSteps currentStep={currentStep} />

      {/* Mostrar error si existe */}
      {createError && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {createError}
            </div>
            <button
              onClick={clearError}
              className="text-sm underline hover:no-underline"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div className="mt-2">
        {currentStep === 0 && event && (
          <CategorySelection
            event={event}
            onCategorySelect={handleCategorySelect}
            user={user}
            tickets={tickets}
          />
        )}

        {currentStep === 1 && (
          <InscriptionForm
            user={user}
            isCoupleRequired={isCoupleRequired}
            pareja={pareja}
            onResetPareja={handleCambiarPareja}
            selectedEmail={selectedEmail}
            setSelectedEmail={setSelectedEmail}
            selectedPhone={selectedPhone}
            setSelectedPhone={setSelectedPhone}
            dniPareja={dniPareja}
            setDniPareja={setDniPareja}
            buscarPareja={buscarPareja}
            handleAcademySelect={handleAcademySelect}
            handleCoupleAcademySelect={handleCoupleAcademySelect}
            onCanProceedChange={setCanProceed}
          />
        )}

        {currentStep === 2 && (
          <TicketComponent
            event={event}
            user={user}
            academy={academy}
            ticketId={ticketId}
            loadingAcademy={loadingAcademy}
            errorAcademy={errorAcademy}
            openModal={openModal}
          />
        )}

        {/* Botones de navegación */}
        {currentStep === 1 && (
          <div className="flex justify-between mt-6">
            <button
              onClick={() => setCurrentStep(s => s - 1)}
              className="px-6 py-2 bg-gray-200 rounded-lg"
              disabled={isCreating}
            >
              Anterior
            </button>
            <button
              disabled={!canProceed || isCreating}
              onClick={handleNextAndSave}
              className={`px-6 py-2 rounded-lg text-white flex items-center ${canProceed && !isCreating
                  ? 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400'
                  : 'bg-gray-400 cursor-not-allowed'
                }`}
            >
              {isCreating ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creando...
                </>
              ) : (
                'Guardar Inscripción'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventoInscripcion;