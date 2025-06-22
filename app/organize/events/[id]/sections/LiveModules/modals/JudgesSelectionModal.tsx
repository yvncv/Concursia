import React, { useState } from 'react';
import { BlockInTanda } from '@/app/types/blockInTandaType';
import useUsers from '@/app/hooks/useUsers';
import { updateTandaBlocks } from '@/app/services/updateTandaBlocks';

interface JudgeSelectionModalProps {
  open: boolean;
  onClose: () => void;
  eventId: string;
  liveCompetitionId: string;
  tandaId: string;
  eventStaff: { userId: string; permissions: string[] }[];
  tandaBlocks: BlockInTanda[];
  onConfirm: (updatedBlocks: BlockInTanda[]) => void;
  judgesCount: number; // 👈 Nuevo prop
}

export const JudgeSelectionModal: React.FC<JudgeSelectionModalProps> = ({
  open,
  onClose,
  eventId,
  liveCompetitionId,
  tandaId,
  eventStaff,
  tandaBlocks,
  onConfirm,
  judgesCount,
}) => {
  const judges = eventStaff.filter(member => member.permissions.includes('judge'));
  const judgeIds = judges.map(j => j.userId);
  const { users, loadingUsers } = useUsers(judgeIds);
  const usersMap = Object.fromEntries(users.map(user => [user.id, user]));

  const alreadyAssignedJudgeIds = new Set(
    tandaBlocks.flatMap(block => block.judgeIds || [])
  );
  
  const [selectedJudges, setSelectedJudges] = useState<string[]>([]);

  const toggleJudge = (userId: string) => {
    if (alreadyAssignedJudgeIds.has(userId)) return;
    setSelectedJudges(prev => {
      const isSelected = prev.includes(userId);
      if (isSelected) {
        return prev.filter(id => id !== userId);
      } else {
        if (prev.length >= judgesCount) return prev;
        return [...prev, userId];
      }
    });
  };

  const handleConfirm = async () => {
    const updatedBlocks: BlockInTanda[] = tandaBlocks.map(block => ({
      ...block,
      judgeIds: selectedJudges,
    }));

    try {
      await updateTandaBlocks(eventId, liveCompetitionId, tandaId, updatedBlocks);
      onConfirm(updatedBlocks);
      onClose();
    } catch (error) {
      alert("Error al guardar los jurados. Intenta nuevamente.");
      console.error(error);
    }
  };

  if (!open) return null;

  if (loadingUsers) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />
        <div className="bg-white rounded-xl p-6 shadow-lg text-center">
          <div className="animate-spin w-6 h-6 border-2 border-t-transparent border-red-500 rounded-full mx-auto mb-3" />
          <p className="text-gray-700">Cargando jurados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 transform transition-all">
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Asignar Jurados</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-gray-700 mt-1">Selecciona hasta {judgesCount} jurado(s) para todos los bloques</p>
          <div className="text-xs mt-1 space-y-1">
            <p className="font-semibold text-gray-700">Notas importantes:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li>
                Los usuarios con <span className="font-medium text-red-500">check</span> y <span className="font-medium text-red-500">punto rojo</span> ya han sido asignados previamente.
              </li>
              <li>
                Se pueden deseleccionar y volver a asignar (esté seguro de realizar cualquier cambio).
              </li>
              <li>
                Si seleccionas jurados nuevos y <span className="font-medium text-red-500">cierras sin guardar</span>, las selecciones se conservarán al reabrir.
              </li>
            </ul>
          </div>
        </div>

        <div className="px-6 py-4">
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {judges.length > 0 ? (
              judges.map(judge => {
                const user = usersMap[judge.userId];
                const isAlreadyAssigned = alreadyAssignedJudgeIds.has(judge.userId);
                const isSelected = selectedJudges.includes(judge.userId);
                const isChecked = isAlreadyAssigned || isSelected;
                const disabled = (!isSelected && selectedJudges.length >= judgesCount);

                return (
                  <label
                    key={judge.userId}
                    className={`flex items-center gap-3 p-1 rounded-lg transition-colors group cursor-pointer ${
                      disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="relative">
                      <input
                      type="checkbox"
                      disabled={disabled}
                      checked={isChecked}
                      onChange={() => toggleJudge(judge.userId)}
                      className="sr-only"
                    />
                      <div className={`w-5 h-5 rounded border-2 transition-all ${
                        isChecked && isAlreadyAssigned
                          ?'bg-red-600 border-red-600' :
                        isChecked ?
                          'bg-gray-400 border-gray-300 group-hover:border-red-300' :
                          "group-hover:border-red-300"
                      }`}>
                        {(isChecked) && (
                          <svg className="w-3 h-3 text-white absolute top-0.5 left-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                          </span>
                        </div>
                        <span className="font-medium text-gray-900">
                          {user?.firstName} {user?.lastName}
                        </span>
                      </div>
                    </div>

                    {isAlreadyAssigned && <div className="w-2 h-2 bg-red-600 rounded-full" />}
                  </label>
                );
              })
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <p className="text-gray-500 text-sm">No hay jurados disponibles</p>
              </div>
            )}
          </div>
        </div>

        {selectedJudges.length >= judgesCount && (
          <div className="px-6 text-sm text-red-600 font-medium">
            Has alcanzado el máximo de jurados permitidos.
          </div>
        )}

        <div className="px-6 py-4 border-t border-gray-100 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={selectedJudges.length === 0}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              selectedJudges.length === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-red-600 text-white hover:bg-red-700 transform hover:scale-105'
            }`}
          >
            Asignar a todos los bloques
          </button>
        </div>
      </div>
    </div>
  );
};
