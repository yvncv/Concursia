import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from '@/app/firebase/config';
import { Trophy, Medal, Award, Calendar, Star, Target, ChevronRight } from 'lucide-react';

interface Achievement {
  eventId: string;
  eventName: string;
  eventDate: Date;
  competitionId: string;
  level: string;
  category: string;
  gender: string;
  position: 1 | 2 | 3;
  totalScore: number;
  blockIndex: number;
  eventLocation?: string;
}

interface UserAchievementsProps {
  userId: string;
  userName: string;
}

const UserAchievements: React.FC<UserAchievementsProps> = ({ userId, userName }) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 1 | 2 | 3>('all');

  useEffect(() => {
    loadUserAchievements();
  }, [userId]);

  const loadUserAchievements = async () => {
    try {
      setLoading(true);
      const userAchievements: Achievement[] = [];

      // Buscar participaciones del usuario
      const participantsQuery = query(
        collection(db, 'participants'),
        where('usersId', 'array-contains', userId)
      );
      const participantsSnapshot = await getDocs(participantsQuery);

      for (const participantDoc of participantsSnapshot.docs) {
        const participant = participantDoc.data();
        const participantId = participantDoc.id;

        // Obtener información del evento
        const eventDoc = await getDoc(doc(db, 'eventos', participant.eventId));
        if (!eventDoc.exists()) continue;
        
        const eventData = eventDoc.data();
        
        // Buscar en las competencias en vivo de este evento
        const liveCompetitionsRef = collection(db, 'eventos', participant.eventId, 'liveCompetition');
        const liveCompetitionsSnapshot = await getDocs(liveCompetitionsRef);

        for (const liveCompDoc of liveCompetitionsSnapshot.docs) {
          const liveComp = liveCompDoc.data();
          
          // Solo buscar en competencias que coincidan con el participante
          if (liveComp.level !== participant.level || 
              liveComp.category !== participant.category) {
            continue;
          }

          // Buscar tandas de esta competencia
          const tandasRef = collection(db, 'eventos', participant.eventId, 'liveCompetition', liveCompDoc.id, 'tandas');
          const tandasSnapshot = await getDocs(tandasRef);

          for (const tandaDoc of tandasSnapshot.docs) {
            const tanda = tandaDoc.data();
            
            if (!tanda.blocks || !Array.isArray(tanda.blocks)) continue;

            // Buscar en cada bloque
            tanda.blocks.forEach((block: any, blockIndex: number) => {
              if (!block.participants || !Array.isArray(block.participants)) return;

              // Calcular puntajes de todos los participantes en este bloque
              const participantScores = block.participants.map((p: any) => {
                const totalScore = p.scores?.reduce((sum: number, score: any) => {
                  return sum + (typeof score.score === 'number' ? score.score : 0);
                }, 0) || 0;

                return {
                  participantId: p.participantId,
                  totalScore
                };
              });

              // Ordenar por puntaje descendente
              participantScores.sort((a, b) => b.totalScore - a.totalScore);

              // Verificar si nuestro usuario está en el top 3
              const userPosition = participantScores.findIndex(p => p.participantId === participantId);
              
              if (userPosition >= 0 && userPosition < 3) {
                const userScore = participantScores[userPosition];
                
                userAchievements.push({
                  eventId: participant.eventId,
                  eventName: eventData.name || 'Evento sin nombre',
                  eventDate: eventData.startDate?.toDate() || new Date(),
                  competitionId: liveCompDoc.id,
                  level: liveComp.level,
                  category: liveComp.category,
                  gender: liveComp.gender,
                  position: (userPosition + 1) as 1 | 2 | 3,
                  totalScore: userScore.totalScore,
                  blockIndex,
                  eventLocation: eventData.location?.district || 'Ubicación no disponible'
                });
              }
            });
          }
        }
      }

      // Ordenar por fecha descendente
      userAchievements.sort((a, b) => b.eventDate.getTime() - a.eventDate.getTime());
      setAchievements(userAchievements);

    } catch (error) {
      console.error('Error cargando logros del usuario:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPositionIcon = (position: 1 | 2 | 3) => {
    switch (position) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
    }
  };

  const getPositionColor = (position: 1 | 2 | 3) => {
    switch (position) {
      case 1:
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 2:
        return 'bg-gray-50 border-gray-200 text-gray-800';
      case 3:
        return 'bg-amber-50 border-amber-200 text-amber-800';
    }
  };

  const getPositionText = (position: 1 | 2 | 3) => {
    switch (position) {
      case 1:
        return '1er Puesto';
      case 2:
        return '2do Puesto';
      case 3:
        return '3er Puesto';
    }
  };

  const filteredAchievements = selectedFilter === 'all' 
    ? achievements 
    : achievements.filter(a => a.position === selectedFilter);

  // Calcular estadísticas
  const stats = {
    total: achievements.length,
    first: achievements.filter(a => a.position === 1).length,
    second: achievements.filter(a => a.position === 2).length,
    third: achievements.filter(a => a.position === 3).length,
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">🏆 Logros y Reconocimientos</h3>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-800 flex items-center">
          <Trophy className="w-6 h-6 text-yellow-500 mr-2" />
          Logros y Reconocimientos
        </h3>
        <div className="text-sm text-gray-500">
          {stats.total} logro{stats.total !== 1 ? 's' : ''}
        </div>
      </div>

      {achievements.length === 0 ? (
        <div className="text-center py-12">
          <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-600 mb-2">
            Sin logros aún
          </h4>
          <p className="text-gray-500 text-sm">
            Los logros aparecerán cuando {userName.split(' ')[0]} obtenga primeros, segundos o terceros puestos en competencias.
          </p>
        </div>
      ) : (
        <>
          {/* Estadísticas rápidas */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div 
              className={`text-center p-3 rounded-lg border cursor-pointer transition-colors ${
                selectedFilter === 'all' ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
              }`}
              onClick={() => setSelectedFilter('all')}
            >
              <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
              <div className="text-xs text-gray-600">Total</div>
            </div>
            
            <div 
              className={`text-center p-3 rounded-lg border cursor-pointer transition-colors ${
                selectedFilter === 1 ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
              }`}
              onClick={() => setSelectedFilter(1)}
            >
              <div className="text-2xl font-bold text-yellow-600">{stats.first}</div>
              <div className="text-xs text-gray-600">1eros</div>
            </div>
            
            <div 
              className={`text-center p-3 rounded-lg border cursor-pointer transition-colors ${
                selectedFilter === 2 ? 'bg-gray-50 border-gray-300' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
              }`}
              onClick={() => setSelectedFilter(2)}
            >
              <div className="text-2xl font-bold text-gray-600">{stats.second}</div>
              <div className="text-xs text-gray-600">2dos</div>
            </div>
            
            <div 
              className={`text-center p-3 rounded-lg border cursor-pointer transition-colors ${
                selectedFilter === 3 ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
              }`}
              onClick={() => setSelectedFilter(3)}
            >
              <div className="text-2xl font-bold text-amber-600">{stats.third}</div>
              <div className="text-xs text-gray-600">3eros</div>
            </div>
          </div>

          {/* Lista de logros */}
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {filteredAchievements.map((achievement, index) => (
              <div 
                key={`${achievement.eventId}-${achievement.competitionId}-${achievement.blockIndex}`}
                className={`p-4 rounded-lg border transition-all hover:shadow-md ${getPositionColor(achievement.position)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="flex-shrink-0 mt-1">
                      {getPositionIcon(achievement.position)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900 truncate">
                          {achievement.eventName}
                        </h4>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPositionColor(achievement.position)}`}>
                          {getPositionText(achievement.position)}
                        </span>
                      </div>
                      
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center space-x-4">
                          <span className="font-medium">
                            {achievement.level} • {achievement.category} • {achievement.gender}
                          </span>
                          {achievement.blockIndex > 0 && (
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                              Bloque {String.fromCharCode(65 + achievement.blockIndex)}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-xs">
                            <div className="flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              {achievement.eventDate.toLocaleDateString('es-ES', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </div>
                            <div className="flex items-center">
                              <Star className="w-3 h-3 mr-1" />
                              {achievement.totalScore} pts
                            </div>
                          </div>
                          
                          <div className="text-xs text-gray-500">
                            {achievement.eventLocation}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <ChevronRight className="w-4 h-4 text-gray-400 ml-2 flex-shrink-0" />
                </div>
              </div>
            ))}
          </div>

          {filteredAchievements.length === 0 && selectedFilter !== 'all' && (
            <div className="text-center py-8">
              <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">
                No hay logros de {getPositionText(selectedFilter as 1 | 2 | 3).toLowerCase()}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UserAchievements;