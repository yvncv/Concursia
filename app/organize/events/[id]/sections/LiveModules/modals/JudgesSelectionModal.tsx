import React, { useState, useEffect } from 'react';
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
  judgesCount: number; // Cantidad EXACTA requerida
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
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (open) {
      const assigned = tandaBlocks.flatMap(block => block.judgeIds || []);
      const unique = Array.from(new Set(assigned));
      setSelectedJudges(unique);
    }
  }, [open, tandaBlocks]);

  const toggleJudge = (userId: string) => {
    const isSelected = selectedJudges.includes(userId);
    
    if (isSelected) {
      // Si ya está seleccionado, lo removemos
      if (alreadyAssignedJudgeIds.has(userId)) {
        const confirmRemove = confirm("Este jurado ya estaba asignado previamente. ¿Deseas quitarlo?");
        if (!confirmRemove) return;
      }
      setSelectedJudges(prev => prev.filter(id => id !== userId));
    } else {
      // Si no está seleccionado, lo agregamos solo si no hemos alcanzado el límite
      if (selectedJudges.length < judgesCount) {
        setSelectedJudges(prev => [...prev, userId]);
      }
    }
  };

  const handleConfirm = async () => {
    // Validación estricta: debe tener exactamente la cantidad requerida
    if (selectedJudges.length !== judgesCount) {
      alert(`Debes seleccionar exactamente ${judgesCount} jurado(s). Actualmente tienes ${selectedJudges.length} seleccionado(s).`);
      return;
    }

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

  const handleClose = () => {
    const currentIds = tandaBlocks.flatMap(b => b.judgeIds || []);
    const original = Array.from(new Set(currentIds)).sort().join(',');
    const current = [...selectedJudges].sort().join(',');
    if (current !== original) {
      if (!confirm('¿Salir sin guardar los cambios realizados en la asignación de jurados?')) return;
    }
    onClose();
  };

  // Filtrar jurados por término de búsqueda
  const filteredJudges = judges.filter(judge => {
    const user = usersMap[judge.userId];
    if (!user) return false;
    
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  // Verificar si se puede confirmar (exactamente la cantidad requerida)
  const canConfirm = selectedJudges.length === judgesCount;
  
  // Verificar si se puede seleccionar más jurados
  const canSelectMore = selectedJudges.length < judgesCount;

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
      <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 transform transition-all max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Seleccionar Jurados</h2>
            <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="mt-3">
            <div className="text-sm text-gray-700 mb-2">
              <span className="font-semibold">Requerido:</span> Exactamente {judgesCount} jurado(s) para todos los bloques
            </div>
            
            {/* Contador de seleccionados */}
            <div className={`text-sm font-medium ${
              canConfirm 
                ? 'text-green-600 bg-green-50 border border-green-200' 
                : selectedJudges.length > judgesCount
                  ? 'text-red-600 bg-red-50 border border-red-200'
                  : 'text-orange-600 bg-orange-50 border border-orange-200'
            } px-3 py-2 rounded-lg inline-block`}>
              {selectedJudges.length} de {judgesCount} seleccionados
              {canConfirm && ' ✓ Listo para asignar'}
              {selectedJudges.length < judgesCount && ` (faltan ${judgesCount - selectedJudges.length})`}
              {selectedJudges.length > judgesCount && ` (sobran ${selectedJudges.length - judgesCount})`}
            </div>
          </div>

          {/* Buscador */}
          <div className="mt-4">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Buscar por nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Notas importantes */}
          <div className="text-xs mt-3 space-y-1">
            <p className="font-semibold text-gray-700">Notas importantes:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>Los usuarios con <span className="font-medium text-red-500">punto rojo</span> ya estaban asignados previamente.</li>
              <li>Debes seleccionar exactamente {judgesCount} jurado(s), no más, no menos.</li>
              <li>Si cierras sin guardar, las selecciones se conservarán al reabrir.</li>
            </ul>
          </div>
        </div>

        {/* Lista de jurados */}
        <div className="px-6 py-4 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 300px)' }}>
          <div className="space-y-3">
            {filteredJudges.length > 0 ? (
              filteredJudges.map(judge => {
                const user = usersMap[judge.userId];
                const isAlreadyAssigned = alreadyAssignedJudgeIds.has(judge.userId);
                const isSelected = selectedJudges.includes(judge.userId);
                const canSelect = canSelectMore || isSelected;

                return (
                  <label
                    key={judge.userId}
                    className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                      isSelected 
                        ? isAlreadyAssigned 
                          ? 'border-red-500 bg-red-50' 
                          : 'border-green-500 bg-green-50'
                        : canSelect
                          ? 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                          : 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="relative">
                      <input
                        type="checkbox"
                        disabled={!canSelect}
                        checked={isSelected}
                        onChange={() => toggleJudge(judge.userId)}
                        className="sr-only"
                      />
                      <div className={`w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center ${
                        isSelected && isAlreadyAssigned
                          ? 'bg-red-500 border-red-500' 
                          : isSelected 
                            ? 'bg-green-500 border-green-500'
                            : canSelect
                              ? 'border-gray-300 hover:border-blue-400'
                              : 'border-gray-200'
                      }`}>
                        {isSelected && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>

                    {/* Foto y datos del jurado */}
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
                        {user?.profileImage ? (
                          <img
                            src={typeof user.profileImage === 'string' ? user.profileImage : URL.createObjectURL(user.profileImage)}
                            alt={`${user.firstName} ${user.lastName}`}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-white text-sm font-medium">
                            {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {user?.firstName} {user?.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          Jurado {isAlreadyAssigned ? '(ya asignado)' : '(disponible)'}
                        </div>
                      </div>
                    </div>

                    {/* Indicadores visuales */}
                    <div className="flex items-center space-x-2">
                      {isAlreadyAssigned && (
                        <div className="w-3 h-3 bg-red-500 rounded-full" title="Ya estaba asignado" />
                      )}
                      {isSelected && !isAlreadyAssigned && (
                        <div className="w-3 h-3 bg-green-500 rounded-full" title="Recién seleccionado" />
                      )}
                    </div>
                  </label>
                );
              })
            ) : judges.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <p className="text-gray-500 text-sm">No hay jurados disponibles</p>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">No se encontraron jurados con ese nombre</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer con botones */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3 justify-end">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={!canConfirm}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              canConfirm 
                ? 'bg-green-600 text-white hover:bg-green-700 transform hover:scale-105' 
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {canConfirm 
              ? `Asignar ${judgesCount} jurado(s) a todos los bloques`
              : `Selecciona exactamente ${judgesCount} jurado(s)`
            }
          </button>
        </div>
      </div>
    </div>
  );
};