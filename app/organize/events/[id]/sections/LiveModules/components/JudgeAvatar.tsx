import { Users } from "lucide-react";
import { User } from "@/app/types/userType";

interface JudgeAvatarProps {
  userId: string;
  usersMap: Record<string, User>;
  judgeIndex: number;
}

const JudgeAvatar = ({ userId, usersMap, judgeIndex }: JudgeAvatarProps) => {
  const user = usersMap[userId];

  const initials = user
    ? `${user.firstName?.charAt(0) ?? ""}${user.lastName?.charAt(0) ?? ""}`
    : "??";

  const fullName = user ? `${user.firstName} ${user.lastName}` : "Jurado sin nombre";

  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="text-xs font-medium text-gray-700">Jurado {judgeIndex + 1}</div>
      <div className="w-12 h-12 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center overflow-hidden">
        {/* Avatar con iniciales si no hay imagen */}
        <div className="w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center text-sm font-semibold">
          {initials}
        </div>
      </div>
      <div className="text-xs font-medium text-gray-700 text-center max-w-[80px] leading-tight">
        {fullName}
      </div>
    </div>
  );
};

export default JudgeAvatar;