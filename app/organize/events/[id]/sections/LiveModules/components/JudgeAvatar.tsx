import { BlockInTanda } from "@/app/types/blockInTandaType";
import { User } from "@/app/types/userType";
import { Users } from "lucide-react";

interface JudgeAvatarProps {
  userId: string;
  usersMap: Record<string, User>;
  judgeIndex: number;
  hasScoredAll?: boolean;
  block?: BlockInTanda;
}

export const JudgeAvatar: React.FC<JudgeAvatarProps> = ({ userId, usersMap, judgeIndex, hasScoredAll, block }) => {
  const user = usersMap[userId];

  // Nota promedio (opcional)
  let avgScore: number | null = null;

  if (hasScoredAll && block) {
    const scores = block.participants.map(p =>
      p.scores?.find(s => s.judgeId === userId)?.score ?? null
    ).filter(score => score !== null) as number[];

    if (scores.length) {
      avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    }
  }

  const fullName = user ? `${user.firstName} ${user.lastName}` : "Jurado sin nombre";

  const getProfileImageSrc = (): string | null => {
    if (!user?.profileImage) return null;
    
    // Si es string, retornarlo directamente
    if (typeof user.profileImage === 'string') {
      return user.profileImage;
    }
    
    // Si es File, crear URL temporal
    if (user.profileImage instanceof File) {
      return URL.createObjectURL(user.profileImage);
    }
    
    return null;
  };

  const profileImageSrc = getProfileImageSrc();

  return (
    <div className="flex flex-col items-center space-y-2 p-2 relative">
      <div className={`relative w-16 h-16 rounded-full overflow-hidden shadow-lg transition-all duration-300 hover:scale-105 border-4
        ${hasScoredAll
          ? 'border-emerald-500 bg-gradient-to-br from-emerald-50 to-emerald-100 shadow-emerald-200'
          : 'border-slate-300 bg-gradient-to-br from-slate-50 to-slate-100 shadow-slate-200'
        }
      `}>
        {profileImageSrc ? (
          <img
            src={profileImageSrc}
            alt={user?.firstName || 'Jurado'}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
            <Users className="w-6 h-6 text-slate-500" />
          </div>
        )}
      </div>

      {/* Indicador de estado - fuera del avatar */}
      <div className={`absolute top-1 right-1 w-5 h-5 rounded-full border-2 border-white shadow-md transition-all duration-300 z-20
        ${hasScoredAll ? 'bg-emerald-500' : 'bg-slate-400'}
      `}>
        {hasScoredAll && (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        )}
      </div>

      {/* Nota promedio - Badge flotante fuera del avatar */}
      {hasScoredAll && avgScore !== null && (
        <div className="absolute top-12 right-0 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg border-2 border-white z-30 min-w-[28px] text-center">
          {avgScore.toFixed(1)}
        </div>
      )}

      {/* Información del jurado */}
      <div className="text-center space-y-1">
        <div className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-1 rounded-full">
          Jurado {judgeIndex + 1}
        </div>
        <div className="text-xs font-medium text-slate-700 max-w-[100px] leading-tight line-clamp-2">
          {fullName}
        </div>
        {hasScoredAll && (
          <div className="text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-1 rounded-full">
            ✓ Completado
          </div>
        )}
      </div>
    </div>
  );
};