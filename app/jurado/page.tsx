"use client"
import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  Play, 
  Pause, 
  SkipForward, 
  Grid3X3, 
  List, 
  Search, 
  Star, 
  Clock, 
  Award, 
  Download,
  Settings,
  ChevronRight,
  ChevronLeft,
  Trophy,
  FileText,
  Filter,
  Timer,
  AlertCircle,
  BarChart3,
  Medal,
  Eye,
  Target,
  TrendingUp,
  Save
} from 'lucide-react';

// Datos de ejemplo
const sampleParticipants = [
  { id: 1, number: 1, name: "María García", partner: "Juan Pérez", category: "Juvenil", modality: "Libre", favorite: false },
  { id: 2, number: 2, name: "Ana López", partner: "Carlos Ruiz", category: "Master", modality: "Libre", favorite: true },
  { id: 3, number: 3, name: "Sofia Martín", partner: null, category: "Infante", modality: "Noble", favorite: false },
  { id: 4, number: 4, name: "Luis Torres", partner: "Carmen Silva", category: "Juvenil", modality: "Libre", favorite: false },
  { id: 5, number: 5, name: "Pedro Vega", partner: null, category: "Master", modality: "Seriado", favorite: false },
  { id: 6, number: 6, name: "Rosa Flores", partner: "Miguel Santos", category: "Baby", modality: "Libre", favorite: false },
  { id: 7, number: 7, name: "Elena Díaz", partner: "Roberto Cruz", category: "Juvenil", modality: "Libre", favorite: false },
  { id: 8, number: 8, name: "Andrea Morales", partner: null, category: "Infante", modality: "Noble", favorite: true },
];

const categories = ["Todas", "Baby", "Infante", "Juvenil", "Master"];
const modalities = ["Todas", "Libre", "Noble", "Seriado"];

const scoringCriteria = [
  { name: "Técnica", weight: 30, max: 10 },
  { name: "Estilo", weight: 25, max: 10 },
  { name: "Gracia", weight: 25, max: 10 },
  { name: "Presencia", weight: 20, max: 10 }
];

export default function MarineraJudgeInterface() {
  const [currentScreen, setCurrentScreen] = useState('pre-dance');
  const [viewMode, setViewMode] = useState('grid');
  const [participants, setParticipants] = useState(sampleParticipants);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todas');
  const [modalityFilter, setModalityFilter] = useState('Todas');
  
  // Estado de tandas
  const [pairsPerRound, setPairsPerRound] = useState(6);
  const [currentRound, setCurrentRound] = useState(1);
  const [currentPairIndex, setCurrentPairIndex] = useState(0);
  const [rounds, setRounds] = useState([]);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [timerLimit, setTimerLimit] = useState(300); // 5 minutos por defecto
  
  // Estado de calificación
  const [currentScoring, setCurrentScoring] = useState({});
  const [scores, setScores] = useState({});
  const [judgeNotes, setJudgeNotes] = useState({});
  const [showScoringModal, setShowScoringModal] = useState(false);
  
  const timerRef = useRef(null);

  // Filtrar participantes
  const filteredParticipants = participants.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.number.toString().includes(searchTerm) ||
                         (p.partner && p.partner.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === 'Todas' || p.category === categoryFilter;
    const matchesModality = modalityFilter === 'Todas' || p.modality === modalityFilter;
    return matchesSearch && matchesCategory && matchesModality;
  });

  // Timer effect
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isTimerRunning]);

  // Crear tandas
  const createRounds = () => {
    const roundsArray = [];
    for (let i = 0; i < filteredParticipants.length; i += pairsPerRound) {
      roundsArray.push(filteredParticipants.slice(i, i + pairsPerRound));
    }
    setRounds(roundsArray);
    setCurrentScreen('rounds');
  };

  // Formatear tiempo
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Manejar favoritos
  const toggleFavorite = (id) => {
    setParticipants(prev => prev.map(p => 
      p.id === id ? { ...p, favorite: !p.favorite } : p
    ));
  };

  // Iniciar calificación
  const startScoring = (participant) => {
    setCurrentScoring(participant);
    setShowScoringModal(true);
  };

  // Guardar calificación
  const saveScoring = () => {
    const roundKey = `round-${currentRound}`;
    const participantKey = `participant-${currentScoring.id}`;
    
    // Calcular puntaje total
    const totalScore = Object.values(currentScoring.scores || {}).reduce((sum, score) => sum + parseFloat(score || 0), 0);
    
    setScores(prev => ({
      ...prev,
      [roundKey]: {
        ...prev[roundKey],
        [participantKey]: {
          scores: currentScoring.scores,
          total: totalScore,
          notes: currentScoring.notes || ''
        }
      }
    }));
    
    setShowScoringModal(false);
    
    // Avanzar al siguiente participante
    if (currentPairIndex < rounds[currentRound - 1].length - 1) {
      setCurrentPairIndex(prev => prev + 1);
    }
  };

  // Pantalla Pre-baile
  const PreDanceScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-yellow-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-red-800 mb-2 flex items-center gap-3">
            <Trophy className="h-10 w-10" />
            Concurso de Marinera Norteña
          </h1>
          <p className="text-gray-600 text-lg">Gestión de Participantes - Pre-baile</p>
        </div>

        {/* Controles */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            {/* Búsqueda */}
            <div className="relative flex-1 min-w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Buscar por número, nombre o apellido..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filtros */}
            <div className="flex gap-3">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              
              <select
                value={modalityFilter}
                onChange={(e) => setModalityFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              >
                {modalities.map(mod => (
                  <option key={mod} value={mod}>{mod}</option>
                ))}
              </select>
            </div>

            {/* Selector de vista */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid' ? 'bg-white shadow-sm text-red-600' : 'text-gray-600'
                }`}
              >
                <Grid3X3 className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list' ? 'bg-white shadow-sm text-red-600' : 'text-gray-600'
                }`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Configuración de tandas */}
          <div className="mt-4 pt-4 border-t border-gray-200 flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">
              Parejas por tanda:
            </label>
            <input
              type="number"
              min="2"
              max="10"
              value={pairsPerRound}
              onChange={(e) => setPairsPerRound(parseInt(e.target.value))}
              className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
            />
            <button
              onClick={createRounds}
              className="ml-auto bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 font-medium"
            >
              <Play className="h-5 w-5" />
              Iniciar Concurso
            </button>
          </div>
        </div>

        {/* Lista de participantes */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Participantes ({filteredParticipants.length})
            </h2>
          </div>

          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredParticipants.map(participant => (
                <div
                  key={participant.id}
                  className="bg-gradient-to-br from-red-50 to-yellow-50 rounded-lg p-4 border border-red-100 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="bg-red-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold">
                      {participant.number}
                    </div>
                    <button
                      onClick={() => toggleFavorite(participant.id)}
                      className={`p-1 rounded-full transition-colors ${
                        participant.favorite ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'
                      }`}
                    >
                      <Star className={`h-5 w-5 ${participant.favorite ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                  
                  <h3 className="font-semibold text-gray-800 text-lg mb-1">{participant.name}</h3>
                  {participant.partner && (
                    <p className="text-gray-600 mb-2">{participant.partner}</p>
                  )}
                  
                  <div className="flex gap-2 text-sm">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {participant.category}
                    </span>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      {participant.modality}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Nº</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Participante</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Pareja</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Categoría</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Modalidad</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Favorito</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredParticipants.map(participant => (
                    <tr key={participant.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                          {participant.number}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium text-gray-800">{participant.name}</td>
                      <td className="py-3 px-4 text-gray-600">{participant.partner || '-'}</td>
                      <td className="py-3 px-4">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                          {participant.category}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
                          {participant.modality}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => toggleFavorite(participant.id)}
                          className={`p-1 rounded-full transition-colors ${
                            participant.favorite ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'
                          }`}
                        >
                          <Star className={`h-5 w-5 ${participant.favorite ? 'fill-current' : ''}`} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Modal de calificación
  const ScoringModal = () => {
    if (!showScoringModal || !currentScoring) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-screen overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Calificar Participante</h2>
              <button
                onClick={() => setShowScoringModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="bg-gradient-to-r from-red-50 to-yellow-50 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-red-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg">
                  {currentScoring.number}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-800">{currentScoring.name}</h3>
                  {currentScoring.partner && (
                    <p className="text-gray-600">{currentScoring.partner}</p>
                  )}
                  <div className="flex gap-2 mt-1">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                      {currentScoring.category}
                    </span>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
                      {currentScoring.modality}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {scoringCriteria.map(criterion => (
                <div key={criterion.name} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="font-semibold text-gray-700">
                      {criterion.name} ({criterion.weight}%)
                    </label>
                    <span className="text-sm text-gray-500">Máx: {criterion.max}</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    max={criterion.max}
                    step="0.1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    value={currentScoring.scores?.[criterion.name] || ''}
                    onChange={(e) => setCurrentScoring(prev => ({
                      ...prev,
                      scores: {
                        ...prev.scores,
                        [criterion.name]: e.target.value
                      }
                    }))}
                  />
                </div>
              ))}
            </div>

            <div className="mt-6">
              <label className="block font-semibold text-gray-700 mb-2">
                Notas del Jurado
              </label>
              <textarea
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                placeholder="Comentarios cualitativos sobre la presentación..."
                value={currentScoring.notes || ''}
                onChange={(e) => setCurrentScoring(prev => ({
                  ...prev,
                  notes: e.target.value
                }))}
              />
            </div>

            <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={() => setShowScoringModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={saveScoring}
                className="flex-1 bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Guardar Calificación
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Pantalla de tandas
  const RoundsScreen = () => {
    const currentRoundData = rounds[currentRound - 1] || [];
    const currentParticipant = currentRoundData[currentPairIndex];
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-yellow-50 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-red-800 mb-2 flex items-center gap-3">
                <Award className="h-10 w-10" />
                Tanda {currentRound} de {rounds.length}
              </h1>
              <p className="text-gray-600 text-lg">
                Participante {currentPairIndex + 1} de {currentRoundData.length}
              </p>
            </div>
            <button
              onClick={() => setCurrentScreen('pre-dance')}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Volver al Listado
            </button>
          </div>

          {/* Timer y controles */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className={`text-4xl font-bold ${timeElapsed > timerLimit ? 'text-red-600' : 'text-gray-800'}`}>
                    {formatTime(timeElapsed)}
                  </div>
                  <div className="text-sm text-gray-500">
                    Límite: {formatTime(timerLimit)}
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => setIsTimerRunning(!isTimerRunning)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      isTimerRunning
                        ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                        : 'bg-green-500 text-white hover:bg-green-600'
                    }`}
                  >
                    {isTimerRunning ? (
                      <>
                        <Pause className="h-4 w-4 inline mr-2" />
                        Pausar
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 inline mr-2" />
                        Iniciar
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={() => setTimeElapsed(0)}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Reiniciar
                  </button>
                </div>
              </div>

              {timeElapsed > timerLimit && (
                <div className="flex items-center gap-2 text-red-600 font-medium">
                  <AlertCircle className="h-5 w-5" />
                  Tiempo excedido
                </div>
              )}
            </div>

            {/* Barra de progreso */}
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progreso de la tanda</span>
                <span>{currentPairIndex + 1} / {currentRoundData.length}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-red-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentPairIndex + 1) / currentRoundData.length) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Participante actual */}
          {currentParticipant && (
            <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
              <div className="text-center">
                <div className="bg-red-600 text-white rounded-full w-20 h-20 flex items-center justify-center font-bold text-2xl mx-auto mb-4">
                  {currentParticipant.number}
                </div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  {currentParticipant.name}
                </h2>
                {currentParticipant.partner && (
                  <p className="text-xl text-gray-600 mb-4">{currentParticipant.partner}</p>
                )}
                <div className="flex gap-3 justify-center mb-6">
                  <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full">
                    {currentParticipant.category}
                  </span>
                  <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full">
                    {currentParticipant.modality}
                  </span>
                </div>
                
                <button
                  onClick={() => startScoring(currentParticipant)}
                  className="bg-red-600 text-white px-8 py-4 rounded-lg hover:bg-red-700 transition-colors font-bold text-lg"
                >
                  Calificar Participante
                </button>
              </div>
            </div>
          )}

          {/* Lista de participantes en la tanda */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Participantes en esta tanda
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentRoundData.map((participant, index) => (
                <div
                  key={participant.id}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    index === currentPairIndex
                      ? 'border-red-500 bg-red-50'
                      : index < currentPairIndex
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                      index === currentPairIndex
                        ? 'bg-red-600 text-white'
                        : index < currentPairIndex
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-400 text-white'
                    }`}>
                      {participant.number}
                    </div>
                    <div>
                      <p className="font-medium">{participant.name}</p>
                      {participant.partner && (
                        <p className="text-sm text-gray-600">{participant.partner}</p>
                      )}
                    </div>
                    {index < currentPairIndex && (
                      <div className="ml-auto text-green-600">
                        <Award className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Controles de navegación */}
          <div className="flex justify-between mt-6">
            <button
              onClick={() => {
                if (currentPairIndex > 0) {
                  setCurrentPairIndex(prev => prev - 1);
                }
              }}
              disabled={currentPairIndex === 0}
              className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-5 w-5" />
              Anterior
            </button>

            <button
              onClick={() => {
                if (currentPairIndex < currentRoundData.length - 1) {
                  setCurrentPairIndex(prev => prev + 1);
                } else if (currentRound < rounds.length) {
                  setCurrentRound(prev => prev + 1);
                  setCurrentPairIndex(0);
                  setTimeElapsed(0);
                } else {
                  setCurrentScreen('results');
                }
              }}
              className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              {currentPairIndex < currentRoundData.length - 1 ? 'Siguiente' : 
               currentRound < rounds.length ? 'Siguiente Tanda' : 'Ver Resultados'}
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Pantalla de resultados
  const ResultsScreen = () => {
    // Calcular rankings
    const calculateRankings = () => {
      const allScores = [];
      Object.keys(scores).forEach(roundKey => {
        Object.keys(scores[roundKey]).forEach(participantKey => {
          const participantId = parseInt(participantKey.split('-')[1]);
          const participant = participants.find(p => p.id === participantId);
          if (participant) {
            allScores.push({
              ...participant,
              ...scores[roundKey][participantKey],
              roundKey
            });
          }
        });
      });
      
      return allScores.sort((a, b) => b.total - a.total);
    };

    const rankings = calculateRankings();
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-yellow-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-red-800 mb-2 flex items-center gap-3">
              <BarChart3 className="h-10 w-10" />
              Resultados del Concurso
            </h1>
            <p className="text-gray-600 text-lg">Ranking final y estadísticas</p>
          </div>

          {/* Controles */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <button
                onClick={() => setCurrentScreen('rounds')}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Volver a Tandas
              </button>
              
              <div className="flex gap-3">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Exportar PDF
                </button>
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Exportar CSV
                </button>
              </div>
            </div>
          </div>

          {/* Podio - Top 3 */}
          {rankings.length >= 3 && (
            <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Podio</h2>
              <div className="flex justify-center items-end gap-8">
                {/* Segundo lugar */}
                <div className="text-center">
                  <div className="bg-gray-400 text-white rounded-full w-16 h-16 flex items-center justify-center font-bold text-xl mb-3">
                    {rankings[1].number}
                  </div>
                  <div className="bg-gradient-to-t from-gray-300 to-gray-200 rounded-lg p-4 h-32 flex flex-col justify-end">
                    <Medal className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                    <p className="font-bold text-gray-800">{rankings[1].name}</p>
                    {rankings[1].partner && <p className="text-sm text-gray-600">{rankings[1].partner}</p>}
                    <p className="text-lg font-bold text-gray-700 mt-1">{rankings[1].total.toFixed(1)}</p>
                  </div>
                  <div className="bg-gray-500 text-white px-3 py-1 rounded-full mt-2 text-sm font-bold">
                    2º LUGAR
                  </div>
                </div>

                {/* Primer lugar */}
                <div className="text-center">
                  <div className="bg-yellow-500 text-white rounded-full w-20 h-20 flex items-center justify-center font-bold text-2xl mb-3 animate-pulse">
                    {rankings[0].number}
                  </div>
                  <div className="bg-gradient-to-t from-yellow-400 to-yellow-300 rounded-lg p-6 h-40 flex flex-col justify-end">
                    <Trophy className="h-10 w-10 text-yellow-700 mx-auto mb-2" />
                    <p className="font-bold text-gray-800 text-lg">{rankings[0].name}</p>
                    {rankings[0].partner && <p className="text-gray-700">{rankings[0].partner}</p>}
                    <p className="text-xl font-bold text-gray-800 mt-2">{rankings[0].total.toFixed(1)}</p>
                  </div>
                  <div className="bg-yellow-500 text-white px-4 py-2 rounded-full mt-2 font-bold">
                    🏆 CAMPEÓN
                  </div>
                </div>

                {/* Tercer lugar */}
                <div className="text-center">
                  <div className="bg-amber-600 text-white rounded-full w-16 h-16 flex items-center justify-center font-bold text-xl mb-3">
                    {rankings[2].number}
                  </div>
                  <div className="bg-gradient-to-t from-amber-500 to-amber-400 rounded-lg p-4 h-28 flex flex-col justify-end">
                    <Medal className="h-8 w-8 text-amber-700 mx-auto mb-2" />
                    <p className="font-bold text-gray-800">{rankings[2].name}</p>
                    {rankings[2].partner && <p className="text-sm text-gray-600">{rankings[2].partner}</p>}
                    <p className="text-lg font-bold text-gray-700 mt-1">{rankings[2].total.toFixed(1)}</p>
                  </div>
                  <div className="bg-amber-600 text-white px-3 py-1 rounded-full mt-2 text-sm font-bold">
                    3º LUGAR
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tabla completa de resultados */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Ranking Completo</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-4 px-4 font-bold text-gray-700">Posición</th>
                    <th className="text-left py-4 px-4 font-bold text-gray-700">Nº</th>
                    <th className="text-left py-4 px-4 font-bold text-gray-700">Participante</th>
                    <th className="text-left py-4 px-4 font-bold text-gray-700">Pareja</th>
                    <th className="text-left py-4 px-4 font-bold text-gray-700">Categoría</th>
                    <th className="text-left py-4 px-4 font-bold text-gray-700">Modalidad</th>
                    <th className="text-center py-4 px-4 font-bold text-gray-700">Puntaje</th>
                    <th className="text-center py-4 px-4 font-bold text-gray-700">Detalles</th>
                  </tr>
                </thead>
                <tbody>
                  {rankings.map((participant, index) => (
                    <tr key={participant.id} className={`border-b border-gray-100 hover:bg-gray-50 ${
                      index < 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50' : ''
                    }`}>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold text-lg ${
                            index === 0 ? 'text-yellow-600' :
                            index === 1 ? 'text-gray-600' :
                            index === 2 ? 'text-amber-600' : 'text-gray-800'
                          }`}>
                            {index + 1}
                          </span>
                          {index < 3 && (
                            <Medal className={`h-5 w-5 ${
                              index === 0 ? 'text-yellow-500' :
                              index === 1 ? 'text-gray-400' : 'text-amber-500'
                            }`} />
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="bg-red-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold">
                          {participant.number}
                        </div>
                      </td>
                      <td className="py-4 px-4 font-semibold text-gray-800">{participant.name}</td>
                      <td className="py-4 px-4 text-gray-600">{participant.partner || '-'}</td>
                      <td className="py-4 px-4">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                          {participant.category}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
                          {participant.modality}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="text-2xl font-bold text-red-600">
                          {participant.total.toFixed(1)}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => setSelectedParticipant(participant)}
                          className="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg hover:bg-blue-200 transition-colors text-sm flex items-center gap-1 mx-auto"
                        >
                          <Eye className="h-4 w-4" />
                          Ver
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Estadísticas adicionales */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Target className="h-8 w-8 text-blue-600" />
                <h3 className="text-xl font-bold text-gray-800">Promedio General</h3>
              </div>
              <div className="text-3xl font-bold text-blue-600">
                {rankings.length > 0 ? (rankings.reduce((sum, p) => sum + p.total, 0) / rankings.length).toFixed(1) : '0.0'}
              </div>
              <p className="text-gray-600 mt-2">Puntos promedio del concurso</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="h-8 w-8 text-green-600" />
                <h3 className="text-xl font-bold text-gray-800">Puntaje Máximo</h3>
              </div>
              <div className="text-3xl font-bold text-green-600">
                {rankings.length > 0 ? Math.max(...rankings.map(p => p.total)).toFixed(1) : '0.0'}
              </div>
              <p className="text-gray-600 mt-2">Mejor puntaje obtenido</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Users className="h-8 w-8 text-purple-600" />
                <h3 className="text-xl font-bold text-gray-800">Total Participantes</h3>
              </div>
              <div className="text-3xl font-bold text-purple-600">
                {rankings.length}
              </div>
              <p className="text-gray-600 mt-2">Calificados en el concurso</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Modal de detalles del participante
  const [selectedParticipant, setSelectedParticipant] = useState(null);

  const ParticipantDetailsModal = () => {
    if (!selectedParticipant) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-screen overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Detalles de Calificación</h2>
              <button
                onClick={() => setSelectedParticipant(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="bg-gradient-to-r from-red-50 to-yellow-50 rounded-lg p-6 mb-6">
              <div className="flex items-center gap-4">
                <div className="bg-red-600 text-white rounded-full w-16 h-16 flex items-center justify-center font-bold text-xl">
                  {selectedParticipant.number}
                </div>
                <div>
                  <h3 className="font-bold text-2xl text-gray-800">{selectedParticipant.name}</h3>
                  {selectedParticipant.partner && (
                    <p className="text-lg text-gray-600">{selectedParticipant.partner}</p>
                  )}
                  <div className="flex gap-3 mt-2">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                      {selectedParticipant.category}
                    </span>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">
                      {selectedParticipant.modality}
                    </span>
                  </div>
                </div>
                <div className="ml-auto text-center">
                  <div className="text-3xl font-bold text-red-600">
                    {selectedParticipant.total.toFixed(1)}
                  </div>
                  <div className="text-gray-600">Puntaje Total</div>
                </div>
              </div>
            </div>

            {/* Desglose de criterios */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h4 className="font-bold text-lg text-gray-800 mb-4">Desglose por Criterios</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(selectedParticipant.scores || {}).map(([criterion, score]) => (
                  <div key={criterion} className="bg-white rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-gray-700">{criterion}</span>
                      <span className="text-lg font-bold text-red-600">{parseFloat(score).toFixed(1)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-red-600 h-2 rounded-full"
                        style={{ width: `${(parseFloat(score) / 10) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notas del jurado */}
            {selectedParticipant.notes && (
              <div className="bg-blue-50 rounded-lg p-6">
                <h4 className="font-bold text-lg text-gray-800 mb-3 flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Notas del Jurado
                </h4>
                <p className="text-gray-700 leading-relaxed">{selectedParticipant.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Pantalla de configuración
  const ConfigScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-yellow-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-red-800 mb-2 flex items-center gap-3">
            <Settings className="h-10 w-10" />
            Configuración del Concurso
          </h1>
          <p className="text-gray-600 text-lg">Ajustes de criterios y parámetros</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="space-y-8">
            {/* Configuración de tiempo */}
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Timer className="h-6 w-6" />
                Configuración de Tiempo
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tiempo límite por tanda (minutos)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={Math.floor(timerLimit / 60)}
                    onChange={(e) => setTimerLimit(parseInt(e.target.value) * 60)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>
            </div>

            {/* Configuración de criterios */}
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Target className="h-6 w-6" />
                Criterios de Evaluación
              </h3>
              <div className="space-y-4">
                {scoringCriteria.map((criterion, index) => (
                  <div key={criterion.name} className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Criterio
                        </label>
                        <input
                          type="text"
                          value={criterion.name}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                          readOnly
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Peso (%)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={criterion.weight}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                          readOnly
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Puntaje Máximo
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="20"
                          value={criterion.max}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                          readOnly
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <button
                onClick={() => setCurrentScreen('pre-dance')}
                className="flex-1 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Volver al Inicio
              </button>
              <button
                className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
              >
                <Save className="h-5 w-5" />
                Guardar Configuración
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Navegación principal
  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'pre-dance':
        return <PreDanceScreen />;
      case 'rounds':
        return <RoundsScreen />;
      case 'results':
        return <ResultsScreen />;
      case 'config':
        return <ConfigScreen />;
      default:
        return <PreDanceScreen />;
    }
  };

  return (
    <div className="relative">
      {renderCurrentScreen()}
      <ScoringModal />
      <ParticipantDetailsModal />
      
      {/* Menú de navegación flotante */}
      <div className="fixed bottom-6 right-6 bg-white rounded-full shadow-lg p-2 flex gap-2">
        <button
          onClick={() => setCurrentScreen('pre-dance')}
          className={`p-3 rounded-full transition-colors ${
            currentScreen === 'pre-dance' ? 'bg-red-600 text-white' : 'text-gray-600 hover:bg-gray-100'
          }`}
          title="Pre-baile"
        >
          <Users className="h-5 w-5" />
        </button>
        <button
          onClick={() => setCurrentScreen('rounds')}
          className={`p-3 rounded-full transition-colors ${
            currentScreen === 'rounds' ? 'bg-red-600 text-white' : 'text-gray-600 hover:bg-gray-100'
          }`}
          title="Tandas"
          disabled={rounds.length === 0}
        >
          <Play className="h-5 w-5" />
        </button>
        <button
          onClick={() => setCurrentScreen('results')}
          className={`p-3 rounded-full transition-colors ${
            currentScreen === 'results' ? 'bg-red-600 text-white' : 'text-gray-600 hover:bg-gray-100'
          }`}
          title="Resultados"
          disabled={Object.keys(scores).length === 0}
        >
          <BarChart3 className="h-5 w-5" />
        </button>
        <button
          onClick={() => setCurrentScreen('config')}
          className={`p-3 rounded-full transition-colors ${
            currentScreen === 'config' ? 'bg-red-600 text-white' : 'text-gray-600 hover:bg-gray-100'
          }`}
          title="Configuración"
        >
          <Settings className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}