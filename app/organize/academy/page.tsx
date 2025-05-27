"use client";

import React from "react";
import useUser from "@/app/hooks/useUser";
import useAcademies from "@/app/hooks/useAcademies";
import useUsers from "@/app/hooks/useUsers";
import { db } from "@/app/firebase/config";
import { doc, updateDoc } from "firebase/firestore";
import ConfirmModal from "./modals/DesafiliateStudentModal";
import AcademyJoinRequestsSection from "./components/AcademyJoinRequestsSection";

const OrganizeAcademyPage = () => {
  const { user, loadingUser } = useUser();
  const { academies, loadingAcademies } = useAcademies();
  const { users, loadingUsers } = useUsers();
  const [selectedStudentId, setSelectedStudentId] = React.useState<string | null>(null);
  const [modalOpen, setModalOpen] = React.useState(false);

  const removeStudentFromAcademy = async (userId: string) => {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      "marinera.academyId": null,
      "marinera.academyName": null,
    });
  };

  const handleOpenModal = (studentId: string) => {
    setSelectedStudentId(studentId);
    setModalOpen(true);
  };

  const handleConfirmRemove = async () => {
    if (selectedStudentId) {
      await removeStudentFromAcademy(selectedStudentId);
      setSelectedStudentId(null);
    }
  };

  if (loadingUser || loadingAcademies || loadingUsers) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Cargando...</p>
        </div>
      </div>
    );
  }

  const academy = academies.find((a) => a.organizerId === user?.uid);
  if (!academy) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl border border-red-100">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.982 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Academia no encontrada</h2>
          <p className="text-gray-600">No se pudo encontrar la información de tu academia.</p>
        </div>
      </div>
    );
  }

  const organizer = users.find((u) => u.id === academy.organizerId);
  const students = users.filter(
    (u) =>
      u.marinera?.academyId === academy.id && u.id !== academy.organizerId
  );

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                    Gestión de Academia
                  </h1>
                  <p className="text-gray-600 mt-1">Administra tu academia y las solicitudes de afiliación</p>
                </div>
              </div>
            </div>
          </div>

          {/* Información General */}
          <div className="grid lg:grid-cols-3 gap-8 mb-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800">Información General</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Nombre</label>
                      <p className="text-lg font-semibold text-gray-800 mt-1">{academy.name}</p>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4">
                      <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Email</label>
                      <p className="text-gray-800 mt-1">{Array.isArray(academy.email) ? academy.email.join(", ") : academy.email}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Teléfono</label>
                      <p className="text-gray-800 mt-1">{Array.isArray(academy.phoneNumber) ? academy.phoneNumber.join(", ") : academy.phoneNumber}</p>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4">
                      <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Dirección</label>
                      <p className="text-gray-800 mt-1">
                        {academy.location?.street}, {academy.location?.district}, {academy.location?.province}, {academy.location?.department}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Organizador */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800">Organizador</h2>
                </div>

                {organizer ? (
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                      {organizer.firstName?.charAt(0)}{organizer.lastName?.charAt(0)}
                    </div>

                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      {organizer.firstName} {organizer.lastName}
                    </h3>

                    <div className="bg-gray-50 rounded-xl p-4 text-left">
                      <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Email de contacto</label>
                      <p className="text-gray-800 mt-1 break-words">{organizer.email.join(", ")}</p>
                    </div>

                    <div className="mt-4 p-3 bg-green-50 rounded-xl border border-green-200">
                      <div className="flex items-center gap-2 text-green-700">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm font-medium">Administrador Principal</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.982 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <p className="text-gray-600">Organizador no encontrado</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Solicitudes de Afiliación - Nueva sección */}
          <div className="mb-8">
            <AcademyJoinRequestsSection 
              academyId={academy.id!}
              academyName={academy.name}
              users={users}
            />
          </div>

          {/* Alumnos Afiliados - Ahora ocupa todo el ancho */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100">
            <div className="p-8 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800">Alumnos Afiliados</h2>
                </div>
                <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold">
                  {students.length} alumno{students.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>

            <div className="p-8">
              {students.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-800 mb-3">No hay alumnos afiliados</h3>
                  <p className="text-gray-600 text-lg">Aún no tienes alumnos registrados en tu academia.</p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-xl border border-gray-200">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-full">
                      <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                        <tr>
                          <th className="text-left py-5 px-6 font-semibold text-gray-700 text-md">Nombre</th>
                          <th className="text-left py-5 px-6 font-semibold text-gray-700 text-md">Email</th>
                          <th className="text-left py-5 px-6 font-semibold text-gray-700 text-md">Nivel</th>
                          <th className="text-left py-5 px-6 font-semibold text-gray-700 text-md">Categoría</th>
                          <th className="text-left py-5 px-6 font-semibold text-gray-700 text-md">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {students.map((student, index) => (
                          <tr
                            key={student.id}
                            className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? "bg-white" : "bg-gray-25"
                              }`}
                          >
                            <td className="py-6 px-6">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                                  {student.firstName?.charAt(0)}
                                  {student.lastName?.charAt(0)}
                                </div>
                                <span className="font-semibold text-gray-800">
                                  {student.firstName} {student.lastName}
                                </span>
                              </div>
                            </td>
                            <td className="py-6 px-6 text-gray-600 text-base">
                              {student.email.join(", ")}
                            </td>
                            <td className="py-6 px-6">
                              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                                {student.marinera?.participant?.level || "No especificado"}
                              </span>
                            </td>
                            <td className="py-6 px-6">
                              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-purple-100 text-purple-800">
                                {student.marinera?.participant?.category || "No especificado"}
                              </span>
                            </td>
                            <td className="py-6 px-6">
                              <button
                                onClick={() => handleOpenModal(student.id)}
                                className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                              >
                                Desafiliar
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <ConfirmModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleConfirmRemove}
        message="¿Deseas desafiliar a este alumno de tu academia? Esta acción no se puede deshacer."
      />
    </>
  );
};

export default OrganizeAcademyPage;