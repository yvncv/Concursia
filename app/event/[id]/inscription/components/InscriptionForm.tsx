import React, { useEffect } from 'react';
import { User } from '@/app/types/userType';
import { decryptValue } from '@/app/utils/security/securityHelpers';
import AcademySelector from '../../components/AcademySelector';

interface ParticipantDataProps {
  user: User;
  isCoupleRequired: boolean;
  pareja: User | null;
  onResetPareja: () => void;
  selectedEmail: string;
  setSelectedEmail: (email: string) => void;
  selectedPhone: string;
  setSelectedPhone: (phone: string) => void;
  dniPareja: string;
  setDniPareja: (dni: string) => void;
  buscarPareja: () => void;
  handleAcademySelect: (id: string, name: string) => void;
  handleCoupleAcademySelect: (id: string, name: string) => void;
  onCanProceedChange: (ok: boolean) => void;
}

const InscriptionForm: React.FC<ParticipantDataProps> = ({
  user,
  isCoupleRequired,
  pareja,
  onResetPareja,
  selectedEmail,
  setSelectedEmail,
  selectedPhone,
  setSelectedPhone,
  dniPareja,
  setDniPareja,
  buscarPareja,
  handleAcademySelect,
  handleCoupleAcademySelect,
  onCanProceedChange,
}) => {

  useEffect(() => {
    const ready = !isCoupleRequired || Boolean(pareja);
    onCanProceedChange(ready);
  }, [isCoupleRequired, pareja, onCanProceedChange]);

  const handleCambiarPareja = () => {
    setDniPareja('');
    onResetPareja();
  };

  return (
    <div className="max-w-4xl mx-auto bg-gradient-to-br from-red-600 to-red-900 rounded-3xl shadow-xl">
      {/* Encabezado */}
      <div className="bg-black bg-opacity-30 p-6 rounded-t-3xl">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <svg className="h-8 w-8 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          Formulario de Inscripción
        </h2>
      </div>

      {/* Contenido principal */}
      <div className="p-6">
        {/* Datos del participante */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-5 text-white flex items-center border-b pb-2">
            <svg className="h-6 w-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Datos del Participante
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Datos personales */}
            <div className="bg-white bg-opacity-10 p-4 rounded-2xl">
              <h4 className="text-lg text-white mb-3 font-medium">Información Personal</h4>
              <div className="space-y-4">
                {[
                  { id: 'dni', label: 'DNI', value: decryptValue(user?.dni), icon: 'M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2' },
                  { id: 'firstName', label: 'Nombres', value: user?.firstName, icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
                  { id: 'lastName', label: 'Apellido(s)', value: user?.lastName, icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
                  { id: 'birthDate', label: 'Fecha de Nacimiento', value: user?.birthDate.toDate().toISOString().split('T')[0], icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
                ].map(({ id, label, value, icon }) => (
                  <div key={id} className="flex items-center">
                    <div className="mr-2 bg-red-700 p-2 rounded-xl">
                      <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={icon} />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-200">{label}</label>
                      <input
                        type="text"
                        placeholder={value}
                        readOnly
                        className="w-full mt-1 px-3 py-2 rounded-xl bg-white bg-opacity-10 text-white placeholder-gray-300 border border-gray-600"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Datos de categoría y contacto */}
            <div className="bg-white bg-opacity-10 p-4 rounded-2xl">
              <h4 className="text-lg text-white mb-3 font-medium">Categoría y Contacto</h4>
              <div className="space-y-4">
                {[
                  { id: 'gender', label: 'Género', value: user?.gender, icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
                  { id: 'category', label: 'Categoría', value: user?.marinera?.participant?.category, icon: 'M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z' },
                ].map(({ id, label, value, icon }) => (
                  <div key={id} className="flex items-center">
                    <div className="mr-2 bg-red-700 p-2 rounded-xl">
                      <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={icon} />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-200">{label}</label>
                      <input
                        type="text"
                        placeholder={value}
                        readOnly
                        className="w-full mt-1 px-3 py-2 rounded-xl bg-white bg-opacity-10 text-white placeholder-gray-300 border border-gray-600"
                      />
                    </div>
                  </div>
                ))}

                {/* Email */}
                <div className="flex items-center">
                  <div className="mr-2 bg-red-700 p-2 rounded-xl">
                    <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-200">Correo de contacto</label>
                    <select
                      value={selectedEmail}
                      onChange={e => setSelectedEmail(e.target.value)}
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-white bg-opacity-10 text-white border border-gray-600"
                      required
                    >
                      {user?.email.map((em, i) => <option key={i} value={em}>{em}</option>)}
                    </select>
                  </div>
                </div>

                {/* Teléfono */}
                <div className="flex items-center">
                  <div className="mr-2 bg-red-700 p-2 rounded-xl">
                    <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-200">Celular de contacto</label>
                    <select
                      value={selectedPhone}
                      onChange={e => setSelectedPhone(e.target.value)}
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-white bg-opacity-10 text-white border border-gray-600"
                      required
                    >
                      {user?.phoneNumber.map((ph, i) => <option key={i} value={ph}>{ph}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Academia usando el componente extraído */}
            <div className="md:col-span-2 mt-2">
              <AcademySelector
                onAcademySelect={handleAcademySelect}
                initialAcademyId={user?.marinera?.academyId || ''}
                initialAcademyName="Libre"
                theme="dark"
                label="Academia"
                placeholder="Buscar academia..."
                required={false}
              />
            </div>
          </div>
        </div>

        {/* Sección de pareja */}
        {isCoupleRequired && (
          <div className="mt-6">
            <div className="bg-gradient-to-r from-orange-600 to-orange-400 p-5 rounded-2xl shadow-lg">
              <div className="flex w-full items-center justify-between">
                <h3 className="text-lg font-semibold mb-3 text-white flex items-center">
                  <svg className="h-6 w-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  Información de Pareja
                </h3>
                {pareja && (
                  <button
                    onClick={handleCambiarPareja}
                    className="px-4 py-2 bg-white text-orange-600 rounded-lg shadow-sm hover:bg-gray-100 transition-colors"
                  >
                    Cambiar pareja
                  </button>
                )}
              </div>

              {!pareja ? (
                <div className="flex flex-col md:flex-row gap-4 items-center">
                  <div className="flex-1 w-full">
                    <label className="block text-sm font-medium text-white mb-2">Ingresa el DNI de tu pareja</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-orange-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        value={dniPareja}
                        onChange={e => setDniPareja(e.target.value)}
                        placeholder="DNI de Pareja"
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-white bg-opacity-20 text-white placeholder-orange-100 border border-orange-300 focus:ring-2 focus:ring-white"
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={buscarPareja}
                    className="px-6 py-3 text-white rounded-xl bg-gradient-to-r from-red-600 to-red-400 hover:from-red-700 hover:to-red-500 transition-colors shadow flex items-center mt-3 md:mt-6"
                  >
                    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Buscar Pareja
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
                    {/* Datos personales pareja */}
                    <div className="bg-white bg-opacity-10 p-4 rounded-2xl">
                      <h4 className="text-md text-white mb-3 font-medium">Información Personal de Pareja</h4>
                      <div className="space-y-3">
                        {[
                          { id: 'firstName', label: 'Nombres', value: pareja.firstName },
                          { id: 'lastName', label: 'Apellido(s)', value: pareja.lastName },
                          { id: 'birthDate', label: 'Fecha de Nac.', value: pareja.birthDate.toDate().toISOString().split('T')[0] },
                        ].map(({ id, label, value }) => (
                          <div key={id} className="flex items-center">
                            <div className="flex-1">
                              <label className="block text-xs font-medium text-gray-200">{label} Pareja</label>
                              <input
                                type="text"
                                placeholder={value}
                                readOnly
                                className="w-full mt-1 px-3 py-2 rounded-xl bg-white bg-opacity-10 text-white placeholder-gray-300 border border-orange-300"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Categoría y contacto pareja */}
                    <div className="bg-white bg-opacity-10 p-4 rounded-2xl">
                      <h4 className="text-md text-white mb-3 font-medium">Categoría y Contacto de Pareja</h4>
                      <div className="space-y-3">
                        {[
                          { id: 'gender', label: 'Género', value: pareja.gender },
                          { id: 'category', label: 'Categoría', value: pareja.marinera?.participant?.category },
                        ].map(({ id, label, value }) => (
                          <div key={id} className="flex items-center">
                            <div className="flex-1">
                              <label className="block text-xs font-medium text-gray-200">{label} Pareja</label>
                              <input
                                type="text"
                                placeholder={value}
                                readOnly
                                className="w-full mt-1 px-3 py-2 rounded-xl bg-white bg-opacity-10 text-white placeholder-gray-300 border border-orange-300"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Email / Teléfono Pareja */}
                    <div>
                      <label className="block text-xs font-medium text-gray-200">Correo Pareja</label>
                      <select
                        value={selectedEmail}
                        onChange={e => setSelectedEmail(e.target.value)}
                        className="w-full mt-1 px-3 py-2 rounded-xl bg-white bg-opacity-10 text-white border border-orange-300"
                        required
                      >
                        {pareja.email.map((em, i) => <option key={i} value={em}>{em}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-200">Teléfono Pareja</label>
                      <select
                        value={selectedPhone}
                        onChange={e => setSelectedPhone(e.target.value)}
                        className="w-full mt-1 px-3 py-2 rounded-xl bg-white bg-opacity-10 text-white border border-orange-300"
                        required
                      >
                        {pareja.phoneNumber.map((ph, i) => <option key={i} value={ph}>{ph}</option>)}
                      </select>
                    </div>

                    {/* Academia Pareja usando el componente extraído */}
                    <div className="md:col-span-2 mt-1">
                      <AcademySelector
                        onAcademySelect={handleCoupleAcademySelect}
                        initialAcademyId={pareja.marinera?.academyId || ''}
                        initialAcademyName="Libre"
                        theme="dark"
                        label="Academia de la Pareja"
                        placeholder="Buscar academia de la pareja..."
                        required={false}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InscriptionForm;