"use client";

import { Student, CheckType } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserCheck, Book, BookHeart, Smile, Pen, Crown, ThumbsUp } from "lucide-react";

interface StudentRowProps {
  student: Student & { dailyScore: number; level: number; xpPercent: number };
  onToggleCheck: (id: number, type: CheckType) => void;
  trackedItems: Record<CheckType, boolean>;
}

const checkConfig: Record<CheckType, { Icon: React.ElementType; activeClass: string; inactiveClass: string; }> = {
  presence: { Icon: UserCheck, activeClass: 'bg-blue-500 border-blue-500 text-white', inactiveClass: 'text-slate-400 bg-slate-700/50' },
  task: { Icon: Book, activeClass: 'bg-purple-500 border-purple-500 text-white', inactiveClass: 'text-slate-400 bg-slate-700/50' },
  verse: { Icon: BookHeart, activeClass: 'bg-yellow-500 border-yellow-500 text-black', inactiveClass: 'text-slate-400 bg-slate-700/50' },
  behavior: { Icon: Smile, activeClass: 'bg-emerald-500 border-emerald-500 text-white', inactiveClass: 'text-slate-400 bg-slate-700/50' },
  material: { Icon: Pen, activeClass: 'bg-pink-500 border-pink-500 text-white', inactiveClass: 'text-slate-400 bg-slate-700/50' },
};

export function StudentRow({ student, onToggleCheck, trackedItems }: StudentRowProps) {
  const { id, name, photo, checks, dailyScore, level, xpPercent } = student;
  
  return (
    <div className="bg-slate-800 p-3 flex items-center border-b border-slate-700/50 transition-colors hover:bg-slate-700/50 group min-w-[640px]">
      <div className="w-2/5 md:w-1/3 flex items-center gap-3 pl-2">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-slate-700 text-xs font-bold text-slate-300 border-slate-600">
            {photo}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">{name}</p>
          <div className="flex gap-1.5 mt-0.5">
            {checks.verse && trackedItems.verse && <Crown size={12} className="text-yellow-400 animate-pulse" />}
            {checks.behavior && trackedItems.behavior && <ThumbsUp size={12} className="text-green-400" />}
          </div>
        </div>
      </div>
      
      <div className="flex-1 flex justify-center gap-2 sm:gap-4">
        {(Object.keys(checkConfig) as CheckType[]).map(type => {
          if (!trackedItems[type]) return null;
          const CheckIcon = checkConfig[type].Icon;
          return (
            <button
              key={type}
              onClick={() => onToggleCheck(id, type)}
              className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 border",
                checks[type] ? checkConfig[type].activeClass : checkConfig[type].inactiveClass,
                !checks.presence && type !== 'presence' ? 'opacity-50 cursor-not-allowed' : 'hover:border-slate-500',
              )}
              aria-label={`Marcar ${type} para ${name}`}
              disabled={!checks.presence && type !== 'presence'}
            >
              <CheckIcon size={20} />
            </button>
          )
        })}
      </div>

      <div className="w-1/4 pl-4 pr-2 flex flex-col justify-center">
        <div className="flex justify-between text-xs mb-1">
          <span className={cn("font-bold", dailyScore > 0 ? "text-green-400" : "text-slate-400")}>
            +{dailyScore} pts
          </span>
          <span className="text-slate-500">Nvl {level}</span>
        </div>
        <Progress value={xpPercent} className="h-2 bg-slate-900 border border-slate-700" indicatorClassName="bg-gradient-to-r from-blue-600 to-indigo-400" />
      </div>

      <div className="w-12 text-right">
      </div>
    </div>
  );
}
