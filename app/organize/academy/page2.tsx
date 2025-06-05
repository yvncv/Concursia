"use client";

import React, { useState } from "react";
import { 
  Users, 
  Mail, 
  Phone, 
  MapPin, 
  Crown, 
  GraduationCap,
  Search,
  Filter,
  Edit3,
  UserPlus,
  Settings,
  Award,
  TrendingUp,
  Star,
  Globe,
  Facebook,
  Instagram,
  ExternalLink,
  Building2,
  AlertCircle,
  CheckCircle2
} from "lucide-react";

// Hook simulado para la demo - reemplaza con tus hooks reales
const useUser = () => ({ 
  user: { 
    marinera: { academyId: "1" },
    firstName: "Juan",
    lastName: "Pérez"
  }, 
  loadingUser: false 
});

const useAcademies = () => ({ 
  academies: [{
    id: "1",
    name: "Academia Nacional de Marinera Norteña",
    email: ["info@marinera.com", "contacto@marinera.com"],
    phoneNumber: ["+51 987 654 321", "+51 123 456 789"],
    location: {
      street: "Av. La Marina 123",
      district: "Trujillo",
      province: "Trujillo",
      department: "La Libertad",
      placeName: "Centro Cultural Marinera"
    },
    description: "Academia especializada en la enseñanza tradicional de la marinera norteña con más de 20 años de experiencia.",
    website: "https://www.marinera.com",
    socialMedia: {
      facebook: "AcademiaMarinera",
      instagram: "@marinera_norte",
      youtube: "AcademiaMarinera"
    },
    organizerId: "org1"
  }], 
  loadingAcademies: false 
});

const useUsers = () => ({ 
  users: [
    {
      id: "org1",
      firstName: "Carlos",
      lastName: "Rodriguez",
      email: ["carlos@marinera.com"],
      roleId: "organizer"
    },
    {
      id: "1",
      firstName: "María",
      lastName: "González",
      email: ["maria@gmail.com"],
      marinera: {
        academyId: "1",
        participant: {
          level: "Avanzado",
          category: "Adulto Mayor"
        }
      },
      roleId: "user"
    },
    {
      id: "2",
      firstName: "José",
      lastName: "Pérez",
      email: ["jose@gmail.com"],
      marinera: {
        academyId: "1",
        participant: {
          level: "Intermedio",
          category: "Juvenil"
        }
      },
      roleId: "user"
    },
    {
      id: "3",
      firstName: "Ana",
      lastName: "Torres",
      email: ["ana@gmail.com"],
      marinera: {
        academyId: "1",
        participant: {
          level: "Principiante",
          category: "Infantil"
        }
      },
      roleId: "user"
    }
  ], 
  loadingUsers: false 
});

const OrganizeAcademyPage = () => {
  const { user, loadingUser } = useUser();
  const { academies, loadingAcademies } = useAcademies();
  const { users, loadingUsers } = useUsers();
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState("Todos");
  const [activeTab, setActiveTab] = useState("overview");

  if (loadingUser || loadingAcademies || loadingUsers) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-200 border-t-red-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-700">Cargando datos de la academia...</p>
        </div>
      </div>
    );
  }

  const academy = academies.find((a) => a.id === user?.marinera?.academyId);
  
  if (!academy) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Academia no encontrada</h2>
          <p className="text-gray-600 mb-6">No se pudo encontrar la información de tu academia.</p>
          <button className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors">
            Contactar Soporte
          </button>
        </div>
      </div>
    );
  }

  const organizer = users.find((u) => u.id === academy.organizerId);
  const students = users.filter(
    (u) => u.marinera?.academyId === academy.id && u.id !== academy.organizerId
  );

  const filteredStudents = students.filter(student => {
    const matchesSearch = `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = levelFilter === "Todos" || student.marinera?.participant?.level === levelFilter;
    return matchesSearch && matchesLevel;
  });

  const stats = {
    totalStudents: students.length,
    levels: {
      principiante: students.filter(s => s.marinera?.participant?.level === "Principiante").length,
      intermedio: students.filter(s => s.marinera?.participant?.level === "Intermedio").length,
      avanzado: students.filter(s => s.marinera?.participant?.level === "Avanzado").length
    }
  };

  const TabButton = ({ id, label, icon: Icon, isActive, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
        isActive 
          ? 'bg-red-600 text-white shadow-lg shadow-red-200' 
          : 'text-gray-600 hover:bg-red-50 hover:text-red-600 hover:shadow-md'
      }`}
    >
      <Icon size={18} />
      {label}
    </button>
  );

  const StatCard = ({ title, value, icon: Icon, color = "red", subtitle }) => (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-br from-${color}-100 to-${color}-200 group-hover:scale-110 transition-transform duration-300`}>
          <Icon className={`text-${color}-600`} size={24} />
        </div>
      </div>
      <h3 className="text-3xl font-bold text-gray-900 mb-1">{value}</h3>
      <p className="text-gray-600 font-medium">{title}</p>
      {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );

  const InfoCard = ({ title, children, icon: Icon }) => (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="bg-gradient-to-r from-red-600 to-red-700 p-4">
        <div className="flex items-center gap-3">
          <Icon className="text-white" size={24} />
          <h2 className="text-xl font-semibold text-white">{title}</h2>
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );

  const StudentCard = ({ student }) => (
    <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300 group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
            {student.firstName[0]}{student.lastName[0]}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 group-hover:text-red-600 transition-colors">
              {student.firstName} {student.lastName}
            </h3>
            <p className="text-gray-600 text-sm">{student.email[0]}</p>
          </div>
        </div>
        <button className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-600">
          <Edit3 size={16} />
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-xs text-blue-600 font-medium mb-1">NIVEL</p>
          <span className="text-sm font-semibold text-blue-800">
            {student.marinera?.participant?.level || "-"}
          </span>
        </div>
        <div className="bg-green-50 p-3 rounded-lg">
          <p className="text-xs text-green-600 font-medium mb-1">CATEGORÍA</p>
          <span className="text-sm font-semibold text-green-800">
            {student.marinera?.participant?.category || "-"}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
      {/* Header con diseño mejorado */}
      <div className="bg-white shadow-xl border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center">
                  <GraduationCap className="text-white" size={24} />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Panel de Academia</h1>
                  <p className="text-red-600 font-medium">{academy.name}</p>
                </div>
              </div>
              <p className="text-gray-600">Gestiona la información y alumnos de tu academia</p>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-lg hover:shadow-xl">
                <UserPlus size={18} />
                Agregar Alumno
              </button>
              <button className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors">
                <Settings size={18} />
                Configurar
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Navigation Tabs con mejor diseño */}
        <div className="flex gap-2 mb-8 bg-white p-2 rounded-2xl shadow-lg border border-gray-200">
          <TabButton
            id="overview"
            label="Resumen"
            icon={TrendingUp}
            isActive={activeTab === "overview"}
            onClick={setActiveTab}
          />
          <TabButton
            id="academy"
            label="Información"
            icon={Building2}
            isActive={activeTab === "academy"}
            onClick={setActiveTab}
          />
          <TabButton
            id="students"
            label="Alumnos"
            icon={Users}
            isActive={activeTab === "students"}
            onClick={setActiveTab}
          />
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Total de Alumnos"
                value={stats.totalStudents}
                icon={Users}
                color="red"
                subtitle="Estudiantes registrados"
              />
              <StatCard
                title="Nivel Principiante"
                value={stats.levels.principiante}
                icon={Star}
                color="blue"
                subtitle="Estudiantes iniciales"
              />
              <StatCard
                title="Nivel Intermedio"
                value={stats.levels.intermedio}
                icon={Award}
                color="green"
                subtitle="En progreso"
              />
              <StatCard
                title="Nivel Avanzado"
                value={stats.levels.avanzado}
                icon={Crown}
                color="purple"
                subtitle="Estudiantes expertos"
              />
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Alumnos Destacados</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {students.slice(0, 6).map((student) => (
                  <StudentCard key={student.id} student={student} />
                ))}
              </div>
            </div>
          </>
        )}

        {/* Academy Information Tab */}
        {activeTab === "academy" && (
          <div className="space-y-6">
            <InfoCard title="Información General" icon={Building2}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Datos Básicos</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <GraduationCap className="text-red-600" size={20} />
                      <div>
                        <p className="text-sm text-gray-500">Nombre</p>
                        <p className="font-medium text-gray-900">{academy.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="text-red-600" size={20} />
                      <div>
                        <p className="text-sm text-gray-500">Emails</p>
                        <p className="font-medium text-gray-900">
                          {Array.isArray(academy.email) ? academy.email.join(", ") : academy.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="text-red-600" size={20} />
                      <div>
                        <p className="text-sm text-gray-500">Teléfonos</p>
                        <p className="font-medium text-gray-900">
                          {Array.isArray(academy.phoneNumber) ? academy.phoneNumber.join(", ") : academy.phoneNumber}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Ubicación</h3>
                  <div className="flex items-start gap-3">
                    <MapPin className="text-red-600 mt-1" size={20} />
                    <div>
                      <p className="font-medium text-gray-900">{academy.location?.placeName}</p>
                      <p className="text-gray-600">
                        {academy.location?.street}, {academy.location?.district}
                      </p>
                      <p className="text-gray-600">
                        {academy.location?.province}, {academy.location?.department}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {academy.description && (
                <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                  <h3 className="font-semibold text-gray-900 mb-2">Descripción</h3>
                  <p className="text-gray-700">{academy.description}</p>
                </div>
              )}

              {(academy.website || academy.socialMedia) && (
                <div className="mt-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Enlaces</h3>
                  <div className="flex flex-wrap gap-3">
                    {academy.website && (
                      <a 
                        href={academy.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                      >
                        <Globe size={16} />
                        Sitio Web
                        <ExternalLink size={14} />
                      </a>
                    )}
                    {academy.socialMedia?.facebook && (
                      <a 
                        href={`https://facebook.com/${academy.socialMedia.facebook}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Facebook size={16} />
                        Facebook
                      </a>
                    )}
                    {academy.socialMedia?.instagram && (
                      <a 
                        href={`https://instagram.com/${academy.socialMedia.instagram}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                      >
                        <Instagram size={16} />
                        Instagram
                      </a>
                    )}
                  </div>
                </div>
              )}
            </InfoCard>

            <InfoCard title="Organizador" icon={Crown}>
              {organizer ? (
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                    {organizer.firstName[0]}{organizer.lastName[0]}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {organizer.firstName} {organizer.lastName}
                    </h3>
                    <p className="text-gray-600 flex items-center gap-2">
                      <Mail size={16} />
                      {organizer.email.join(", ")}
                    </p>
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium mt-2">
                      <Crown size={14} />
                      Director de Academia
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">Organizador no encontrado</p>
                </div>
              )}
            </InfoCard>
          </div>
        )}

        {/* Students Tab */}
        {activeTab === "students" && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      placeholder="Buscar alumnos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Filter className="text-gray-600" size={20} />
                  <select
                    value={levelFilter}
                    onChange={(e) => setLevelFilter(e.target.value)}
                    className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="Todos">Todos los niveles</option>
                    <option value="Principiante">Principiante</option>
                    <option value="Intermedio">Intermedio</option>
                    <option value="Avanzado">Avanzado</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Students Grid/List */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Alumnos Afiliados ({filteredStudents.length})
                </h2>
                <CheckCircle2 className="text-green-600" size={24} />
              </div>

              {filteredStudents.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchTerm || levelFilter !== "Todos" ? "No se encontraron alumnos" : "No hay alumnos afiliados"}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {searchTerm || levelFilter !== "Todos" 
                      ? "Intenta ajustar los filtros de búsqueda" 
                      : "Comienza agregando alumnos a tu academia"
                    }
                  </p>
                  <button className="bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 transition-colors">
                    Agregar Primer Alumno
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredStudents.map((student) => (
                    <StudentCard key={student.id} student={student} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizeAcademyPage;