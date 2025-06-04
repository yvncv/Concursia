"use client";

import React from "react";
import useUser from "@/app/hooks/useUser";
import useAcademies from "@/app/hooks/useAcademies";
import useUsers from "@/app/hooks/useUsers";
import { useAcademyMembershipManagement } from "@/app/hooks/academy/useAcademyMembershipManagement";

// Importar los componentes
import ConfirmModal from "./modals/DesafiliateStudentModal";
import AcademyProfileCard from "./components/AcademyProfileCard";

import { 
  AcademyStatsHeader, 
  AcademyTabs, 
  AcademyJoinRequestsSection, 
  AffiliatedStudentsSection 
} from "./components/AcademyComponents";
import { useAcademyJoinRequestsForOrganizer } from "@/app/hooks/academy/useAcademyJoinRequestsForOrganizer";

const OrganizeAcademyPage = () => {
  const { user, loadingUser } = useUser();
  const { academies, loadingAcademies } = useAcademies();
  const { users, loadingUsers } = useUsers();

  const {
    removeStudent,
    loading: removingStudent,
    error: removeError,
  } = useAcademyMembershipManagement();

  // Estados locales
  const [selectedStudentId, setSelectedStudentId] = React.useState<string | null>(null);
  const [selectedStudentName, setSelectedStudentName] = React.useState<string>("");
  const [modalOpen, setModalOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'solicitudes' | 'afiliados'>('solicitudes');

  // Obtener la academia primero
  const academy = academies.find((a) => a.organizerId === user?.uid);
  
  // Ahora llamar el hook con el academyId (puede ser undefined, el hook lo maneja)
  const { pendingRequests } = useAcademyJoinRequestsForOrganizer(academy?.id);

  const handleOpenModal = (studentId: string, studentName: string) => {
    setSelectedStudentId(studentId);
    setSelectedStudentName(studentName);
    setModalOpen(true);
  };

  const handleConfirmRemove = async () => {
    if (selectedStudentId && academy?.id && user?.uid) {
      try {
        await removeStudent(
          selectedStudentId,
          academy.id,
          user.uid,
          "Removido por el organizador desde el panel de gestión"
        );
        setModalOpen(false);
        setSelectedStudentId(null);
        setSelectedStudentName("");
      } catch (error) {
        console.error("❌ Error al expulsar estudiante:", error);
      }
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedStudentId(null);
    setSelectedStudentName("");
  };

  if (loadingUser || loadingAcademies || loadingUsers) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Cargando...</p>
        </div>
      </div>
    );
  }

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
    (u) => u.marinera?.academyId === academy.id && u.id !== academy.organizerId
  );

  // Calcular estadísticas dinámicamente
  const totalSolicitudes = pendingRequests.length;
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const solicitudesEsteMes = pendingRequests.filter((request) => {
    if (!request.requestDate) return false;
    
    let requestDate: Date;
    if (typeof request.requestDate === 'object' && 'toDate' in request.requestDate) {
      requestDate = request.requestDate.toDate();
    } else if (request.requestDate instanceof Date) {
      requestDate = request.requestDate;
    } else {
      return false;
    }
    
    return requestDate.getMonth() === currentMonth && requestDate.getFullYear() === currentYear;
  }).length;
  
  const crecimientoMensual = 15; // Esto podrías calcularlo basado en datos históricos

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Header con estadísticas */}
          <AcademyStatsHeader
            academyName={academy.name}
            totalSolicitudes={totalSolicitudes}
            totalAfiliados={students.length}
            solicitudesEsteMes={solicitudesEsteMes}
            crecimientoMensual={crecimientoMensual}
          />

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Contenido principal - más ancho (3/4) */}
            <div className="lg:col-span-3">
              <AcademyTabs
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                totalSolicitudes={totalSolicitudes}
                totalAfiliados={students.length}
              />

              {activeTab === 'solicitudes' ? (
                <AcademyJoinRequestsSection
                  academyId={academy.id!}
                  academyName={academy.name}
                  users={users}
                />
              ) : (
                <AffiliatedStudentsSection
                  students={students}
                  onRemove={handleOpenModal}
                  loading={removingStudent}
                />
              )}

              {removeError && (
                <div className="mt-8">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.982 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <p className="text-red-700 font-medium">Error al expulsar estudiante:</p>
                    </div>
                    <p className="text-red-600 mt-1">{removeError.message}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar - más compacto (1/4) */}
            <div className="lg:col-span-1 space-y-6">
              <AcademyProfileCard 
                academy={academy} 
                organizer={organizer}
                onEdit={() => {}} 
              />
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmRemove}
        message={`¿Deseas desafiliar a ${selectedStudentName} de tu academia? Esta acción actualizará el historial de membresía y no se puede deshacer.`}
        loading={removingStudent}
      />
    </>
  );
};

export default OrganizeAcademyPage;