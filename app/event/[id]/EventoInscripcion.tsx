'use client';

import { useState } from 'react';
import { CustomEvent } from "@/app/types/eventType";
import useAcademy from "@/app/hooks/useAcademy";
import { User } from '@/app/types/userType';
import useUsers from '@/app/hooks/useUsers';
import { Timestamp } from "firebase/firestore";
import useTicket from '@/app/hooks/useTicket';
import { Ticket, TicketEntry } from "@/app/types/ticketType";
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

const EventoInscripcion = ({ event, openModal, user }:
  {
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
  const [coupleSelectedAcademy, setCoupleSelectedAcademy] = useState<string>(''); // Define el estado para la academia de la pareja
  const [coupleSelectedAcademyName, setCoupleSelectedAcademyName] = useState<string>('');
  const [dniPareja, setDniPareja] = useState('');
  const [pareja, setPareja] = useState<User | null>(null);
  const [ticketId, setTicketId] = useState<string | null>(null);
  const { users } = useUsers();
  const { saveTicket } = useTicket('');
  const { academy, loadingAcademy, errorAcademy } = useAcademy(event.academyId);
  const { tickets } = useTicket(event.id); // Obtener los tickets
  const [isCoupleRequired, setIsCoupleRequired] = useState(false);
  const [canProceed, setCanProceed] = useState(false);

  // Función para buscar el usuario por DNI
  const buscarPareja = () => {
    const parejaEncontrada = users.find((usuario) => usuario.dni === dniPareja);

    if (parejaEncontrada) {
      if (parejaEncontrada.id === user?.id) {
        setPareja(null);
        //alert("No puedes inscribirte como tu propia pareja.");
      } else if (parejaEncontrada.gender === user?.gender) {
        setPareja(null);
        //alert("El usuario con ese DNI es del mismo sexo que usted.");
      } else {
        setPareja(parejaEncontrada);
        //alert("Pareja encontrada satisfactoriamente.");
      }
    } else {
      setPareja(null);
      //alert("No se encontró ningún usuario con ese DNI.");
    }
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setIsCoupleRequired(event.dance.levels[category]?.couple || false); // Actualiza el estado de isCoupleRequired usando la nueva estructura
    setCurrentStep(1); // Avanza al siguiente paso
  };

  const handleAcademySelect = (academyId: string, academyName: string) => {
    setSelectedAcademy(academyId); // Guardamos la academia seleccionada
    setSelectedAcademyName(academyName); // Guardamos el nombre de la academia seleccionada
  };

  const handleCambiarPareja = () => {
    setPareja(null);
    setDniPareja('');            // si lo guardas aquí, o bien pásalo al form
    setCanProceed(false);
  };

  const handleCoupleAcademySelect = (academyId: string, academyName: string) => {
    setCoupleSelectedAcademy(academyId); // Guardamos la academia seleccionada para la pareja
    setCoupleSelectedAcademyName(academyName)
  };

  const handleNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, 2));
  };

  // Modificar la función handleSave para usar la nueva estructura de Ticket
  const handleSave = async () => {
    // Crear la entrada para el ticket
    const entry: TicketEntry = {
      usersId: pareja ? [user?.id, pareja.id] : [user?.id],
      academiesId: pareja ? [selectedAcademy, coupleSelectedAcademy] : [selectedAcademy],
      category: user?.marinera?.participant?.category,
      level: selectedCategory,
      amount: Number(event.dance.levels[selectedCategory]?.price) || 0, // Usar la nueva estructura
    };

    // Crear fecha de expiración (por ejemplo, 48 horas después)
    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + 48);

    const ticketData: Omit<Ticket, 'id'> = {
      status: 'Pendiente',
      eventId: event.id,
      registrationDate: Timestamp.fromDate(new Date()),
      expirationDate: Timestamp.fromDate(expirationDate),
      inscriptionType: 'Individual',
      totalAmount: entry.amount,
      entries: [entry],
      createdBy: user?.id,
      level: entry.level,  // Asegúrate de que `entry.level` esté definido correctamente
      category: entry.category,  // Asegúrate de que `entry.category` esté definido correctamente
      usersId: pareja ? [user?.id, pareja.id] : [user?.id],  // Asegúrate de que `user?.id` esté definido correctamente
      academiesName: [selectedAcademyName, coupleSelectedAcademyName],  // Asegúrate de que `event.academyName` esté disponible
    };

    try {
      const docRef = await saveTicket(ticketData);
      if (docRef) {
        setTicketId(docRef.id);
      } else {
        console.error('Error: docRef is undefined');
        alert('Failed to save ticket.');
      }
    } catch (error) {
      console.error('Error saving ticket:', error);
      alert('Failed to save ticket.');
    }
  };

  const categories: string[] = ["Baby", "Pre-Infante", "Infante", "Infantil", "Junior", "Juvenil", "Adulto", "Senior", "Master", "Oro"];

  const handleNextAndSave = () => {
    if (event.settings?.pullCouple?.enabled && pareja != null) {
      // → Validación de género diferente
      if (pareja.gender === user?.gender) {
        alert("La pareja debe ser de género opuesto al tuyo.");
        return;
      }

      alert("Pareja encontrada");

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

      if (user?.marinera?.participant?.category === pareja.marinera?.participant?.category) {
        alert("Las categorías coinciden");
        handleNext();
        handleSave();
      } else {
        if (event.settings.pullCouple.criteria === "Age") {
          if (checkAgeDifference()) {
            handleNext();
            handleSave();
          } else {
            alert("La diferencia de edad no es la correcta");
          }
        } else {
          if (checkCategoryDifference()) {
            handleNext();
            handleSave();
          } else {
            alert("La diferencia de categoría no es la correcta");
          }
        }
      }
    } else {
      handleNext();
      handleSave();
    }
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
        {currentStep == 1 && (
          <div className="flex justify-between py-6">
            <button
              onClick={() => setCurrentStep(s => s - 1)}
              className="px-6 py-2 bg-gray-200 rounded-lg"
            >
              Anterior
            </button>
            <button
              disabled={!canProceed}
              onClick={handleNextAndSave}
              className={`px-6 py-2 rounded-lg text-white ${canProceed
                ? 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400'
                : 'bg-gray-400 cursor-not-allowed'
                }`}
            >
              Guardar Inscripción
            </button>
          </div>
        )}


      </div>
    </div>
  );
};

export default EventoInscripcion;