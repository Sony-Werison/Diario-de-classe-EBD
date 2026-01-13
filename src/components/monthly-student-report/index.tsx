

"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { Check, ChevronDown, User, ChevronLeft, ChevronRight, CheckCircle, Notebook, Pencil, BookOpen, Smile, Ban, ClipboardCheck } from "lucide-react";
import { ClassConfig, getSimulatedData, SimulatedFullData, CheckType, StudentChecks, DailyTasks } from "@/lib/data";
import { cn } from "@/lib/utils";
import { format, startOfMonth, addMonths, subMonths, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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

const calculateDailyProgress = (checks: StudentChecks, classConfig: ClassConfig) => {
    const activeTrackedItems = (Object.keys(classConfig.trackedItems) as (CheckType | 'task')[]).filter(
      key => classConfig.trackedItems[key]
    );
    
    const checkedItemsCount = activeTrackedItems.filter(
      key => {
        if ((checks as any)[key]) {
          if (['behavior', 'verse', 'material', 'inClassTask'].includes(key) && !checks.presence) {
              return false;
          }
          return true;
        }
        return false;
      }
    ).length;

    const totalItemsForPercentage = activeTrackedItems.filter(key => {
        if (['behavior', 'verse', 'material', 'inClassTask'].includes(key)) {
          return checks.presence;
        }
        return true;
    }).length;

    const completionPercent = totalItemsForPercentage > 0
      ? (checkedItemsCount / totalItemsForPercentage) * 100
      : 0;
      
    return {
      completionPercent: Math.round(completionPercent),
      checkedItemsCount,
      totalTrackedItems: totalItemsForPercentage
    };
}


export function MonthlyStudentReport() {
  const [fullData, setFullData] = useState<SimulatedFullData>(getSimulatedData);
  const [currentClassId, setCurrentClassId] = useState<string>('');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));

  useEffect(() => {
    setIsClient(true);
     const data = getSimulatedData();
      setFullData(data);
       if (data.classes.length > 0) {
        const firstClass = data.classes[0];
        setCurrentClassId(firstClass.id);
        if (firstClass.students.length > 0) {
            setSelectedStudentId(firstClass.students[0].id);
        }
    }

    const handleStorageChange = () => {
      const data = getSimulatedData();
      setFullData(data);
    };
    window.addEventListener('storage', handleStorageChange);
    
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  
  const { classes, lessons, studentRecords } = fullData;
  const currentClass = useMemo(() => classes.find((c) => c.id === currentClassId), [classes, currentClassId]);
  const selectedStudent = useMemo(() => currentClass?.students.find(s => s.id === selectedStudentId), [currentClass?.students, selectedStudentId]);

  useEffect(() => {
    if (currentClass && !currentClass.students.find(s => s.id === selectedStudentId)) {
        setSelectedStudentId(currentClass.students[0]?.id || null);
    }
  }, [currentClass, selectedStudentId]);


  const handleMonthChange = (direction: 'prev' | 'next') => {
      const newMonth = direction === 'next' ? addMonths(currentMonth, 1) : subMonths(currentMonth, 1);
      setCurrentMonth(startOfMonth(newMonth));
  }
  
  const sundaysInMonth = useMemo(() => {
    if (!currentMonth || !isClient) return [];
    
    const sundays: Date[] = [];
    const month = currentMonth.getMonth();
    const year = currentMonth.getFullYear();
    let date = new Date(year, month, 1);

    // Find the first Sunday of the month
    while (getDay(date) !== 0) {
        date.setDate(date.getDate() + 1);
        // If we jumped to the next month, there's no Sunday in the first few days.
        if (date.getMonth() !== month) break;
    }
    
    // If we are still in the correct month, add all Sundays
    while (date.getMonth() === month) {
        sundays.push(new Date(date));
        date.setDate(date.getDate() + 7);
    }
    
    return sundays;
  }, [currentMonth, isClient]);


  if (!isClient || !currentClass) return null;

  return (
    <div className="text-white bg-background flex-1 flex flex-col" style={{'--class-color': currentClass?.color} as React.CSSProperties}>
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full sm:w-auto sm:min-w-48 justify-between bg-card border-border">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{backgroundColor: currentClass?.color}}/>
                            <span className="truncate">{currentClass?.name}</span>
                          </div>
                          <ChevronDown className="h-4 w-4 shrink-0" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] bg-card border-border text-white">
                        {classes.map((c) => (
                        <DropdownMenuItem key={c.id} onSelect={() => setCurrentClassId(c.id)} className="cursor-pointer focus:bg-card">
                            <Check size={16} className={cn("mr-2", currentClassId === c.id ? "opacity-100" : "opacity-0")} />
                            <div className="w-3 h-3 rounded-full mr-2" style={{backgroundColor: c.color}}/>
                            {c.name}
                        </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                {currentClass && <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full sm:w-auto sm:min-w-48 justify-between bg-card border-border" disabled={currentClass.students.length === 0}>
                            <span className="truncate">{selectedStudent?.name || "Selecione um aluno"}</span>
                            <ChevronDown className="h-4 w-4 shrink-0" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] bg-card border-border text-white">
                        {currentClass.students.map((s) => (
                        <DropdownMenuItem key={s.id} onSelect={() => setSelectedStudentId(s.id)} className="cursor-pointer focus:bg-card">
                             <Check size={16} className={cn("mr-2", selectedStudentId === s.id ? "opacity-100" : "opacity-0")} />
                            {s.name}
                        </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>}
            </div>
            
            <div className="flex items-center gap-2 bg-card border border-border px-2 py-1 rounded-md w-full sm:w-auto justify-between">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleMonthChange('prev')}>
                    <ChevronLeft size={16} />
                </Button>
                <span className="font-bold text-sm capitalize w-28 text-center">
                    {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
                </span>
                 <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleMonthChange('next')}>
                    <ChevronRight size={16} />
                </Button>
            </div>
        </div>

        <div className="bg-card border border-border rounded-xl flex flex-col flex-1">
             <div className="space-y-px bg-card rounded-xl overflow-hidden">
                {selectedStudent && currentClass ? (
                    sundaysInMonth.map(day => {
                        const dateKey = format(day, 'yyyy-MM-dd');
                        const lesson = lessons[currentClassId]?.[dateKey];
                        const checks = studentRecords[currentClassId]?.[dateKey]?.[selectedStudent.id];

                        if (!lesson && !checks) return null;

                        const isLessonCancelled = lesson?.status === 'cancelled';
                        const { completionPercent, checkedItemsCount, totalTrackedItems } = checks ? calculateDailyProgress(checks, currentClass) : { completionPercent: 0, checkedItemsCount: 0, totalTrackedItems: 0 };
                        const isComplete = completionPercent === 100;

                        return (
                             <div key={dateKey} className="bg-slate-800 p-2 border-b border-slate-700/50">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex-1 space-y-2 min-w-0">
                                      <div className='mb-1'>
                                        <p className="text-sm font-semibold text-slate-200">{format(day, "dd 'de' MMMM", { locale: ptBR })}</p>
                                        <p className={cn("text-xs truncate", isLessonCancelled ? "text-yellow-400 italic" : "text-slate-400")}>
                                            {isLessonCancelled ? lesson.cancellationReason : lesson?.title || "Sem título"}
                                        </p>
                                      </div>
                                       {checks && <div className="flex flex-col justify-center">
                                            <div className="flex justify-between text-xs mb-0.5">
                                            <span className={cn("font-bold", isComplete ? "text-primary" : "text-yellow-400")}>
                                                {completionPercent}%
                                            </span>
                                            <span className="text-slate-500">{checkedItemsCount}/{totalTrackedItems}</span>
                                            </div>
                                            <Progress value={completionPercent} className="h-1 bg-slate-900 border border-slate-700" indicatorClassName={cn(isComplete ? "bg-primary" : "bg-gradient-to-r from-yellow-400 to-yellow-600")} />
                                        </div>}
                                    </div>
                                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                                        <div className="flex flex-wrap justify-end gap-1">
                                            {(Object.keys(checkConfig) as (CheckType | 'task')[]).map(type => {
                                                if (!currentClass.trackedItems[type] || (type === 'task' && currentClass.taskMode === 'daily')) return null;

                                                const CheckIcon = checkConfig[type].Icon;
                                                return (
                                                <div key={type} className="flex flex-col items-center gap-1">
                                                    <div
                                                    className={cn(
                                                        "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 border",
                                                        checks?.[type] ? checkConfig[type].activeClass : checkConfig[type].inactiveClass,
                                                    )}
                                                    >
                                                    {isLessonCancelled && !checks?.[type] && type !== 'task' ? <Ban size={16} className="text-yellow-500" /> : <CheckIcon size={16} />}
                                                    </div>
                                                    <span className="text-[9px] text-slate-500 font-semibold">{checkConfig[type].label}</span>
                                                </div>
                                                )
                                            })}
                                        </div>
                                         {currentClass.trackedItems.task && currentClass.taskMode === 'daily' && (
                                            <div className="flex flex-col items-center gap-1">
                                                <div className="flex items-center justify-center gap-1 border border-slate-700 rounded-lg p-1 bg-slate-700/50">
                                                    {weekDays.map(day => (
                                                        <button
                                                            key={day.key}
                                                            className={cn(
                                                                "w-5 h-6 rounded-md flex items-center justify-center transition-all duration-200 text-[10px] font-bold cursor-default",
                                                                checks?.dailyTasks?.[day.key] ? checkConfig.task.activeClass : 'text-slate-400 bg-slate-700/50'
                                                            )}
                                                            >
                                                            {isLessonCancelled && !checks?.dailyTasks?.[day.key] ? <Ban size={12} className="text-yellow-500/80"/> : day.label}
                                                        </button>
                                                    ))}
                                                </div>
                                                <span className="text-[9px] text-slate-500 font-semibold">{checkConfig.task.label}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })
                ) : (
                    <div className="flex-1 flex items-center justify-center bg-card rounded-xl h-full p-10">
                        <div className="text-center text-slate-500">
                            <User size={40} className="mx-auto mb-2" />
                            <h3 className="font-bold">Nenhum aluno selecionado</h3>
                            <p className="text-sm">Selecione uma classe e um aluno para ver o relatório.</p>
                        </div>
                    </div>
                )}
             </div>
        </div>
    </div>
  );
}

    