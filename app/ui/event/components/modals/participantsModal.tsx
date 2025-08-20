import { useEffect } from "react";
import { X, Users, UserCircle2, Trophy, School, User } from "lucide-react";
import Image from "next/image";
import { useParticipantsWithUsers, getParticipantDisplayName, getParticipantImages } from "@/app/hooks/useParticipantsWithUsers";
import { Participant } from "@/app/types/participantType";

// Modal de participantes
interface ParticipantsModalProps {
  isOpen: boolean;
  onClose: () => void;
  participants: Participant[];
  academyName: string;
  eventName: string;
}

export function ParticipantsModal({ 
  isOpen, 
  onClose, 
  participants, 
  academyName, 
  eventName 
}: ParticipantsModalProps) {
  const participantsWithUsers = useParticipantsWithUsers(participants);

  // Efecto para manejar scroll del body
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="z-50 fixed top-0 left-0 right-0 bottom-0 w-screen h-screen bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      style={{ zIndex: 99999 }}
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-[90vw] max-w-4xl h-[90vh] max-h-[800px] min-h-[500px] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header del modal */}
        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold mb-1">Participantes de {academyName}</h2>
                <p className="text-blue-100 text-sm">{eventName}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Contenido del modal */}
        <div className="flex-1 overflow-y-auto p-6">
          {participantsWithUsers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No hay participantes para mostrar</p>
            </div>
          ) : (
            <div className="space-y-4">
              {participantsWithUsers.map((participantWithUsers, index) => (
                <ParticipantCard 
                  key={participantWithUsers.participant.id} 
                  participantWithUsers={participantWithUsers}
                  index={index}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t flex-shrink-0">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Total: {participantsWithUsers.length} participante{participantsWithUsers.length !== 1 ? 's' : ''}
            </span>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors duration-200 font-medium"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente para cada participante
interface ParticipantCardProps {
  participantWithUsers: any; // ParticipantWithUsers del hook
  index: number;
}

function ParticipantCard({ participantWithUsers, index }: ParticipantCardProps) {
  const { participant, users, isLoading, error } = participantWithUsers;
  const displayName = getParticipantDisplayName(participantWithUsers);
  const images = getParticipantImages(participantWithUsers);
  const isCouple = users.length > 1;

  if (isLoading) {
    return (
      <div className="bg-gray-50 rounded-xl p-4 animate-pulse">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            <div className="h-3 bg-gray-300 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
        <div className="flex items-center gap-3 text-red-600">
          <UserCircle2 className="w-5 h-5" />
          <span className="text-sm">Error al cargar participante</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-white to-gray-50 border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-300">
      <div className="flex items-start gap-4">
        {/* Fotos de perfil */}
        <div className="relative flex-shrink-0">
          {isCouple ? (
            // Mostrar dos fotos para parejas
            <div className="relative w-16 h-12">
              {images.map((image, imgIndex) => (
                <div
                  key={imgIndex}
                  className={`absolute w-10 h-10 rounded-full border-2 border-white shadow-md overflow-hidden ${
                    imgIndex === 0 ? 'left-0 z-10' : 'right-0'
                  }`}
                >
                  {image ? (
                    <Image
                      src={image}
                      alt={`Participante ${imgIndex + 1}`}
                      className="w-full h-full object-cover"
                      width={40}
                      height={40}
                      loader={({ src }) => src}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            // Mostrar una foto para individuales
            <div className="w-12 h-12 rounded-full border-2 border-white shadow-md overflow-hidden">
              {images[0] ? (
                <Image
                  src={images[0]}
                  alt="Participante"
                  className="w-full h-full object-cover"
                  width={48}
                  height={48}
                  loader={({ src }) => src}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
              )}
            </div>
          )}
          
          {/* Número de participante */}
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
            {index + 1}
          </div>
        </div>

        {/* Información del participante */}
        <div className="flex-1 min-w-0">
          {/* Nombre */}
          <h3 className="font-bold text-gray-800 text-base mb-2 truncate">
            {displayName}
          </h3>

          {/* Detalles en grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            {/* Categoría */}
            <div className="flex items-center gap-2 p-2 bg-orange-50 rounded-lg border border-orange-100">
              <div className="p-1 bg-orange-100 rounded">
                <Trophy className="w-3 h-3 text-orange-600" />
              </div>
              <div>
                <span className="text-gray-500 block text-xs">Categoría</span>
                <span className="font-medium text-gray-800 capitalize">
                  {participant.category}
                </span>
              </div>
            </div>

            {/* Academia */}
            <div className="flex items-center gap-2 p-2 bg-purple-50 rounded-lg border border-purple-100">
              <div className="p-1 bg-purple-100 rounded">
                <School className="w-3 h-3 text-purple-600" />
              </div>
              <div>
                <span className="text-gray-500 block text-xs">Academia</span>
                <span className="font-medium text-gray-800 text-xs truncate">
                  {participant.academiesName?.[0] || 'Libre'}
                </span>
              </div>
            </div>

            {/* Código */}
            <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg border border-green-100">
              <div className="p-1 bg-green-100 rounded">
                <UserCircle2 className="w-3 h-3 text-green-600" />
              </div>
              <div>
                <span className="text-gray-500 block text-xs">Código</span>
                <span className="font-mono font-bold text-gray-800">
                  {participant.code}
                </span>
              </div>
            </div>

            {/* Nivel/Fase */}
            <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg border border-blue-100">
              <div className="p-1 bg-blue-100 rounded">
                <Trophy className="w-3 h-3 text-blue-600" />
              </div>
              <div>
                <span className="text-gray-500 block text-xs">Nivel</span>
                <span className="font-medium text-gray-800 capitalize">
                  {participant.level || participant.phase || 'No especificado'}
                </span>
              </div>
            </div>
          </div>

          {/* Mostrar nombres individuales para parejas */}
          {isCouple && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <span className="text-xs text-gray-500 block mb-2">Integrantes:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {users.map((user, userIndex) => (
                  <div key={user.id} className="flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-700">
                      {user.firstName} {user.lastName}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}