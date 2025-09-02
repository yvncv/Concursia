'use client';

import { useState } from 'react';
import { CustomEvent } from "@/app/types/eventType";
import useAcademy from "@/app/hooks/useAcademy";
import { User } from '@/app/types/userType';
import useUsers from '@/app/hooks/useUsers';
import useTicket from '@/app/hooks/useTicket';
import useCreateTicket from '@/app/hooks/tickets/useCreateTicket';
import { Ticket } from "@/app/types/ticketType";
import TicketComponent from './inscription/components/TicketComponent';
import InscriptionForm from './inscription/components/InscriptionForm';
import IzipayButton from '@/app/ui/payment/izipay-button';
import { findUserByHashedDni } from '@/app/utils/security/dni/findUserByHashedDni';
import { determineCategory } from "@/app/utils/category/determineCategory";
import { useGlobalCategories } from "@/app/hooks/useGlobalCategories";

// Componente para los pasos del wizard
const WizardSteps = ({ currentStep }: { currentStep: number }) => {
  const steps = [
    'Seleccionar Categoría',
    'Confirmar Datos',
    'Finalizar Inscripción'
  ];

  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-center md:mb-3 text-center">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center">
            <div className={`flex sm:ml-4 items-center justify-center w-6 h-6 rounded-full border-2 
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
  // Hook para categorías globales
  const { categorias } = useGlobalCategories();

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
  const [refreshKey, setRefreshKey] = useState(0);

  const { users } = useUsers();
  const { academy, loadingAcademy, errorAcademy } = useAcademy(event.academyId);
  const { tickets } = useTicket(event.id);

  // Hook para crear ticket
  const { createTicket, isCreating, error: createError, clearError } = useCreateTicket();

  // Función para obtener categoría de un usuario
  const getUserCategory = (user: User): string => {
    if (!user?.birthDate || categorias.length === 0) {
      return "Sin categoría";
    }
    
    return determineCategory(
      user.birthDate.toDate(),
      new Date(),
      categorias
    ) || "Categoría no encontrada";
  };

  // Función para buscar el usuario por DNI
  const buscarPareja = async () => {
    const parejaEncontrada = await findUserByHashedDni(dniPareja);

    if (!parejaEncontrada) {
      setPareja(null);
      return;
    }

    if (parejaEncontrada.id === user?.id) {
      alert("No puedes ser tu propia pareja.");
      setPareja(null);
      return;
    }

    if (parejaEncontrada.gender === user?.gender) {
      alert("La pareja debe tener un género diferente.");
      setPareja(null);
      return;
    }

    setPareja(parejaEncontrada);
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

  // Función para validar antes de proceder al pago
  const validateBeforePayment = (): boolean => {
    clearError();

    // Validaciones de pareja si es requerida
    if (event.settings?.pullCouple?.enabled && pareja != null) {
      if (pareja.gender === user?.gender) {
        alert("La pareja debe ser de género opuesto al tuyo.");
        return false;
      }

      const categories: string[] = ["Baby", "Pre-Infante", "Infante", "Infantil", "Junior", "Juvenil", "Adulto", "Senior", "Master", "Oro"];

      const checkAgeDifference = () => {
        const ageDifference = user?.birthDate.toDate().getFullYear() - pareja.birthDate.toDate().getFullYear();
        return ageDifference <= event.settings.pullCouple.difference;
      };

      const checkCategoryDifference = () => {
        // Obtener categorías dinámicamente
        const userCategory = getUserCategory(user!);
        const parejaCategory = getUserCategory(pareja);
        
        const userCategoryIndex = categories.indexOf(userCategory);
        const parejaCategoryIndex = categories.indexOf(parejaCategory);
        const categoryDifference = Math.abs(userCategoryIndex - parejaCategoryIndex);
        return categoryDifference <= event.settings.pullCouple.difference;
      };

      // Comparar categorías dinámicamente
      const userCategory = getUserCategory(user!);
      const parejaCategory = getUserCategory(pareja);

      if (userCategory !== parejaCategory) {
        if (event.settings.pullCouple.criteria === "Age") {
          if (!checkAgeDifference()) {
            alert("La diferencia de edad no es la correcta");
            return false;
          }
        } else {
          if (!checkCategoryDifference()) {
            alert("La diferencia de categoría no es la correcta");
            return false;
          }
        }
      }
    }

    return true;
  };

  // Función que se ejecuta después del pago exitoso - CORREGIDA
  const handlePaymentSuccess = async () => {
    console.log('=== INICIANDO PROCESO POST-PAGO ===');
    console.log('selectedAcademy:', selectedAcademy);
    console.log('selectedAcademyName:', selectedAcademyName);
    console.log('coupleSelectedAcademy:', coupleSelectedAcademy);
    console.log('coupleSelectedAcademyName:', coupleSelectedAcademyName);

    try {
      // Crear ticket después del pago exitoso
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

      console.log('Ticket creado con ID:', newTicketId);

      if (newTicketId) {
        setTicketId(newTicketId);
        setCurrentStep(2); // Avanzar al paso del ticket
        setRefreshKey(prev => prev + 1);
        console.log('✅ Avanzando a paso 2 - Mostrar ticket');
      } else {
        console.error('❌ Error: No se pudo crear el ticket');
        alert('Error al crear el ticket. Por favor, contacta al soporte.');
      }
    } catch (error) {
      console.error('❌ Error en handlePaymentSuccess:', error);
      alert('Error al procesar la inscripción. Por favor, contacta al soporte.');
    }
  };

  // Obtener el precio del nivel seleccionado
  const getSelectedLevelPrice = (): number => {
    if (!selectedCategory || !event?.dance?.levels) return 0;
    return event.dance.levels[selectedCategory]?.price || 0;
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      <WizardSteps currentStep={currentStep} />
      <div className="md:mt-2">
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
            getUserCategory={getUserCategory}
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
            getUserCategory={getUserCategory}
          />
        )}

        {/* Botones de navegación */}
        {currentStep === 1 && (
          <div className="flex justify-between py-6">
            <button
              onClick={() => setCurrentStep(s => s - 1)}
              className="px-6 py-2 bg-gray-200 rounded-lg"
              disabled={isCreating}
            >
              Anterior
            </button>
            
            {/* Botón de pago personalizado con validación y callback mejorado */}
            <div className="relative">
              {canProceed ? (
                <IzipayButton
                  levelName={selectedCategory}
                  price={getSelectedLevelPrice()}
                  eventId={event.id}
                  eventName={event.name}
                  refreshKey={refreshKey}
                  onGlobalRefresh={handlePaymentSuccess}
                  className="min-w-[200px]"
                  validateBeforePayment={validateBeforePayment}
                />
              ) : (
                <button
                  disabled={true}
                  className="px-6 py-2 rounded-lg text-white bg-gray-400 cursor-not-allowed min-w-[200px]"
                >
                  Completa los datos requeridos
                </button>
              )}
            </div>
          </div>
        )}

        {/* Mostrar errores si los hay */}
        {createError && (
          <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p><strong>Error:</strong> {createError}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventoInscripcion;