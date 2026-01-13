

"use client";

import { Student, CheckType, StudentChecks, DailyTasks } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Notebook, Pencil, BookOpen, Smile, Ban, ClipboardCheck } from "lucide-react";

interface StudentRowProps {
  student: Student & { 
    dailyScore: number; 
    age: number | null,
    completionPercent: number;
    checkedItemsCount: number;
    totalTrackedItems: number;
  };
  onToggleCheck: (id: string, type: CheckType | 'task') => void;
  onToggleDailyTask: (studentId: string, day: keyof DailyTasks) => void;
  trackedItems: Record<CheckType | 'task', boolean>;
  taskMode: 'unique' | 'daily';
  isLessonCancelled: boolean;
}

const checkConfig: Record<CheckType | 'task', { Icon: React.ElementType; activeClass: string; inactiveClass: string; label: string; }> = {
  presence: { Icon: CheckCircle, activeClass: 'bg-blue-500 border-blue-500 text-white', inactiveClass: 'text-slate-400 bg-slate-700/50', label: 'Presença' },
  material: { Icon: Notebook, activeClass: 'bg-pink-500 border-pink-500 text-white', inactiveClass: 'text-slate-400 bg-slate-700/50', label: 'Material' },
  inClassTask: { Icon: ClipboardCheck, activeClass: 'bg-indigo-500 border-indigo-500 text-white', inactiveClass: 'text-slate-400 bg-slate-700/50', label: 'T. Sala'},
  task: { Icon: Pencil, activeClass: 'bg-purple-500 border-purple-500 text-white', inactiveClass: 'text-slate-400 bg-slate-700/50', label: 'T. Casa' },
  verse: { Icon: BookOpen, activeClass: 'bg-yellow-500 border-yellow-500 text-black', inactiveClass: 'text-slate-400 bg-slate-700/50', label: 'Versículo' },
  behavior: { Icon: Smile, activeClass: 'bg-emerald-500 border-emerald-500 text-white', inactiveClass: 'text-slate-400 bg-slate-700/50', label: 'Comport.' },
};

const weekDays: { key: keyof DailyTasks, label: string }[] = [
    { key: 'mon', label: 'S' },
    { key: 'tue', label: 'T' },
    { key: 'wed', label: 'Q' },
    { key: 'thu', label: 'Q' },
    { key: 'fri', label: 'S' },
    { key: 'sat', label: 'S' },
];

export function StudentRow({ student, onToggleCheck, onToggleDailyTask, trackedItems, taskMode, isLessonCancelled }: StudentRowProps) {
  const { id, name, checks, dailyScore, age, completionPercent, checkedItemsCount, totalTrackedItems } = student;
  
  return (
    <div className="bg-slate-800 p-2 border-b border-slate-700/50">
      <div className="flex items-center justify-between gap-3">
        {/* Coluna Esquerda: Nome e Idade */}
        <div className="flex-1 space-y-1">
            <div>
                <p className="text-sm font-semibold text-slate-200">{name}</p>
                <p className="text-xs text-slate-400">{age !== null ? `${age} anos` : 'Idade não informada'}</p>
            </div>
             <div className="flex flex-col justify-center">
                <div className="flex justify-between text-xs mb-0.5">
                <span className={cn("font-bold text-primary")}>
                    {Math.round(completionPercent)}%
                </span>
                <span className="text-slate-500">{checkedItemsCount}/{totalTrackedItems}</span>
                </div>
                <Progress value={completionPercent} className="h-1 bg-slate-900 border border-slate-700" indicatorClassName={cn(completionPercent === 100 ? "bg-gradient-to-r from-yellow-400 to-yellow-600" : "bg-primary")} />
            </div>
        </div>

        {/* Coluna Direita: Checks e Progresso */}
        <div className="flex flex-col items-center gap-1.5">
            <div className="flex justify-end items-start gap-1 flex-wrap max-w-[180px]">
                {(Object.keys(checkConfig) as (CheckType | 'task')[]).map(type => {
                    if (!trackedItems[type] || (type === 'task' && taskMode === 'daily')) return null;

                    let isDisabled = !checks.presence && ['material', 'verse', 'behavior', 'inClassTask'].includes(type);
                    if (isLessonCancelled) isDisabled = false;
                     if(type === 'task') isDisabled = false;

                    const CheckIcon = checkConfig[type].Icon;
                    return (
                        <div key={type} className="flex flex-col items-center gap-1">
                            <button
                            onClick={() => onToggleCheck(id, type)}
                            className={cn(
                                "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 border",
                                checks[type] ? checkConfig[type].activeClass : checkConfig[type].inactiveClass,
                                isDisabled ? 'opacity-50 cursor-not-allowed' : '',
                            )}
                            aria-label={`Marcar ${type} para ${name}`}
                            disabled={isDisabled}
                            >
                            {isLessonCancelled && !checks[type] && type !== 'task' ? <Ban size={16} className="text-yellow-500"/> : <CheckIcon size={16} />}
                            </button>
                            <span className="text-[9px] text-slate-500 font-semibold">{checkConfig[type].label}</span>
                        </div>
                    )
                })}
            </div>
            
            {trackedItems.task && taskMode === 'daily' && (
                <div className="flex flex-col items-center gap-1 self-center">
                    <div className="flex items-center justify-center gap-1 border border-slate-700 rounded-lg p-1 bg-slate-700/50">
                        {weekDays.map(day => (
                            <button
                                key={day.key}
                                onClick={() => onToggleDailyTask(id, day.key)}
                                className={cn(
                                    "w-5 h-6 rounded-md flex items-center justify-center transition-all duration-200 text-[10px] font-bold",
                                    checks.dailyTasks?.[day.key] ? checkConfig.task.activeClass : 'text-slate-400 bg-slate-700/50'
                                )}
                                aria-label={`Marcar tarefa de ${day.label} para ${name}`}
                                >
                                {isLessonCancelled && !checks.dailyTasks?.[day.key] ? <Ban size={12} className="text-yellow-500/80"/> : day.label}
                            </button>
                        ))}
                    </div>
                    <span className="text-[9px] text-slate-500 font-semibold">{checkConfig.task.label}</span>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
