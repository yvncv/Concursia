'use client';

import {useEffect, useState} from 'react';
import { CustomEvent } from "@/app/types/eventType";
import useAcademies from "@/app/hooks/useAcademies";
import useAcademy from "@/app/hooks/useAcademy";
import { User } from '@/app/types/userType';
import useUsers from '@/app/hooks/useUsers';

import {Timestamp} from "firebase/firestore";
import useTicket from '@/app/hooks/useTicket';
import {Ticket} from "@/app/types/ticketType";
import {Map as MapIcon} from "lucide-react";
import Link from "next/link";
import {EventSettings} from "@/app/types/settingsType";

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
const AcademySelector = ({ onAcademySelect, initialAcademyId, initialAcademyName }: { onAcademySelect: (academyId: string, academyName: string) => void, initialAcademyId: string, initialAcademyName: string }) => {
  const { academies, loadingAcademies, errorAcademies } = useAcademies();
  const [selectedAcademyName, setSelectedAcademyName] = useState<string>(initialAcademyName || 'Libre');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isNewAcademy, setIsNewAcademy] = useState<boolean>(false);

  useEffect(() => {
    onAcademySelect(initialAcademyId, initialAcademyName);
  }, [initialAcademyId, initialAcademyName, onAcademySelect]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleAcademySelect = (academyId: string, academyName: string) => {
    setSelectedAcademyName(academyName);
    setSearchQuery('');
    setIsNewAcademy(false);
    onAcademySelect(academyId, academyName);
  };

  const handleSaveNewAcademy = (academyName: string) => {
    const formattedAcademyName = searchQuery
        .replace(/\s+/g, ' ')
        .replace(/(?:^|\s)\S/g, (char) => char.toUpperCase());
    setSelectedAcademyName(formattedAcademyName);
    setSearchQuery('');
    setIsNewAcademy(false);
    onAcademySelect('', academyName);
  };

  const handleResetAcademy = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setSelectedAcademyName('Libre');
    setSearchQuery('');
    setIsNewAcademy(false);
    onAcademySelect('', 'Libre');
  };

  const filteredAcademies = academies.filter(academy =>
      academy.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
      <div className="w-full">
        <label htmlFor="academyId" className="block text-sm font-medium text-white">
          Academia
        </label>
        {loadingAcademies ? (
            <div className="mt-1 px-4 py-4 text-gray-500">Cargando academias...</div>
        ) : errorAcademies ? (
            <div className="mt-1 px-4 py-4 text-red-500">Error: {errorAcademies}</div>
        ) : (
            <div>
              <input
                  id="academyId"
                  type="text"
                  value={searchQuery}
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
                            ¿Quiere usar {`"${searchQuery}"`} como academia de todos modos?
                          </div>
                        </div>
                    )}
                  </div>
              )}
              {isNewAcademy && (
                  <div className="mt-2">
                    <button
                        onClick={() => handleSaveNewAcademy(searchQuery)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-2xl"
                    >
                      Usar esta academia
                    </button>
                  </div>
              )}
              <div className="mt-2">
                <button
                    onClick={handleResetAcademy}
                    className="px-4 py-2 bg-gray-600 text-white rounded-2xl"
                >
                  Reinciar a Libre
                </button>
              </div>
              <div className="mt-2 text-white">
                Academia seleccionada: {selectedAcademyName}
              </div>
            </div>
        )}
      </div>
  );
};

// Componente para la selección de categoría
const CategorySelection = ({ event, onCategorySelect, user, tickets }: { event: CustomEvent, onCategorySelect: (category: string) => void, user: User, tickets: Ticket[] }) => {
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const checkExistingTicket = (level: string) => {
    const existingTicket = tickets.find(ticket =>
        ticket.usersId[0] === user.id &&
        ticket.eventId === event.id &&
        ticket.level === level
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
          {event?.settings?.levels && Object.keys(event.settings.levels).length > 0 ? (
              Object.entries(event.settings.levels).map(([level]) => (
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

const EventoInscripcion = ({ event, openModal, user, settings }:
                               {
                                 event: CustomEvent,
                                 openModal: () => void,
                                 user: User,
                                 settings: EventSettings| null
                                 }) =>
{

  const [currentStep, setCurrentStep] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedEmail, setSelectedEmail] = useState(user.email[0] || "");
  const [selectedPhone, setSelectedPhone] = useState(user.phoneNumber?.[0] || "");
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
  const iconClass = "w-6 h-6";

  // Función para buscar el usuario por DNI
  const buscarPareja = () => {
    const parejaEncontrada = users.find((usuario) => usuario.dni === dniPareja);

    if (parejaEncontrada) {
      if (parejaEncontrada.id === user.id) {
        setPareja(null);
        //alert("No puedes inscribirte como tu propia pareja.");
      } else if (parejaEncontrada.gender === user.gender) {
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
    setCurrentStep(1); // Avanza al siguiente paso
  };

  const handleAcademySelect = (academyId: string, academyName:string) => {
    setSelectedAcademy(academyId); // Guardamos la academia seleccionada
    setSelectedAcademyName(academyName); // Guardamos el nombre de la academia seleccionada
  };

  const handleCoupleAcademySelect = (academyId: string, academyName:string) => {
    setCoupleSelectedAcademy(academyId); // Guardamos la academia seleccionada para la pareja
    setCoupleSelectedAcademyName(academyName)
  };

  const handleNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, 2));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1));
  };

  const isCoupleRequired = event.settings.levels[selectedCategory]?.couple;

  const handleSave = async () => {
    const ticketData: Omit<Ticket, 'id'|'paymentDate'> = {
      status: 'Pendiente',
      usersId: pareja ? [user.id, pareja.id] : [user.id],
      academiesId: pareja ? [selectedAcademy, coupleSelectedAcademy] : [selectedAcademy],
      academiesName: pareja ? [selectedAcademyName, coupleSelectedAcademyName] : [selectedAcademyName],
      eventId: event.id,
      category: user.category,
      level: selectedCategory,
      registrationDate: Timestamp.fromDate(new Date()), // Usa la fecha actual para la inscripción
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
    if (settings != null && settings.pullCouple.enabled && pareja != null) {
      alert("Settings ON: Jalar Pareja ON - Pareja encontrada");

      const checkAgeDifference = () => {
        const ageDifference = user.birthDate.toDate().getFullYear() - pareja.birthDate.toDate().getFullYear();
        return ageDifference <= settings.pullCouple.difference;
      };

      const checkCategoryDifference = () => {
        const userCategoryIndex = categories.indexOf(user.category);
        const parejaCategoryIndex = categories.indexOf(pareja.category);
        const categoryDifference = Math.abs(userCategoryIndex - parejaCategoryIndex);
        return categoryDifference <= settings.pullCouple.difference;
      };

      if (user.category === pareja.category) {
        alert("Las categorías coinciden");
        handleNext();
        handleSave();
      } else {
        if (settings.pullCouple.criteria === "Age") {
          if (checkAgeDifference()) {
            {/*
            handleNext();
            handleSave();
            */}
            alert("SETTINGS ON: Diferencia de edad ACEPTADA");
          } else {
            alert("La diferencia de edad no es la correcta");
          }
        } else {
          if (checkCategoryDifference()) {
            {/*
            handleNext();
            handleSave();
            */}
            alert("SETTINGS ON : Categoría ACEPTADA");
          } else {
            alert("La diferencia de categoría no es la correcta");
          }
        }
      }
    } else {
      {/*
      handleNext();
      handleSave();
      */}
      alert("SETTINGS OFF : Guardado Satisfactoriamente");
    }
  };


  return (
      <div className="w-full max-w-6xl mx-auto px-4">
        <WizardSteps currentStep={currentStep} />
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
                  <AcademySelector
                      onAcademySelect={handleAcademySelect}
                      initialAcademyId={user.academyId || ''}
                      initialAcademyName={user.academyName || 'Libre'}
                  />
                </form>

                {isCoupleRequired && (
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
                )}

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
                        <AcademySelector
                            onAcademySelect={handleCoupleAcademySelect}
                            initialAcademyId={pareja.academyId || ''}
                            initialAcademyName={pareja.academyName || 'Libre'}
                        />
                      </form>
                    </>
                )}

                {/*Boton para enviar los datos como Participant*/}


              </div>
          )}

          {currentStep === 2 && (
              <div className="w-full flex flex-col items-center justify-start pt-[15px] sm:pt-[40px] pb-[20px] min-h-[350px]">
                <div className="w-[90%] md:w-[60%] lg:w-[90%] grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-10 mb-20">
                  <div className="order-1 lg:order-1 w-full bg-white p-6 rounded-lg shadow-md flex flex-col gap-6">
                    <h3 className="text-xl font-semibold mb-4">Inscripción Finalizada</h3>
                    {ticketId && (
                        <p className="text-xl font-semibold mb-4 text-green-600">ID del Ticket : {ticketId}</p>
                    )}
                    <h3 className="text-xl font-semibold mb-4">Completa el pago y confirmar tu inscripción.</h3>
                  </div>
                  <div className="order-2 lg:order-1 w-full bg-white p-6 rounded-lg shadow-md flex flex-col gap-6">
                    <div className="flex items-center space-x-3 text-gray-600 p-2 bg-gradient-to-tr from-red-500 to-yellow-600 rounded-full w-auto justify-center">
                      <span className="text-sm md:text-xl text-white">Contacta con {event.academyName}.</span>
                    </div>
                    {loadingAcademy ? (
                        <p>Cargando datos de la academia...</p>
                    ) : errorAcademy ? (
                        <p>Error: {errorAcademy}</p>
                    ) : academy ? (
                        <>
                          <div className="w-[90%] md:w-[60%] lg:w-[90%] grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-10 ">

                            <div className="flex items-center space-x-3  p-2  w-auto justify-center">
                              <p className="text-sm md:text-xl">Teléfono : {academy.phoneNumber}</p>
                            </div>

                            <div className="flex items-center space-x-3 text-gray-600 p-2 bg-green-600 rounded-full w-auto justify-center">
                              <a href={`https://wa.me/${academy.phoneNumber.replace(/\s+/g, '')}`}
                                 target="_blank" rel="noopener noreferrer"
                                 className="text-sm md:text-xl text-white">Chatear</a>
                            </div>
                          </div>

                          <div>
                            <section className="flex items-center space-x-3 text-gray-600">
                              <MapIcon className={`${iconClass} text-orange-600`}/>
                              {event.location.coordinates ? (
                                  <button
                                      onClick={openModal}
                                      className="text-sm md:text-base text-red-900 hover:text-purple-900 underline underline-offset-4 ml-2 text-start"
                                  >
                                    Dirección: {academy.location.street}, {academy.location.district},{" "}
                                    {academy.location.province}, {academy.location.department}.
                                  </button>
                              ) : (
                                  <span className="text-sm md:text-base">
                                  Dirección: {academy.location.street}, {academy.location.district},{" "}
                                    {academy.location.province}, {academy.location.department}
                                </span>
                              )}
                            </section>
                          </div>


                        </>
                    ) : (
                        <p>Academia no encontrada.</p>
                    )}
                  </div>
                </div>
              </div>
          )}
          <div className="flex justify-between mt-8 px-4 pb-4">
            {currentStep === 1 && (
                <button
                    onClick={handleBack}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all"
                >
                  Atrás
                </button>
            )}
            {currentStep === 1 && (
                <button
                    onClick={handleNextAndSave}
                    className="ml-auto px-6 py-2 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-lg hover:from-red-500 hover:to-red-400 transition-all"
                >
                  Guardar Inscripción
                </button>
            )}
            {currentStep === 2 && (
                <Link
                    className="ml-auto px-6 py-2 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-lg hover:from-red-500 hover:to-red-400 transition-all"
                    href="/calendario"
                >
                  Salir
                </Link>
            )}
          </div>
        </div>
      </div>
  );
};

export default EventoInscripcion;