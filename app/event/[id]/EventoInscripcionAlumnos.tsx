"use client"
import { useState, useEffect } from "react";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  Timestamp
} from "firebase/firestore";
import {
  CheckCircle,
  AlertCircle,
  UserPlus,
  Trash2,
  Users,
  Search
} from "lucide-react";
import { User } from '@/app/types/userType';
import { Ticket, TicketEntry, TicketData } from "@/app/types/ticketType";
import useAcademies from "@/app/hooks/useAcademies";

const EventoInscripcionAlumnos = ({ event, user }) => {
  // Estados
  const [modalidad, setModalidad] = useState(() => {
    const modalidadesDisponibles = Object.keys(event.settings.levels || {});
    return modalidadesDisponibles.length > 0 ? modalidadesDisponibles[0] : "";
  });
  const [dniParticipante, setDniParticipante] = useState("");
  const [dniPareja, setDniPareja] = useState("");
  const [participanteInfo, setParticipanteInfo] = useState<User | null>(null);
  const [parejaInfo, setParejaInfo] = useState<User | null>(null);
  const [inscripciones, setInscripciones] = useState<any[]>([]);
  const [isSearchingParticipante, setIsSearchingParticipante] = useState(false);
  const [isSearchingPareja, setIsSearchingPareja] = useState(false);
  const [searchErrorParticipante, setSearchErrorParticipante] = useState("");
  const [searchErrorPareja, setSearchErrorPareja] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [ticketId, setTicketId] = useState("");
  const [montoTotal, setMontoTotal] = useState(0);
  const [academiaParticipante, setAcademiaParticipante] = useState("");
  const [academiaPareja, setAcademiaPareja] = useState("");
  const { academies, loadingAcademies } = useAcademies();

  useEffect(() => {
    if (!event.settings?.levels || Object.keys(event.settings.levels).length === 0) {
      console.error("El evento no tiene modalidades definidas");
    }
  }, [event]);

  // Opciones de modalidades
  const modalidades = Object.keys(event.settings.levels || {});

  // Determinar si la modalidad requiere pareja
  const requierePareja = event.settings.levels[modalidad]?.couple || false;

  // Calcular edad a partir de fecha de nacimiento
  const calcularEdad = (birthDate: Timestamp | undefined) => {
    if (!birthDate) return "N/A";

    const hoy = new Date();
    const fechaNac = birthDate.toDate();
    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    const m = hoy.getMonth() - fechaNac.getMonth();

    if (m < 0 || (m === 0 && hoy.getDate() < fechaNac.getDate())) {
      edad--;
    }

    return edad;
  };

  // Buscar participante por DNI
  const buscarParticipante = async () => {
    if (!dniParticipante.trim()) {
      setSearchErrorParticipante("Ingrese un DNI válido");
      return;
    }

    setIsSearchingParticipante(true);
    setSearchErrorParticipante("");
    setParticipanteInfo(null);

    try {
      const db = getFirestore();
      const usersCollection = collection(db, "users");
      const normalizedDNI = dniParticipante.trim().padStart(8, '0');
      const q = query(usersCollection, where("dni", "==", normalizedDNI));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setSearchErrorParticipante("No se encontró ningún usuario con este DNI");
        return;
      }

      const userData = snapshot.docs[0].data() as User;
      userData.id = snapshot.docs[0].id;
      setParticipanteInfo(userData);
    } catch (error) {
      console.error("Error al buscar participante:", error);
      setSearchErrorParticipante("Error al buscar usuario");
    } finally {
      setIsSearchingParticipante(false);
    }
  };

  // Buscar pareja por DNI
  const buscarPareja = async () => {
    if (!dniPareja.trim()) {
      setSearchErrorPareja("Ingrese un DNI válido");
      return;
    }

    setIsSearchingPareja(true);
    setSearchErrorPareja("");
    setParejaInfo(null);

    try {
      const db = getFirestore();
      const usersCollection = collection(db, "users");
      const normalizedDNI = dniPareja.trim().padStart(8, '0');

      // Verificar que la pareja no sea el mismo participante
      if (normalizedDNI === dniParticipante.trim().padStart(8, '0')) {
        setSearchErrorPareja("La pareja no puede ser el mismo participante");
        setIsSearchingPareja(false);
        return;
      }

      const q = query(usersCollection, where("dni", "==", normalizedDNI));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setSearchErrorPareja("No se encontró ningún usuario con este DNI");
        return;
      }

      const userData = snapshot.docs[0].data() as User;
      userData.id = snapshot.docs[0].id;

      // Verificar que los géneros sean diferentes en modalidades de pareja
      if (requierePareja && participanteInfo && userData.gender === participanteInfo.gender) {
        setSearchErrorPareja(`Solo permite parejas compuestas por un varón y una mujer`);
        return;
      }

      setParejaInfo(userData);
    } catch (error) {
      console.error("Error al buscar pareja:", error);
      setSearchErrorPareja("Error al buscar usuario");
    } finally {
      setIsSearchingPareja(false);
    }
  };

  // Agregar inscripción a la lista
  const agregarInscripcion = () => {
    // Validar que exista la información necesaria
    if (!participanteInfo) {
      setSearchErrorParticipante("Debe buscar un participante primero");
      return;
    }

    if (requierePareja && !parejaInfo) {
      setSearchErrorPareja("Debe buscar una pareja para esta modalidad");
      return;
    }

    // Determinar nivel según edad del participante principal
    const level = modalidad;
    const category = participanteInfo.category || "No especificada";

    // Obtener precio según modalidad y nivel
    const precioBase = event.settings.levels[modalidad]?.price || 0;

    // Crear objeto de inscripción
    const nuevaInscripcion = {
      modalidad,
      // Usar categoría del usuario en lugar de calcular nivel por edad
      level: modalidad,
      category: participanteInfo.category,
      participante: {
        id: participanteInfo.id,
        nombre: `${participanteInfo.firstName} ${participanteInfo.lastName}`,
        dni: participanteInfo.dni,
        edad: calcularEdad(participanteInfo.birthDate),
        genero: participanteInfo.gender,
        telefono: participanteInfo.phoneNumber?.[0] || "No disponible",
        academyId: academiaParticipante || "",
        academyName: academies.find(a => a.id === academiaParticipante)?.name || "Academia no especificada"
      },
      pareja: parejaInfo ? {
        id: parejaInfo.id,
        nombre: `${parejaInfo.firstName} ${parejaInfo.lastName}`,
        dni: parejaInfo.dni,
        edad: calcularEdad(parejaInfo.birthDate),
        genero: parejaInfo.gender,
        telefono: parejaInfo.phoneNumber?.[0] || "No disponible",
        academyId: academiaPareja || "",
        academyName: academies.find(a => a.id === academiaPareja)?.name || "Academia no especificada"
      } : null,
      precio: precioBase
    };

    // Agregar a la lista de inscripciones
    setInscripciones([...inscripciones, nuevaInscripcion]);

    // Actualizar monto total
    setMontoTotal(montoTotal + (precioBase || 0));

    // Limpiar formulario
    setDniParticipante("");
    setDniPareja("");
    setParticipanteInfo(null);
    setParejaInfo(null);
    setSearchErrorParticipante("");
    setSearchErrorPareja("");
  };

  // Eliminar una inscripción
  const eliminarInscripcion = (index) => {
    const nuevasInscripciones = [...inscripciones];
    // Restar el precio de esta inscripción del total
    setMontoTotal(montoTotal - nuevasInscripciones[index].precio);
    // Eliminar la inscripción
    nuevasInscripciones.splice(index, 1);
    setInscripciones(nuevasInscripciones);
  };

  // Enviar todas las inscripciones
  const confirmarInscripciones = async () => {
    if (inscripciones.length === 0) {
      alert("Debe agregar al menos una inscripción");
      return;
    }

    setIsSubmitting(true);

    try {
      const db = getFirestore();
      const ticketsCollection = collection(db, "tickets");

      // Crear las entradas del ticket
      const entries: TicketEntry[] = inscripciones.map(inscripcion => {
        const usersId = inscripcion.pareja
          ? [inscripcion.participante.id, inscripcion.pareja.id]
          : [inscripcion.participante.id];

        const academiesId = inscripcion.pareja
          ? [inscripcion.participante.academyId, inscripcion.pareja.academyId].filter(id => id)
          : [inscripcion.participante.academyId].filter(id => id);

        return {
          usersId,
          academiesId,
          category: inscripcion.category,  // Usar la categoría del participante
          level: inscripcion.level,        // Usar el nivel (modalidad)
          amount: inscripcion.precio
        };
      });

      // Crear el objeto del ticket
      const now = Timestamp.now();
      // Fecha de expiración: 3 días desde ahora
      const expirationDate = Timestamp.fromDate(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000));

      const newTicket: TicketData = {
        status: 'Pendiente',
        eventId: event.id,
        registrationDate: now,
        expirationDate: expirationDate,
        inscriptionType: 'Grupal',
        totalAmount: montoTotal,
        entries,
        createdBy: user.id,
        level: modalidad,  // Asegúrate de definir `selectedLevel`
        category: participanteInfo.category,  // Asegúrate de definir `selectedCategory`
        usersId: [participanteInfo.id, parejaInfo.id],  // Asegúrate de que `user.id` esté definido correctamente
        academiesName: [academiaParticipante, academiaPareja],  // Asegúrate de que `event.academyName` esté disponible
      };

      // Guardar el ticket en Firestore
      const docRef = await addDoc(ticketsCollection, newTicket);

      // Guardar el ID del ticket creado
      setTicketId(docRef.id);
      setIsSuccess(true);
    } catch (error) {
      console.error("Error al confirmar inscripciones:", error);
      alert("Error al procesar la inscripción. Intenta nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reiniciar después de éxito
  const nuevaInscripcion = () => {
    setInscripciones([]);
    setMontoTotal(0);
    setIsSuccess(false);
    setTicketId("");
    setModalidad("Individual");
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white/90 rounded-lg shadow-sm p-6">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-blue-600 mb-2">Inscripción de Alumnos</h2>
        <p className="text-lg text-gray-700">
          Inscribe alumnos de tu academia al evento {event.name}
        </p>
      </div>

      {!isSuccess ? (
        <div className="space-y-8">
          {/* Formulario de inscripción */}
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <UserPlus className="w-5 h-5 mr-2 text-blue-600" />
              Nueva inscripción
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Columna izquierda - Formulario */}
              <div className="space-y-4">
                {/* Selección de modalidad */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Modalidad:
                  </label>
                  <select
                    value={modalidad}
                    onChange={(e) => {
                      setModalidad(e.target.value);
                      // Limpiar los campos si cambia la modalidad
                      setParejaInfo(null);
                      setDniPareja("");
                      setSearchErrorPareja("");
                    }}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {modalidades.map(mod => (
                      <option key={mod} value={mod}>{mod}</option>
                    ))}
                  </select>
                </div>

                {/* DNI Participante */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    DNI Participante:
                  </label>
                  <div className="flex">
                    <input
                      type="text"
                      value={dniParticipante}
                      onChange={(e) => setDniParticipante(e.target.value)}
                      placeholder="Ingresa DNI"
                      className="flex-1 p-2 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      maxLength={8}
                    />
                    <button
                      onClick={buscarParticipante}
                      disabled={isSearchingParticipante}
                      className="bg-blue-600 text-white px-3 rounded-r-md hover:bg-blue-700 transition-colors disabled:bg-blue-400"
                    >
                      {isSearchingParticipante ? (
                        <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                      ) : (
                        <Search className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {searchErrorParticipante && (
                    <p className="mt-1 text-sm text-red-600">{searchErrorParticipante}</p>
                  )}
                </div>
                {participanteInfo && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Academia del Participante:
                    </label>
                    <select
                      value={academiaParticipante}
                      onChange={(e) => setAcademiaParticipante(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Seleccionar academia</option>
                      {academies.map(academia => (
                        <option key={academia.id} value={academia.id}>{academia.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* DNI Pareja (solo para modalidades que lo requieren) */}
                {requierePareja && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      DNI Pareja:
                    </label>
                    <div className="flex">
                      <input
                        type="text"
                        value={dniPareja}
                        onChange={(e) => setDniPareja(e.target.value)}
                        placeholder="Ingresa DNI de la pareja"
                        className="flex-1 p-2 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        maxLength={8}
                      />
                      <button
                        onClick={buscarPareja}
                        disabled={isSearchingPareja || !participanteInfo}
                        className="bg-blue-600 text-white px-3 rounded-r-md hover:bg-blue-700 transition-colors disabled:bg-blue-400"
                      >
                        {isSearchingPareja ? (
                          <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                        ) : (
                          <Search className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    {searchErrorPareja && (
                      <p className="mt-1 text-sm text-red-600">{searchErrorPareja}</p>
                    )}
                  </div>
                )}

                {requierePareja && parejaInfo && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Academia de la Pareja:
                    </label>
                    <select
                      value={academiaPareja}
                      onChange={(e) => setAcademiaPareja(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Seleccionar academia</option>
                      {academies.map(academia => (
                        <option key={academia.id} value={academia.id}>{academia.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Botón para agregar inscripción */}
                <div className="pt-2">
                  <button
                    onClick={agregarInscripcion}
                    disabled={
                      !participanteInfo ||
                      !academiaParticipante ||
                      (requierePareja && (!parejaInfo || !academiaPareja))
                    }
                    className="w-full py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:bg-green-400"
                  >
                    <span className="flex items-center justify-center">
                      <UserPlus className="w-5 h-5 mr-2" />
                      Agregar inscripción
                    </span>
                  </button>
                </div>
              </div>

              {/* Columna derecha - Fichas de información */}
              <div className="space-y-4">
                {/* Ficha del participante */}
                {participanteInfo && (
                  <div className="bg-white rounded-md border border-blue-200 p-4 relative">
                    <div className="absolute top-2 right-2 bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                      {participanteInfo.gender === "Masculino" ? "Masculino" : "Femenino"}
                    </div>
                    <h4 className="font-semibold text-blue-700 mb-2">Participante encontrado</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="space-y-1">
                        <p><span className="font-medium text-gray-600">Nombre:</span> {participanteInfo.firstName} {participanteInfo.lastName}</p>
                        <p><span className="font-medium text-gray-600">DNI:</span> {participanteInfo.dni}</p>
                        <p><span className="font-medium text-gray-600">Edad:</span> {calcularEdad(participanteInfo.birthDate)} años</p>
                      </div>
                      <div className="space-y-1">
                        <p><span className="font-medium text-gray-600">Academia:</span> {participanteInfo.academyName || "No especificada"}</p>
                        <p><span className="font-medium text-gray-600">Categoría:</span> {participanteInfo.category || "No especificada"}</p>
                        <p><span className="font-medium text-gray-600">Teléfono:</span> {participanteInfo.phoneNumber?.[0] || "No disponible"}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Ficha de la pareja */}
                {requierePareja && parejaInfo && (
                  <div className="bg-white rounded-md border border-pink-200 p-4 relative">
                    <div className="absolute top-2 right-2 bg-pink-100 text-pink-800 text-xs font-medium px-2 py-1 rounded">
                      {parejaInfo.gender === "M" ? "Masculino" : "Femenino"}
                    </div>
                    <h4 className="font-semibold text-pink-700 mb-2">Pareja encontrada</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="space-y-1">
                        <p><span className="font-medium text-gray-600">Nombre:</span> {parejaInfo.firstName} {parejaInfo.lastName}</p>
                        <p><span className="font-medium text-gray-600">DNI:</span> {parejaInfo.dni}</p>
                        <p><span className="font-medium text-gray-600">Edad:</span> {calcularEdad(parejaInfo.birthDate)} años</p>
                      </div>
                      <div className="space-y-1">
                        <p><span className="font-medium text-gray-600">Academia:</span> {parejaInfo.academyName || "No especificada"}</p>
                        <p><span className="font-medium text-gray-600">Categoría:</span> {parejaInfo.category || "No especificada"}</p>
                        <p><span className="font-medium text-gray-600">Teléfono:</span> {parejaInfo.phoneNumber?.[0] || "No disponible"}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Lista de inscripciones */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
              <Users className="w-5 h-5 mr-2 text-blue-600" />
              Inscripciones pendientes ({inscripciones.length})
            </h3>

            {inscripciones.length > 0 ? (
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Modalidad</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Participante</th>
                      {requierePareja && (
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pareja</th>
                      )}
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Academia(s)</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {inscripciones.map((inscripcion, index) => (
                      <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        <td className="px-4 py-3 text-sm text-gray-700">{inscripcion.modalidad}</td>
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-gray-900">{inscripcion.participante.nombre}</div>
                          <div className="text-xs text-gray-500">DNI: {inscripcion.participante.dni}</div>
                        </td>
                        {requierePareja && (
                          <td className="px-4 py-3">
                            {inscripcion.pareja ? (
                              <div>
                                <div className="text-sm font-medium text-gray-900">{inscripcion.pareja.nombre}</div>
                                <div className="text-xs text-gray-500">DNI: {inscripcion.pareja.dni}</div>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-500">-</span>
                            )}
                          </td>
                        )}
                        <td className="px-4 py-3 text-sm text-gray-700">{inscripcion.category}</td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-gray-700">{inscripcion.participante.academyName}</div>
                          {inscripcion.pareja && inscripcion.pareja.academyName !== inscripcion.participante.academyName && (
                            <div className="text-xs text-gray-500">{inscripcion.pareja.academyName}</div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">S/. {inscripcion.precio.toFixed(2)}</td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => eliminarInscripcion(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  {/* Pie de tabla con total */}
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan={requierePareja ? 5 : 4} className="px-4 py-3 text-sm font-semibold text-gray-700 text-right">
                        Total:
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-gray-900">S/. {montoTotal.toFixed(2)}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-500">
                  No hay inscripciones pendientes. Utiliza el formulario para agregar participantes.
                </p>
              </div>
            )}

            {/* Botón para confirmar todas las inscripciones */}
            {inscripciones.length > 0 && (
              <div className="mt-6 flex justify-end">
                <button
                  onClick={confirmarInscripciones}
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400 text-lg font-medium flex items-center"
                >
                  {isSubmitting ? (
                    <>
                      <span className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></span>
                      Procesando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Confirmar {inscripciones.length} inscripciones
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        // Pantalla de éxito
        <div className="text-center space-y-6 py-8">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>

          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">¡Inscripción completada!</h3>
            <p className="text-gray-600">
              Se han inscrito correctamente {inscripciones.length} alumnos al evento {event.name}.
            </p>
            <p className="text-gray-600 mt-1">
              Ticket generado: <span className="font-medium">{ticketId}</span>
            </p>
          </div>

          <div className="pt-4">
            <button
              onClick={nuevaInscripcion}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Realizar otra inscripción
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventoInscripcionAlumnos;