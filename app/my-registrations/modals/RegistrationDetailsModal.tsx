// app/my-registrations/modals/RegistrationDetailsModal.tsx
'use client';

import React, { useState } from 'react';
import toast from "react-hot-toast";
import { RegistrationItem } from '@/app/hooks/my-registrations/useMyRegistrations';
import { usePDFGenerator } from '@/app/hooks/my-registrations/usePDFGenerator';

interface RegistrationDetailsModalProps {
  registration: RegistrationItem;
  isOpen: boolean;
  onClose: () => void;
}

const RegistrationDetailsModal: React.FC<RegistrationDetailsModalProps> = ({
  registration,
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'participants' | 'details'>('summary');
  
  const {
    isGenerating,
    error,
    success,
    generatePDF,
  } = usePDFGenerator();

  const handleDownloadPDF = () => {
    generatePDF(
      registration,
      () => {
        console.log('PDF generado exitosamente');
        toast.success('¡Comprobante PDF descargado exitosamente!', {
          duration: 4000,
          position: 'top-center',
        });
      },
      (error) => {
        console.error('Error:', error);
        toast.error('Error al generar el PDF. Inténtalo de nuevo.', {
          duration: 4000,
          position: 'top-center',
        });
      }
    );
  };

  if (!isOpen) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmada': return 'bg-green-100 text-green-800 border-green-200';
      case 'Pendiente': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Anulado': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Confirmada':
        return (
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        );
      case 'Pendiente':
        return (
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        );
      case 'Anulado':
        return (
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };

  const isGroupTicket = registration.isGroupTicket;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isGroupTicket ? 'bg-blue-100' : 'bg-red-100'
              }`}>
                {isGroupTicket ? (
                  <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                )}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {isGroupTicket ? 'Ticket Grupal' : 'Inscripción Individual'}
                </h2>
                <p className="text-sm text-gray-500">
                  {isGroupTicket 
                    ? `${registration.inscriptionSummary}` 
                    : 'Información completa de tu registro'
                  }
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tabs para tickets grupales */}
        {isGroupTicket && (
          <div className="border-b border-gray-200 px-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('summary')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'summary'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span>Resumen</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('participants')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'participants'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                  <span>Participantes ({registration.totalParticipants})</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('details')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'details'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Detalles</span>
                </div>
              </button>
            </nav>
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {/* Evento Info - Siempre visible */}
          <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-xl p-6 border border-red-100 mb-6">
            <div className="flex items-start space-x-4">
              <div className="w-20 h-20 bg-white rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden border-2 border-red-100">
                {registration.eventImage ? (
                  <img 
                    src={registration.eventImage} 
                    alt={registration.eventName}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <svg className="h-10 w-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-xl font-bold text-gray-900">{registration.eventName}</h3>
                  <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(registration.status)}`}>
                    {getStatusIcon(registration.status)}
                    <span>{registration.status}</span>
                  </span>
                  {isGroupTicket && (
                    <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-lg border border-blue-200">
                      Ticket Grupal
                    </span>
                  )}
                </div>
                {registration.participantCode && (
                  <div className="mb-3">
                    <span className="bg-purple-100 text-purple-800 text-sm font-medium px-3 py-1 rounded-lg border border-purple-200">
                      Código: #{registration.participantCode}
                    </span>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span><strong>Fecha:</strong> {registration.eventDate.toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span><strong>Ubicación:</strong> {registration.location}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    <span><strong>Total:</strong> S/ {registration.amount.toFixed(2)}</span>
                  </div>
                  {isGroupTicket && (
                    <div className="flex items-center space-x-2 text-blue-600">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span><strong>{registration.inscriptionSummary}</strong></span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tab Content */}
          {isGroupTicket ? (
            <>
              {/* Summary Tab */}
              {activeTab === 'summary' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-blue-50 rounded-xl p-5 border border-blue-200 text-center">
                      <div className="text-3xl font-bold text-blue-600 mb-2">
                        {registration.totalParticipants}
                      </div>
                      <div className="text-sm text-blue-700">Total Participantes</div>
                    </div>
                    <div className="bg-green-50 rounded-xl p-5 border border-green-200 text-center">
                      <div className="text-3xl font-bold text-green-600 mb-2">
                        {registration.inscriptionSummary?.split(',')[0]?.match(/\d+/)?.[0] || '0'}
                      </div>
                      <div className="text-sm text-green-700">Inscripciones</div>
                    </div>
                    <div className="bg-purple-50 rounded-xl p-5 border border-purple-200 text-center">
                      <div className="text-3xl font-bold text-purple-600 mb-2">
                        {registration.academies.length}
                      </div>
                      <div className="text-sm text-purple-700">Academias</div>
                    </div>
                  </div>

                  {/* Modalidades y Categorías */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-3">Modalidades</h4>
                      <p className="text-gray-700">{registration.level}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-3">Categorías</h4>
                      <p className="text-gray-700">{registration.category}</p>
                    </div>
                  </div>

                  {/* Academias */}
                  <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
                    <h4 className="font-semibold text-gray-900 mb-3">Academias Participantes</h4>
                    <div className="flex flex-wrap gap-2">
                      {registration.academies.map((academy, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full border border-blue-200">
                          {academy}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Participants Tab */}
              {activeTab === 'participants' && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 text-lg mb-4">
                    Todos los Participantes ({registration.totalParticipants})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {registration.participants.map((participant, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                            <span className="text-red-600 font-semibold">
                              {participant.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{participant}</p>
                            <p className="text-sm text-gray-500">Participante {index + 1}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Details Tab */}
              {activeTab === 'details' && (
                <div className="space-y-6">
                  {/* Fechas Importantes */}
                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                      <svg className="h-5 w-5 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Fechas Importantes
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm font-medium text-gray-700">Ticket Creado:</span>
                        <p className="text-gray-900">{registration.registrationDate.toLocaleDateString()}</p>
                      </div>
                      {registration.paymentDate && (
                        <div>
                          <span className="text-sm font-medium text-gray-700">Fecha de Pago:</span>
                          <p className="text-green-600 font-medium">{registration.paymentDate.toLocaleDateString()}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Estado del Ticket */}
                  <div className={`rounded-xl p-5 border-2 ${
                    registration.status === 'Confirmada' 
                      ? 'bg-green-50 border-green-200' 
                      : registration.status === 'Pendiente'
                      ? 'bg-yellow-50 border-yellow-200'
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Estado del Ticket</h4>
                        <p className="text-sm text-gray-600">
                          {registration.status === 'Confirmada' && 'El ticket grupal ha sido confirmado y el pago procesado correctamente.'}
                          {registration.status === 'Pendiente' && 'El ticket grupal está pendiente de confirmación de pago.'}
                          {registration.status === 'Anulado' && 'Este ticket grupal ha sido anulado.'}
                        </p>
                      </div>
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                        registration.status === 'Confirmada' 
                          ? 'bg-green-100' 
                          : registration.status === 'Pendiente'
                          ? 'bg-yellow-100'
                          : 'bg-red-100'
                      }`}>
                        {getStatusIcon(registration.status)}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Individual Registration Content */
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Información de Competencia */}
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="h-5 w-5 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                    Información de Competencia
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Categoría:</span>
                      <p className="text-gray-900">{registration.category}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Modalidad:</span>
                      <p className="text-gray-900">{registration.level}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Monto:</span>
                      <p className="text-2xl font-bold text-red-600">S/ {registration.amount.toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                {/* Participantes */}
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="h-5 w-5 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                    Participantes
                  </h4>
                  <div className="space-y-2">
                    {registration.participants.map((participant, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                          <span className="text-red-600 font-semibold text-sm">{participant.charAt(0)}</span>
                        </div>
                        <span className="text-gray-900">{participant}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Academia */}
              {registration.academies.length > 0 && (
                <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <svg className="h-5 w-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h4a1 1 0 011 1v5m-6 0V9a1 1 0 011-1h4a1 1 0 011 1v13.5M13 7h1m-1 4h1" />
                    </svg>
                    Academia
                  </h4>
                  <div className="space-y-2">
                    {registration.academies.map((academy, index) => (
                      <span key={index} className="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full border border-blue-200 mr-2">
                        {academy}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Fechas Importantes */}
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <svg className="h-5 w-5 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Fechas Importantes
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Fecha de Inscripción:</span>
                    <p className="text-gray-900">{registration.registrationDate.toLocaleDateString()}</p>
                  </div>
                  {registration.paymentDate && (
                    <div>
                      <span className="text-sm font-medium text-gray-700">Fecha de Pago:</span>
                      <p className="text-green-600 font-medium">{registration.paymentDate.toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Estado del Pago */}
              <div className={`rounded-xl p-5 border-2 ${
                registration.status === 'Confirmada' 
                  ? 'bg-green-50 border-green-200' 
                  : registration.status === 'Pendiente'
                  ? 'bg-yellow-50 border-yellow-200'
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Estado del Pago</h4>
                    <p className="text-sm text-gray-600">
                      {registration.status === 'Confirmada' && 'Tu inscripción ha sido confirmada y el pago procesado correctamente.'}
                      {registration.status === 'Pendiente' && 'Tu inscripción está pendiente de confirmación de pago.'}
                      {registration.status === 'Anulado' && 'Esta inscripción ha sido anulada.'}
                    </p>
                  </div>
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                    registration.status === 'Confirmada' 
                      ? 'bg-green-100' 
                      : registration.status === 'Pendiente'
                      ? 'bg-yellow-100'
                      : 'bg-red-100'
                  }`}>
                    {getStatusIcon(registration.status)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 rounded-b-2xl">
          <div className="flex justify-between items-center">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cerrar
            </button>
            
            {/* Botón para descargar PDF */}
            {registration.status === 'Confirmada' ? (
              <button
                onClick={handleDownloadPDF}
                disabled={isGenerating}
                className="px-8 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Generando PDF...</span>
                  </>
                ) : (
                  <>
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>
                      {isGroupTicket ? 'Descargar Comprobante Grupal' : 'Descargar Comprobante PDF'}
                    </span>
                  </>
                )}
              </button>
            ) : (
              <div className="px-8 py-2 bg-gray-300 text-gray-500 rounded-lg flex items-center space-x-2 cursor-not-allowed">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18 21l-2.636-2.636M6 18l-1.5-1.5m0 0L3 15l1.5-1.5M6 6l2.636-2.636L6 6zm12 12l-2.636 2.636L18 18z" />
                </svg>
                <span>Comprobante no disponible</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationDetailsModal;