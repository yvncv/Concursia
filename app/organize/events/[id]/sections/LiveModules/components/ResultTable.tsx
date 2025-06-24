import { BlockInTanda } from "@/app/types/blockInTandaType";
import { Participant } from "@/app/types/participantType";
import { useParticipantsWithUsers, getParticipantDisplayName } from "@/app/hooks/useParticipantsWithUsers";
import useUsers from "@/app/hooks/useUsers";
import { Trophy, Star, Users } from "lucide-react";

interface Props {
  block: BlockInTanda;
  allParticipants: Participant[];
}

export const ResultTable: React.FC<Props> = ({ block, allParticipants }) => {
  const blockParticipants = block.participants
    .map(bp => allParticipants.find(p => p.id === bp.participantId))
    .filter((p): p is Participant => !!p);

  const participantsWithUsers = useParticipantsWithUsers(blockParticipants);
  const { users: allJudges } = useUsers();
  const judges = block.judgeIds.map(judgeId => allJudges.find(j => j.id === judgeId));

  // Calcular posiciones ordenadas
  const participantsWithTotals = block.participants.map((bp, idx) => {
    const scores = bp.scores ?? [];
    const total = scores.reduce((sum, s) => sum + (s.score ?? 0), 0);
    return { ...bp, total, originalIndex: idx };
  }).sort((a, b) => b.total - a.total);

  const getRankBadge = (rank: number) => {
    const colors = {
      1: "bg-gradient-to-br from-yellow-400 to-yellow-600 text-white border-yellow-500 shadow-lg",
      2: "bg-gradient-to-br from-gray-400 to-gray-600 text-white border-gray-500 shadow-lg", 
      3: "bg-gradient-to-br from-orange-400 to-orange-600 text-white border-orange-500 shadow-lg"
    };
    
    return (
      <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm border-2 
        ${colors[rank as keyof typeof colors] || "bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700 border-slate-300"}
      `}>
        {rank}
      </div>
    );
  };

  const getScoreBadge = (score: number | string, isTotal = false) => {
    if (score === '-') {
      return (
        <span className="inline-flex items-center justify-center w-10 h-8 rounded-lg bg-gray-100 text-gray-400 border border-gray-200 text-sm">
          -
        </span>
      );
    }

    const numScore = typeof score === 'number' ? score : parseFloat(score.toString());
    const colorClass = isTotal 
      ? "bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-800 border-emerald-300 font-bold shadow-md"
      : numScore >= 8 
        ? "bg-gradient-to-br from-green-100 to-green-200 text-green-800 border-green-300"
        : numScore >= 6
          ? "bg-gradient-to-br from-yellow-100 to-yellow-200 text-yellow-800 border-yellow-300"
          : "bg-gradient-to-br from-red-100 to-red-200 text-red-800 border-red-300";

    return (
      <span className={`inline-flex items-center justify-center min-w-[40px] h-8 rounded-lg border-2 text-sm transition-all duration-200 hover:scale-105 ${colorClass}`}>
        {typeof score === 'number' ? score.toFixed(1) : score}
      </span>
    );
  };

  const getRowStyle = (rank: number) => {
    const baseStyle = "transition-all duration-200 hover:shadow-md border-l-4";
    switch (rank) {
      case 1: return `${baseStyle} bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-400 hover:from-yellow-100 hover:to-yellow-150`;
      case 2: return `${baseStyle} bg-gradient-to-r from-gray-50 to-gray-100 border-gray-400 hover:from-gray-100 hover:to-gray-150`;
      case 3: return `${baseStyle} bg-gradient-to-r from-orange-50 to-orange-100 border-orange-400 hover:from-orange-100 hover:to-orange-150`;
      default: return `${baseStyle} bg-white border-slate-200 hover:bg-slate-50`;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
        <div className="flex items-center space-x-3">
          <Star className="w-6 h-6 text-yellow-300" />
          <h2 className="text-xl font-bold text-white">Matriz de Calificaciones</h2>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gradient-to-r from-slate-100 to-slate-200 border-b-2 border-slate-300">
              <th className="border-r border-slate-300 p-4 text-left font-semibold text-slate-700">
                <div className="flex items-center space-x-2">
                  <Trophy className="w-4 h-4" />
                  <span>Pos.</span>
                </div>
              </th>
              <th className="border-r border-slate-300 p-4 text-left font-semibold text-slate-700">
                Participante
              </th>
              {judges.map((judge, idx) => (
                <th key={judge?.id || idx} className="border-r border-slate-300 p-3 text-center font-semibold text-slate-700 min-w-[120px]">
                  <div className="flex flex-col items-center space-y-1">
                    <Users className="w-4 h-4 text-slate-500" />
                    <span className="text-xs leading-tight">
                      {judge ? `${judge.firstName} ${judge.lastName}` : `Jurado ${idx + 1}`}
                    </span>
                  </div>
                </th>
              ))}
              <th className="p-4 text-center font-semibold text-slate-700 bg-emerald-50">
                <div className="flex flex-col items-center space-y-1">
                  <Trophy className="w-4 h-4 text-emerald-600" />
                  <span>Total</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {participantsWithTotals.map((bp, rank) => {
              const participantWU = participantsWithUsers.find(pwu => pwu.participant.id === bp.participantId);
              const name = participantWU ? getParticipantDisplayName(participantWU) : `#${bp.participantId.slice(0, 6)}`;
              const scores = bp.scores ?? [];

              return (
                <tr key={bp.participantId} className={getRowStyle(rank + 1)}>
                  <td className="border-r border-gray-200 p-4">
                    <div className="flex items-center justify-center">
                      {getRankBadge(rank + 1)}
                    </div>
                  </td>
                  <td className="border-r border-gray-200 p-4">
                    <div className="font-medium text-gray-900">{name}</div>
                  </td>
                  {block.judgeIds.map((judgeId) => {
                    const judgeScore = scores.find(s => s.judgeId === judgeId)?.score ?? '-';
                    return (
                      <td key={judgeId} className="border-r border-gray-200 p-3 text-center">
                        {getScoreBadge(judgeScore)}
                      </td>
                    );
                  })}
                  <td className="p-4 text-center bg-emerald-50/50">
                    {getScoreBadge(bp.total, true)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer Statistics */}
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-4 border-t border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-600">
          <div className="flex items-center justify-between">
            <span>Participantes:</span>
            <span className="font-semibold">{block.participants.length}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Jurados:</span>
            <span className="font-semibold">{judges.length}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Puntaje más alto:</span>
            <span className="font-semibold text-emerald-600">
              {participantsWithTotals[0]?.total.toFixed(1) || '0.0'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};