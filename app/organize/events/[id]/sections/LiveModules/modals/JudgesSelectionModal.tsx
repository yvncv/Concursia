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
  judgesCount: number;
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

  const [blockJudges, setBlockJudges] = useState<string[][]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [draggedJudge, setDraggedJudge] = useState<string | null>(null);
  const [dragOverBlock, setDragOverBlock] = useState<number | null>(null);

  useEffect(() => {
    if (open) {
      const initialBlockJudges = tandaBlocks.map(block => block.judgeIds || []);
      setBlockJudges(initialBlockJudges);
    }
  }, [open, tandaBlocks]);

  const getAllAssignedJudges = (): Set<string> => {
    const allAssigned = new Set<string>();
    blockJudges.forEach(judges => {
      judges.forEach(judgeId => allAssigned.add(judgeId));
    });
    return allAssigned;
  };

  const isJudgeAssigned = (judgeId: string): boolean => {
    return getAllAssignedJudges().has(judgeId);
  };

  const getNextAvailableBlock = (): number => {
    for (let i = 0; i < blockJudges.length; i++) {
      if (blockJudges[i].length < judgesCount) {
        return i;
      }
    }
    return -1;
  };

  const findJudgeBlock = (judgeId: string): number => {
    for (let i = 0; i < blockJudges.length; i++) {
      if (blockJudges[i].includes(judgeId)) {
        return i;
      }
    }
    return -1;
  };

  const toggleJudge = (userId: string) => {
    const isAssigned = isJudgeAssigned(userId);
    
    if (isAssigned) {
      const blockIndex = findJudgeBlock(userId);
      if (blockIndex !== -1) {
        const wasOriginallyAssigned = tandaBlocks[blockIndex]?.judgeIds?.includes(userId);
        if (wasOriginallyAssigned) {
          const confirmRemove = confirm("Este jurado ya estaba asignado previamente. ¿Deseas quitarlo?");
          if (!confirmRemove) return;
        }
        
        const newBlockJudges = [...blockJudges];
        newBlockJudges[blockIndex] = newBlockJudges[blockIndex].filter(id => id !== userId);
        setBlockJudges(newBlockJudges);
      }
    } else {
      const nextBlock = getNextAvailableBlock();
      if (nextBlock !== -1) {
        const newBlockJudges = [...blockJudges];
        newBlockJudges[nextBlock] = [...newBlockJudges[nextBlock], userId];
        setBlockJudges(newBlockJudges);
      }
    }
  };

  // Drag and Drop functions
  const handleDragStart = (e: React.DragEvent, judgeId: string) => {
    setDraggedJudge(judgeId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, blockIndex: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverBlock(blockIndex);
  };

  const handleDragLeave = () => {
    setDragOverBlock(null);
  };

  const handleDrop = (e: React.DragEvent, targetBlockIndex: number) => {
    e.preventDefault();
    setDragOverBlock(null);
    
    if (!draggedJudge) return;

    const currentBlockIndex = findJudgeBlock(draggedJudge);
    
    // Si ya está en el bloque objetivo, no hacer nada
    if (currentBlockIndex === targetBlockIndex) return;

    const newBlockJudges = [...blockJudges];

    // Remover del bloque actual si está asignado
    if (currentBlockIndex !== -1) {
      newBlockJudges[currentBlockIndex] = newBlockJudges[currentBlockIndex].filter(id => id !== draggedJudge);
    }

    // Agregar al bloque objetivo
    newBlockJudges[targetBlockIndex] = [...newBlockJudges[targetBlockIndex], draggedJudge];
    
    setBlockJudges(newBlockJudges);
    setDraggedJudge(null);
  };

  const removeJudgeFromBlock = (judgeId: string, blockIndex: number) => {
    const wasOriginallyAssigned = tandaBlocks[blockIndex]?.judgeIds?.includes(judgeId);
    if (wasOriginallyAssigned) {
      const confirmRemove = confirm("Este jurado ya estaba asignado previamente. ¿Deseas quitarlo?");
      if (!confirmRemove) return;
    }

    const newBlockJudges = [...blockJudges];
    newBlockJudges[blockIndex] = newBlockJudges[blockIndex].filter(id => id !== judgeId);
    setBlockJudges(newBlockJudges);
  };

  const handleConfirm = async () => {
    const incompleteBlocks = blockJudges.map((judges, index) => ({
      block: index,
      current: judges.length,
      needed: judgesCount
    })).filter(block => block.current !== judgesCount);

    if (incompleteBlocks.length > 0) {
      const blockNames = incompleteBlocks.map(b => 
        `Bloque ${String.fromCharCode(65 + b.block)}: ${b.current}/${b.needed}`
      ).join(', ');
      
      const confirmSave = confirm(
        `⚠️ Algunos bloques están incompletos:\n${blockNames}\n\n¿Deseas guardar la asignación actual de todas formas?`
      );
      if (!confirmSave) return;
    }

    const updatedBlocks: BlockInTanda[] = tandaBlocks.map((block, index) => ({
      ...block,
      judgeIds: blockJudges[index] || [],
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
    const hasChanges = blockJudges.some((judges, index) => {
      const originalJudges = (tandaBlocks[index]?.judgeIds || []).sort();
      const currentJudges = judges.sort();
      return JSON.stringify(originalJudges) !== JSON.stringify(currentJudges);
    });

    if (hasChanges) {
      if (!confirm('¿Salir sin guardar los cambios realizados en la asignación de jurados?')) return;
    }
    onClose();
  };

  const filteredJudges = judges.filter(judge => {
    const user = usersMap[judge.userId];
    if (!user) return false;
    
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  const totalAssigned = getAllAssignedJudges().size;
  const totalNeeded = tandaBlocks.length * judgesCount;
  const canSelectMore = totalAssigned < judges.length;
  const allBlocksComplete = blockJudges.every(judges => judges.length === judgesCount);

  if (!open) return null;

  if (loadingUsers) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />
        <div className="bg-white rounded-2xl p-8 shadow-xl text-center max-w-sm mx-4">
          <div className="animate-spin w-8 h-8 border-3 border-t-transparent border-red-500 rounded-full mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Cargando Jurados</h3>
          <p className="text-gray-600">Obteniendo información de los jurados disponibles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-7xl transform transition-all max-h-[95vh] overflow-hidden">
        {/* Header mejorado */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 px-8 py-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                Distribución de Jurados
              </h2>
              <p className="text-red-100 mt-1">
                Organiza a los jurados en {tandaBlocks.length} bloque{tandaBlocks.length > 1 ? 's' : ''} de evaluación
              </p>
            </div>
            <button 
              onClick={handleClose} 
              className="p-3 hover:bg-white/20 rounded-xl transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Estadísticas mejoradas */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="text-2xl font-bold">{totalAssigned}</div>
              <div className="text-red-100 text-sm">Jurados Asignados</div>
              <div className="text-xs text-red-200 mt-1">de {judges.length} disponibles</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="text-2xl font-bold">{judgesCount}</div>
              <div className="text-red-100 text-sm">Por Bloque</div>
              <div className="text-xs text-red-200 mt-1">{totalNeeded} total necesarios</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className={`text-2xl font-bold ${allBlocksComplete ? 'text-green-200' : 'text-yellow-200'}`}>
                {blockJudges.filter(judges => judges.length === judgesCount).length}/{tandaBlocks.length}
              </div>
              <div className="text-red-100 text-sm">Bloques Completos</div>
              <div className="text-xs text-red-200 mt-1">
                {allBlocksComplete ? '¡Todos listos!' : 'En progreso'}
              </div>
            </div>
          </div>
        </div>

        {/* Búsqueda mejorada */}
        <div className="px-8 py-4 bg-gray-50 border-b">
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Buscar jurado por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm transition-all"
            />
          </div>
        </div>

        {/* Contenido principal mejorado */}
        <div className="flex flex-col lg:flex-row" style={{ height: 'calc(95% - 280px)' }}>
          {/* Lista de jurados (izquierda) */}
          <div className="w-full lg:w-2/5 px-6 py-4 overflow-y-auto border-r border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                Jurados Disponibles
              </h3>
              <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                {filteredJudges.length}
              </span>
            </div>
            
            <div className="space-y-2">
              {filteredJudges.length > 0 ? (
                filteredJudges.map(judge => {
                  const user = usersMap[judge.userId];
                  const isAssigned = isJudgeAssigned(judge.userId);
                  const assignedBlock = findJudgeBlock(judge.userId);
                  const wasOriginallyAssigned = tandaBlocks.some(block => 
                    block.judgeIds?.includes(judge.userId)
                  );
                  const nextAvailableBlock = getNextAvailableBlock();

                  return (
                    <div
                      key={judge.userId}
                      draggable
                      onDragStart={(e) => handleDragStart(e, judge.userId)}
                      className={`group relative flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 cursor-move hover:shadow-lg ${
                        isAssigned 
                          ? wasOriginallyAssigned 
                            ? 'border-red-300 bg-gradient-to-r from-red-50 to-red-100 shadow-sm' 
                            : 'border-green-300 bg-gradient-to-r from-green-50 to-green-100 shadow-sm'
                          : 'border-gray-200 bg-white hover:border-red-300 hover:bg-red-50'
                      }`}
                    >
                      {/* Drag handle */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                        </svg>
                      </div>

                      {/* Avatar mejorado */}
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                          {user?.profileImage ? (
                            <img
                              src={typeof user.profileImage === 'string' ? user.profileImage : URL.createObjectURL(user.profileImage)}
                              alt={`${user.firstName} ${user.lastName}`}
                              className="w-12 h-12 rounded-xl object-cover"
                            />
                          ) : (
                            <span className="text-white text-sm font-bold">
                              {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                            </span>
                          )}
                        </div>
                        
                        {/* Status indicator */}
                        <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                          isAssigned 
                            ? wasOriginallyAssigned ? 'bg-red-500' : 'bg-green-500'
                            : 'bg-gray-300'
                        }`} />
                      </div>
                      
                      {/* Info del jurado */}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 text-base truncate">
                          {user?.firstName} {user?.lastName}
                        </div>
                        <div className={`text-sm mt-1 ${
                          isAssigned 
                            ? wasOriginallyAssigned ? 'text-red-600' : 'text-green-600'
                            : 'text-gray-500'
                        }`}>
                          {isAssigned 
                            ? `📍 Bloque ${String.fromCharCode(65 + assignedBlock)}`
                            : nextAvailableBlock !== -1 
                              ? `→ Se asignará al Bloque ${String.fromCharCode(65 + nextAvailableBlock)}`
                              : '⚠️ Todos los bloques completos'
                          }
                        </div>
                      </div>

                      {/* Toggle button */}
                      <button
                        onClick={() => toggleJudge(judge.userId)}
                        className={`p-2 rounded-lg transition-all ${
                          isAssigned
                            ? 'bg-red-100 hover:bg-red-200 text-red-600'
                            : canSelectMore
                              ? 'bg-green-100 hover:bg-green-200 text-green-600'
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                        disabled={!canSelectMore && !isAssigned}
                      >
                        {isAssigned ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        )}
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 font-medium">
                    {judges.length === 0 ? "No hay jurados disponibles" : "No se encontraron jurados"}
                  </p>
                  <p className="text-gray-400 text-sm mt-1">
                    {judges.length === 0 ? "Verifica la configuración del evento" : "Intenta con otro término de búsqueda"}
                  </p>
                </div>
              )}
            </div>

            {/* Instrucciones drag & drop */}
            <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Instrucciones
              </h4>
              <ul className="text-blue-800 text-xs space-y-1">
                <li>• <strong>Arrastra</strong> jurados directamente a los bloques</li>
                <li>• <strong>Click</strong> para asignación automática</li>
                <li>• <strong>Punto rojo:</strong> asignado previamente</li>
                <li>• <strong>Punto verde:</strong> recién seleccionado</li>
              </ul>
            </div>
          </div>

          {/* Vista de bloques mejorada (derecha) */}
          <div className="w-full lg:w-3/5 px-6 py-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Distribución por Bloques
              </h3>
              <div className="flex gap-2">
                {blockJudges.map((judges, index) => (
                  <div
                    key={index}
                    className={`w-3 h-3 rounded-full ${
                      judges.length === judgesCount
                        ? 'bg-green-500'
                        : judges.length > 0
                          ? 'bg-yellow-500'
                          : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {blockJudges.map((judges, blockIndex) => (
                <div
                  key={blockIndex}
                  onDragOver={(e) => handleDragOver(e, blockIndex)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, blockIndex)}
                  className={`relative p-6 rounded-2xl border-2 transition-all duration-300 min-h-[200px] ${
                    dragOverBlock === blockIndex
                      ? 'border-blue-400 bg-blue-50 shadow-lg scale-105'
                      : judges.length === judgesCount
                        ? 'border-green-300 bg-gradient-to-br from-green-50 to-green-100'
                        : judges.length > judgesCount
                          ? 'border-red-300 bg-gradient-to-br from-red-50 to-red-100'
                          : judges.length > 0
                            ? 'border-yellow-300 bg-gradient-to-br from-yellow-50 to-yellow-100'
                            : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  {/* Header del bloque */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg ${
                        judges.length === judgesCount
                          ? 'bg-green-500'
                          : judges.length > 0
                            ? 'bg-yellow-500'
                            : 'bg-gray-400'
                      }`}>
                        {String.fromCharCode(65 + blockIndex)}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-lg">
                          Bloque {String.fromCharCode(65 + blockIndex)}
                        </h4>
                        <p className="text-gray-600 text-sm">
                          {judges.length > 0 ? `${judges.length} jurado${judges.length > 1 ? 's' : ''}` : 'Sin asignar'}
                        </p>
                      </div>
                    </div>
                    
                    <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                      judges.length === judgesCount
                        ? 'bg-green-200 text-green-800'
                        : judges.length > judgesCount
                          ? 'bg-red-200 text-red-800'
                          : 'bg-orange-200 text-orange-800'
                    }`}>
                      {judges.length}/{judgesCount}
                      {judges.length === judgesCount && ' ✓'}
                    </div>
                  </div>
                  
                  {/* Lista de jurados en el bloque */}
                  <div className="space-y-3">
                    {judges.length > 0 ? (
                      judges.map((judgeId) => {
                        const user = usersMap[judgeId];
                        const wasOriginal = tandaBlocks[blockIndex]?.judgeIds?.includes(judgeId);
                        return (
                          <div
                            key={judgeId}
                            className={`flex items-center gap-3 p-3 rounded-xl border transition-all group ${
                              wasOriginal 
                                ? 'bg-red-100 border-red-200 hover:bg-red-150' 
                                : 'bg-white border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            <div className="w-8 h-8 bg-gradient-to-br from-red-400 to-red-600 rounded-lg flex items-center justify-center shadow">
                              {user?.profileImage ? (
                                <img
                                  src={typeof user.profileImage === 'string' ? user.profileImage : URL.createObjectURL(user.profileImage)}
                                  alt={`${user.firstName} ${user.lastName}`}
                                  className="w-8 h-8 rounded-lg object-cover"
                                />
                              ) : (
                                <span className="text-white text-xs font-bold">
                                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                                </span>
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-900 truncate">
                                {user?.firstName} {user?.lastName}
                              </div>
                              {wasOriginal && (
                                <div className="text-xs text-red-600 flex items-center gap-1">
                                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                                  Asignado previamente
                                </div>
                              )}
                            </div>
                            
                            <button
                              onClick={() => removeJudgeFromBlock(judgeId, blockIndex)}
                              className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-600 transition-all"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        );
                      })
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                        <div className="w-12 h-12 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center mb-3">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </div>
                        <p className="text-sm font-medium">Arrastra jurados aquí</p>
                        <p className="text-xs mt-1">o haz click en "+" para asignar</p>
                      </div>
                    )}
                  </div>

                  {/* Drop zone indicator */}
                  {dragOverBlock === blockIndex && (
                    <div className="absolute inset-0 bg-blue-200 bg-opacity-50 rounded-2xl flex items-center justify-center pointer-events-none">
                      <div className="bg-blue-500 text-white px-4 py-2 rounded-xl font-medium shadow-lg">
                        Soltar aquí
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Resumen de estado */}
            <div className="mt-6 p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">Resumen de Asignación</h4>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  allBlocksComplete 
                    ? 'bg-green-100 text-green-800' 
                    : totalAssigned > 0
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                }`}>
                  {allBlocksComplete ? 'Completo' : totalAssigned > 0 ? 'En Progreso' : 'Pendiente'}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="p-3 bg-white rounded-lg">
                  <div className="text-xl font-bold text-gray-900">{judges.length}</div>
                  <div className="text-xs text-gray-600">Total Disponibles</div>
                </div>
                <div className="p-3 bg-white rounded-lg">
                  <div className="text-xl font-bold text-blue-600">{totalAssigned}</div>
                  <div className="text-xs text-gray-600">Asignados</div>
                </div>
                <div className="p-3 bg-white rounded-lg">
                  <div className="text-xl font-bold text-green-600">
                    {blockJudges.filter(judges => judges.length === judgesCount).length}
                  </div>
                  <div className="text-xs text-gray-600">Bloques Completos</div>
                </div>
                <div className="p-3 bg-white rounded-lg">
                  <div className="text-xl font-bold text-red-600">
                    {blockJudges.filter(judges => judges.length !== judgesCount).length}
                  </div>
                  <div className="text-xs text-gray-600">Bloques Pendientes</div>
                </div>
              </div>

              {/* Barra de progreso */}
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Progreso de asignación</span>
                  <span>{Math.round((totalAssigned / Math.max(totalNeeded, 1)) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-red-500 to-red-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((totalAssigned / Math.max(totalNeeded, 1)) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer mejorado */}
        <div className="px-8 py-6 bg-gray-50 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            {/* Información de estado */}
            <div className="flex items-center gap-2 text-sm">
              {allBlocksComplete ? (
                <div className="flex items-center gap-2 text-green-700">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="font-medium">Todos los bloques están completos</span>
                </div>
              ) : totalAssigned > 0 ? (
                <div className="flex items-center gap-2 text-yellow-700">
                  <div className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 8v4m0 4h.01" />
                    </svg>
                  </div>
                  <span>Asignación incompleta - puedes guardar de todas formas</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-gray-500">
                  <div className="w-5 h-5 bg-gray-400 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <span>Comienza asignando jurados a los bloques</span>
                </div>
              )}
            </div>

            {/* Botones de acción */}
            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="px-6 py-3 text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-xl transition-all font-medium hover:shadow-md"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirm}
                className={`px-8 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${
                  totalAssigned > 0
                    ? allBlocksComplete
                      ? 'bg-green-600 text-white hover:bg-green-700 shadow-lg hover:shadow-xl transform hover:scale-105' 
                      : 'bg-yellow-600 text-white hover:bg-yellow-700 shadow-lg hover:shadow-xl'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                disabled={totalAssigned === 0}
              >
                {allBlocksComplete || totalAssigned > 0  ? (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="font-semibold">Confirmar y Guardar</span>
                  </>
                ) : totalAssigned > 0 ? (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                    <span className="font-semibold">Guardar Parcial ({totalAssigned}/{totalNeeded})</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>Asigna al menos un jurado</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};