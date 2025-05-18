import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
const TicketComponent = ({ event, user, academy, ticketId, loadingAcademy, errorAcademy, openModal }) => {
  return (
    <div className="w-full flex flex-col items-center justify-start pt-6 sm:pt-10 pb-8 min-h-screen bg-gray-50">
      {/* Encabezado de confirmación */}
      <div className="w-full max-w-7xl px-4 mb-8">
        <div className="bg-green-100 border-l-4 border-green-500 p-4 rounded-md">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm md:text-base text-green-800">
                Tu inscripción ha sido registrada con éxito.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="w-[90%] md:w-[85%] lg:w-[90%] grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6 mb-10">
        {/* Panel de información del evento */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="relative h-40 overflow-hidden">
            {event?.bannerImage ? (
              <Image
                src={event.bannerImage}
                alt={event.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                unoptimized={false} // o true si quieres saltarte optimizaciones
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600"></div>
            )}
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end">
              <div className="p-4 text-white">
                <h2 className="text-xl md:text-2xl font-bold">{event?.name || "Evento"}</h2>
                <p className="text-sm opacity-90">{event?.location?.department}, {event?.location?.province}</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Detalles del evento</h3>

            <div className="space-y-3 text-gray-600">
              <div className="flex items-start">
                <span className="flex-shrink-0 text-gray-500 w-6 h-6 mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </span>
                <div>
                  <p className="font-medium">Fecha:</p>
                  <p>
                    {event?.startDate?.toDate().toLocaleDateString()} - {event?.endDate?.toDate().toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <span className="flex-shrink-0 text-gray-500 w-6 h-6 mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </span>
                <div>
                  <p className="font-medium">Ubicación:</p>
                  <p>{event?.location?.placeName}</p>
                  <p className="text-sm">
                    {event?.location?.street}, {event?.location?.district}, {event?.location?.province}
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <span className="flex-shrink-0 text-gray-500 w-6 h-6 mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                </span>
                <div>
                  <p className="font-medium">Tipo de evento:</p>
                  <p>{event?.eventType}</p>
                </div>
              </div>

              <div className="flex items-start">
                <span className="flex-shrink-0 text-gray-500 w-6 h-6 mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </span>
                <div>
                  <p className="font-medium">Capacidad:</p>
                  <p>{event?.capacity} participantes</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Panel de confirmación de inscripción */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
            <h3 className="text-xl font-bold text-white">Confirmación de inscripción</h3>
          </div>

          <div className="p-6">
            {/* Datos del ticket */}
            <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-100">
              {ticketId ? (
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">ID del Ticket</p>
                  <p className="text-xl font-mono font-semibold text-blue-700">{ticketId}</p>
                </div>
              ) : (
                <p className="text-center text-gray-500">Procesando ID del ticket...</p>
              )}
            </div>

            {/* Datos del participante */}
            <div className="mb-6">
              <h4 className="text-md font-semibold text-gray-700 mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
                Datos del participante
              </h4>

              <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-gray-700">
                {user && (
                  <>
                    <p><span className="font-medium">Nombre:</span> {user?.firstName} {user?.lastName}</p>
                    <p><span className="font-medium">DNI:</span> {user?.dni}</p>
                    <p><span className="font-medium">Categoría:</span> {user?.category}</p>
                    {user?.level && <p><span className="font-medium">Nivel:</span> {user?.level}</p>}
                  </>
                )}
              </div>
            </div>

            {/* Instrucciones de pago */}
            <div className="mb-6">
              <h4 className="text-md font-semibold text-gray-700 mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
                Completa tu pago
              </h4>

              <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
                <p className="text-yellow-800 text-sm">
                  Para confirmar tu inscripción, realiza el pago correspondiente contactando directamente con la academia.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Panel de contacto con la academia */}
      <div className="w-[90%] md:w-[85%] lg:w-[90%] bg-white rounded-xl shadow-md overflow-hidden mb-10">
        <div className="bg-gradient-to-tr from-orange-500 to-red-600 px-6 py-4">
          <h3 className="text-xl font-bold text-white flex items-center">
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
            </svg>
            Contacta con {event?.academyName || "la academia"}
          </h3>
        </div>

        <div className="p-6">
          {loadingAcademy ? (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div>
            </div>
          ) : errorAcademy ? (
            <div className="p-4 bg-red-50 text-red-700 rounded-lg">
              <p>Error al cargar los datos de la academia: {errorAcademy}</p>
            </div>
          ) : academy ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start">
                  <span className="flex-shrink-0 text-orange-500 w-6 h-6 mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </span>
                  <div>
                    <p className="font-medium">Academia:</p>
                    <p className="text-lg">{academy.name}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <span className="flex-shrink-0 text-orange-500 w-6 h-6 mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </span>
                  <div>
                    <p className="font-medium">Email:</p>
                    <p>{academy.email}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <span className="flex-shrink-0 text-orange-500 w-6 h-6 mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </span>
                  <div>
                    <p className="font-medium">Dirección:</p>
                    <p>{academy.location.street},</p>
                    <p>{academy.location.district}, {academy.location.province},</p>
                    <p>{academy.location.department}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col space-y-4">
                <div className="flex items-center space-x-3 p-2">
                  <span className="flex-shrink-0 text-orange-500 w-6 h-6">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </span>
                  <p className="text-xl">Teléfono: {academy.phoneNumber}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <a
                    href={`tel:${academy.phoneNumber.replace(/\s+/g, '')}`}
                    className="flex items-center justify-center bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                    </svg>
                    Llamar
                  </a>

                  <a
                    href={`https://wa.me/${academy.phoneNumber.replace(/\s+/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.72.045.375-.1.778zm-3.423-14.416c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm.029 18.88c-1.161 0-2.305-.292-3.318-.844l-3.677.964.984-3.595c-.607-1.052-.927-2.246-.926-3.468.001-3.825 3.113-6.937 6.937-6.937 1.856.001 3.598.723 4.907 2.034 1.31 1.311 2.031 3.054 2.03 4.908-.001 3.825-3.113 6.938-6.937 6.938z" />
                    </svg>
                    WhatsApp
                  </a>
                </div>

                {event.location.coordinates && (
                  <button
                    onClick={openModal}
                    className="flex items-center justify-center bg-orange-500 text-white py-3 px-6 rounded-lg hover:bg-orange-600 transition-colors mt-4"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path>
                    </svg>
                    Ver ubicación en mapa
                  </button>
                )}
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-500 py-4">Academia no encontrada.</p>
          )}
        </div>
      </div>

      {/* Botones de acción */}
      <div className="w-[90%] md:w-[85%] lg:w-[90%] flex flex-col sm:flex-row justify-center gap-4 mt-6">
        <Link href="/dashboard/events" passHref>
          <div className="bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-6 rounded-lg shadow-md transition-colors flex items-center justify-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Ver mis eventos
          </div>
        </Link>

        <Link href="/" passHref>
          <div className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-6 rounded-lg shadow-md transition-colors flex items-center justify-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Ir al inicio
          </div>
        </Link>
      </div>
    </div>
  )
}

export default TicketComponent