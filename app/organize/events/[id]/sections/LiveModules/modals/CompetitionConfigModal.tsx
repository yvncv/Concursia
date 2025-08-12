import React, { useState, useEffect } from 'react';
import { X, Info, Users, Grid, UserCheck } from 'lucide-react';

interface CompetitionConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (config: { blocks: number; tracksPerBlock: number; judgesPerBlock: number }) => void;
  isLoading?: boolean;
  level: string;
  category: string;
  gender: string;
  totalParticipants: number;
}

export const CompetitionConfigModal: React.FC<CompetitionConfigModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  level,
  category,
  gender,
  totalParticipants
}) => {
  const [blocks, setBlocks] = useState(1);
  const [tracksPerBlock, setTracksPerBlock] = useState(1);
  const [judgesPerBlock, setJudgesPerBlock] = useState(1);

  // Calcular valores derivados
  const totalTracks = blocks * tracksPerBlock;
  const totalTandas = Math.ceil(totalParticipants / totalTracks);

  useEffect(() => {
    if (isOpen) {
      // Reset a valores por defecto cuando se abre el modal
      setBlocks(1);
      setTracksPerBlock(1);
      setJudgesPerBlock(1);
    }
  }, [isOpen]);

  const handleConfirm = () => {
    onConfirm({
      blocks,
      tracksPerBlock,
      judgesPerBlock
    });
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Configuración de Seriado</h2>
            <p className="text-sm text-gray-600 mt-1">
              Define cómo se dividirá la pista para las presentaciones de esta modalidad
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Información de la competencia */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-blue-900">
                  {level} - {category} {gender && `- ${gender}`}
                </p>
                <p className="text-blue-700 mt-1">
                  Total de participantes: <span className="font-semibold">{totalParticipants}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Configuración de bloques */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* División en bloques */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Grid className="h-5 w-5 text-blue-500" />
                <label className="text-sm font-medium text-gray-700">
                  División en bloques
                </label>
              </div>
              <input
                type="number"
                min="1"
                max="4"
                value={blocks}
                onChange={(e) => setBlocks(Math.max(1, Math.min(4, parseInt(e.target.value) || 1)))}
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
              />
              <p className="text-xs text-gray-500">
                Divide la pista en secciones grandes (máx. 4 bloques)
              </p>
            </div>

            {/* Pistas por bloque */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-green-500" />
                <label className="text-sm font-medium text-gray-700">
                  Pistas por bloque
                </label>
              </div>
              <input
                type="number"
                min="1"
                max="4"
                value={tracksPerBlock}
                onChange={(e) => setTracksPerBlock(Math.max(1, Math.min(4, parseInt(e.target.value) || 1)))}
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:opacity-50"
              />
              <p className="text-xs text-gray-500">
                Espacios dentro de cada bloque (máx. 4)
              </p>
            </div>
          </div>

          {/* Jurados por bloque */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <UserCheck className="h-5 w-5 text-purple-500" />
              <label className="text-sm font-medium text-gray-700">
                Jurados por bloque
              </label>
            </div>
            <input
              type="number"
              min="1"
              max="3"
              value={judgesPerBlock}
              onChange={(e) => setJudgesPerBlock(Math.max(1, Math.min(3, parseInt(e.target.value) || 1)))}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:opacity-50"
            />
            <p className="text-xs text-gray-500">
              Jurados evaluando en cada bloque (máx. 3)
            </p>
          </div>

          {/* Cálculo de tandas */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
            <div className="text-center">
              <div className="text-sm font-medium text-gray-600 mb-2">Número de tandas calculadas</div>
              <div className="flex items-center justify-center mb-3">
                <div className="bg-white rounded-full px-6 py-3 shadow-sm border">
                  <span className="text-3xl font-bold text-purple-600">{totalTandas}</span>
                  <span className="text-lg font-medium text-gray-600 ml-2">
                    {totalTandas === 1 ? 'tanda' : 'tandas'}
                  </span>
                </div>
              </div>
              <div className="text-xs text-gray-500">
                Para {totalParticipants} participantes en {blocks} bloque{blocks !== 1 ? 's' : ''} con {tracksPerBlock} pista{tracksPerBlock !== 1 ? 's' : ''} cada uno
              </div>
            </div>
          </div>

          {/* Visualización de la pista */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-4">Visualización de la pista</h4>
            <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${blocks}, 1fr)` }}>
              {Array.from({ length: blocks }, (_, blockIndex) => (
                <div key={blockIndex} className="text-center">
                  <div className="text-xs font-medium text-gray-600 mb-3">
                    BLOQUE {String.fromCharCode(65 + blockIndex)}
                  </div>
                  
                  {/* Pistas con participantes */}
                  <div className="space-y-2 mb-3">
                    {Array.from({ length: tracksPerBlock }, (_, trackIndex) => (
                      <div
                        key={trackIndex}
                        className="flex items-center bg-white rounded border p-2"
                      >
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-xs font-medium text-purple-600">P</span>
                        </div>
                        <div className="text-xs text-gray-600 flex-1">
                          PISTA {trackIndex + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Jurados */}
                  <div className="flex justify-center space-x-1">
                    {Array.from({ length: judgesPerBlock }, (_, judgeIndex) => (
                      <div
                        key={judgeIndex}
                        className="w-7 h-7 bg-purple-500 rounded-full flex items-center justify-center"
                      >
                        <span className="text-xs font-medium text-white">J{judgeIndex + 1}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Configurando...</span>
              </>
            ) : (
              <span>Confirmar configuración</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};