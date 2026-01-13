

"use client";

import { Student, CheckType, StudentChecks, DailyTasks } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Notebook, Pencil, BookOpen, Smile } from "lucide-react";

interface StudentRowProps {
  student: Student & { 
    dailyScore: number; 
    age: number | null,
    completionPercent: number;
    checkedItemsCount: number;
    totalTrackedItems: number;
  };
  onToggleCheck: (id: string, type: CheckType | 'task') => void;
  onToggleDailyTask: (studentId: string, day: string) => void;
  trackedItems: Record<CheckType | 'task', boolean>;
  taskMode: 'unique' | 'daily';
  isLessonCancelled: boolean;
}

const checkConfig: Record<CheckType | 'task', { Icon: React.ElementType; activeClass: string; inactiveClass: string; label: string; }> = {
  presence: { Icon: CheckCircle, activeClass: 'bg-blue-500 border-blue-500 text-white', inactiveClass: 'text-slate-400 bg-slate-700/50', label: 'Presença' },
  material: { Icon: Notebook, activeClass: 'bg-pink-500 border-pink-500 text-white', inactiveClass: 'text-slate-400 bg-slate-700/50', label: 'Material' },
  task: { Icon: Pencil, activeClass: 'bg-purple-500 border-purple-500 text-white', inactiveClass: 'text-slate-400 bg-slate-700/50', label: 'Tarefa' },
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

export function StudentRow({ student, onToggleCheck, trackedItems, taskMode, onToggleDailyTask, isLessonCancelled }: StudentRowProps) {
  const { id, name, checks, dailyScore, age, completionPercent, checkedItemsCount, totalTrackedItems } = student;
  const singleItem = totalTrackedItems <= 1 && taskMode === 'unique';
  
  return (
    <div className="bg-slate-800 p-3 flex flex-col sm:flex-row sm:items-center border-b border-slate-700/50 transition-colors hover:bg-slate-700/50 group">
        <div className="flex items-center w-full">
            <div className="w-1/3">
                <div className="pl-2">
                  <p className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">{name}</p>
                   <p className="text-xs text-slate-400">{age !== null ? `${age} anos` : 'Idade não informada'}</p>
                </div>
            </div>
            
            <div className="flex-1 flex justify-center items-center gap-4">
                {(Object.keys(checkConfig) as (CheckType | 'task')[]).map(type => {
                    if (!trackedItems[type]) return null;

                    const isDisabled = !checks.presence && type !== 'presence' && type !== 'task' && !isLessonCancelled;

                    if (type === 'task' && taskMode === 'daily') {
                        return (
                            <div key="daily-task-group" className="flex flex-col items-center gap-1">
                                <div className="flex items-center justify-center gap-1 border border-slate-700 rounded-lg p-1 bg-slate-700/50">
                                    {weekDays.map(day => (
                                        <button
                                            key={day.key}
                                            onClick={() => onToggleDailyTask(id, day.key)}
                                            className={cn(
                                                "w-7 h-8 rounded-md flex items-center justify-center transition-all duration-200 text-xs font-bold",
                                                checks.dailyTasks?.[day.key] ? checkConfig.task.activeClass : 'text-slate-400 bg-slate-700/50',
                                                'hover:border-slate-500' // Always allow hover for tasks
                                            )}
                                            aria-label={`Marcar tarefa de ${day.label} para ${name}`}
                                            >
                                            {day.label}
                                        </button>
                                    ))}
                                </div>
                                <span className="text-[10px] text-slate-500 font-semibold">{checkConfig.task.label}</span>
                            </div>
                        );
                    }

                    const CheckIcon = checkConfig[type].Icon;
                    return (
                        <div key={type} className="flex flex-col items-center gap-1">
                            <button
                            onClick={() => onToggleCheck(id, type)}
                            className={cn(
                                "w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 border",
                                (checks as any)[type] ? checkConfig[type].activeClass : checkConfig[type].inactiveClass,
                                isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-slate-500',
                            )}
                            aria-label={`Marcar ${type} para ${name}`}
                            disabled={isDisabled}
                            >
                            <CheckIcon size={20} />
                            </button>
                            <span className="text-[10px] text-slate-500 font-semibold">{checkConfig[type].label}</span>
                        </div>
                    )
                })}
            </div>

            {(!singleItem || taskMode === 'daily') && (
                <div className="w-1/4 pl-4 pr-2 flex-col justify-center hidden sm:flex">
                    <div className="flex justify-between text-xs mb-1">
                    <span className={cn("font-bold", dailyScore > 0 ? "text-[var(--class-color)]" : "text-slate-400")}>
                        {Math.round(completionPercent)}%
                    </span>
                    <span className="text-slate-500">{checkedItemsCount}/{totalTrackedItems}</span>
                    </div>
                    <Progress value={completionPercent} className="h-2 bg-slate-900 border border-slate-700" indicatorClassName={cn(completionPercent === 100 ? "bg-gradient-to-r from-yellow-400 to-yellow-600" : "bg-[var(--class-color)]")} />
                </div>
            )}
        </div>

      {(!singleItem || taskMode === 'daily') && (
        <div className="w-full sm:hidden mt-3 sm:mt-0 sm:pl-4 sm:pr-2 flex flex-col justify-center">
            <div className="flex justify-between text-xs mb-1">
            <span className={cn("font-bold", dailyScore > 0 ? "text-[var(--class-color)]" : "text-slate-400")}>
                {Math.round(completionPercent)}%
            </span>
            <span className="text-slate-500">{checkedItemsCount}/{totalTrackedItems}</span>
            </div>
            <Progress value={completionPercent} className="h-2 bg-slate-900 border border-slate-700" indicatorClassName={cn(completionPercent === 100 ? "bg-gradient-to-r from-yellow-400 to-yellow-600" : "bg-[var(--class-color)]")} />
        </div>
      )}

    </div>
  );
}
