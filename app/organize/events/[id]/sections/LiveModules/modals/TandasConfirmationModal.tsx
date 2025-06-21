import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Users } from 'lucide-react';
import { Tanda } from '@/app/types/tandaType';
import { Participant } from '@/app/types/participantType';
import { useParticipantsWithUsers, getParticipantDisplayName, getParticipantImages } from '@/app/hooks/useParticipantsWithUsers';

interface TandasConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  tandas: Tanda[];
  allParticipants: Participant[];
  level: string;
  category: string;
  gender: string;
  isLoading?: boolean;
}

interface ParticipantCardProps {
  participantId: string;
  allParticipants: Participant[];
  trackNumber: number;
}

const ParticipantCard: React.FC<ParticipantCardProps> = ({ 
  participantId, 
  allParticipants, 
  trackNumber 
}) => {
  // Encontrar el participante
  const participant = allParticipants.find(p => p.id === participantId);
  const participantsWithUsers = useParticipantsWithUsers(participant ? [participant] : []);
  const participantWithUsers = participantsWithUsers[0];

  if (!participant || !participantWithUsers) {
    return (
      <div className="bg-gray-100 rounded-lg p-3 text-center">
        <div className="text-gray-500 text-sm">Cargando...</div>
      </div>
    );
  }

  if (participantWithUsers.isLoading) {
    return (
      <div className="bg-gray-100 rounded-lg p-3 text-center">
        <div className="animate-pulse">
          <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-2"></div>
          <div className="h-4 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  const displayName = getParticipantDisplayName(participantWithUsers);
  const images = getParticipantImages(participantWithUsers);
  const isCouple = participantWithUsers.users.length === 2;

  return (
    <div className="bg-white rounded-lg border-2 border-orange-300 p-3 text-center shadow-sm">
      {/* Imagen(es) del participante */}
      <div className="mb-2">
        {isCouple ? (
          // Mostrar dos imágenes para pareja
          <div className="flex justify-center space-x-1">
            {images.map((image, index) => (
              <div key={index} className="relative">
                {image ? (
                  <img 
                    src={image} 
                    alt={`Participante ${index + 1}`}
                    className="w-12 h-12 rounded-full object-cover border-2 border-white"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center border-2 border-white">
                    <Users className="w-6 h-6 text-gray-500" />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          // Mostrar una imagen para individual
          <div className="flex justify-center">
            {images[0] ? (
              <img 
                src={images[0]} 
                alt="Participante"
                className="w-16 h-16 rounded-full object-cover border-2 border-white"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center border-2 border-white">
                <Users className="w-8 h-8 text-gray-500" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Nombre del participante */}
      <div className="text-sm font-medium text-gray-800 mb-1">
        {displayName}
      </div>

      {/* Código del participante */}
      <div className="text-xs text-gray-500">
        #{participant.code}
      </div>
    </div>
  );
};

export const TandasConfirmationModal: React.FC<TandasConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  tandas,
  allParticipants,
  level,
  category,
  gender,
  isLoading = false
}) => {
  const [currentTandaIndex, setCurrentTandaIndex] = useState(0);

  if (!isOpen) return null;

  const currentTanda = tandas[currentTandaIndex];
  const totalParticipants = tandas.reduce((total, tanda) => 
    total + tanda.blocks.reduce((blockTotal, block) => blockTotal + block.participants.length, 0), 0
  );

  const handlePreviousTanda = () => {
    setCurrentTandaIndex(prev => Math.max(0, prev - 1));
  };

  const handleNextTanda = () => {
    setCurrentTandaIndex(prev => Math.min(tandas.length - 1, prev + 1));
  };

  const handleTandaClick = (index: number) => {
    setCurrentTandaIndex(index);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Asignación de Participantes</h2>
            <p className="text-blue-100 text-sm">
              {level} - {category} {gender}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-blue-700 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Información de la tanda actual */}
        <div className="bg-gray-50 p-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="bg-orange-500 text-white px-3 py-1 rounded font-medium">
                Tanda N°: {currentTandaIndex + 1}
              </span>
              <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded">
                Participantes: {currentTanda?.blocks.reduce((total, block) => total + block.participants.length, 0) || 0}
              </span>
            </div>
            
            {/* Navegación entre tandas */}
            {tandas.length > 1 && (
              <div className="flex items-center space-x-2">
                <button 
                  onClick={handlePreviousTanda}
                  disabled={currentTandaIndex === 0}
                  className="p-1 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                <div className="flex space-x-1">
                  {tandas.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => handleTandaClick(index)}
                      className={`w-8 h-8 rounded text-sm font-medium transition-colors ${
                        index === currentTandaIndex
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
                
                <button 
                  onClick={handleNextTanda}
                  disabled={currentTandaIndex === tandas.length - 1}
                  className="p-1 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Contenido del modal */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {currentTanda && (
            <div className="space-y-6">
              {currentTanda.blocks.map((block, blockIndex) => (
                <div key={blockIndex}>
                  {/* Header del bloque (solo si hay múltiples bloques) */}
                  {currentTanda.blocks.length > 1 && (
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Bloque {blockIndex + 1}
                    </h3>
                  )}
                  
                  {/* Grid de pistas */}
                  <div className="bg-orange-100 rounded-lg p-4">
                    {/* Headers de pistas */}
                    <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: `repeat(${block.participants.length}, 1fr)` }}>
                      {block.participants.map((_, trackIndex) => (
                        <div key={trackIndex} className="text-center">
                          <div className="bg-red-500 text-white py-2 px-4 rounded-t font-medium">
                            PISTA {trackIndex + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Participantes */}
                    <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${block.participants.length}, 1fr)` }}>
                      {block.participants.map((tandaParticipant, trackIndex) => (
                        <ParticipantCard
                          key={tandaParticipant.participantId}
                          participantId={tandaParticipant.participantId}
                          allParticipants={allParticipants}
                          trackNumber={trackIndex + 1}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Resumen */}
          <div className="mt-6 pt-4 border-t border-gray-200 text-center text-sm text-gray-600">
            <p>
              Total: {tandas.length} tanda{tandas.length !== 1 ? 's' : ''} • {totalParticipants} participantes
            </p>
          </div>
        </div>

        {/* Footer con botones */}
        <div className="bg-gray-50 p-4 flex justify-end space-x-3 border-t">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-600 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Confirmando...' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
};