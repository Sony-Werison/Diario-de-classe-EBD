
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check, ChevronDown, User, ChevronLeft, ChevronRight, CheckCircle, Notebook, Pencil, BookOpen, Smile, Ban } from "lucide-react";
import { initialClasses, ClassConfig, getSimulatedData, SimulatedFullData, CheckType, StudentChecks, DailyTasks } from "@/lib/data";
import { cn } from "@/lib/utils";
import { format, parseISO, startOfMonth, addMonths, subMonths, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const checkConfig: Record<CheckType | 'task', { Icon: React.ElementType; activeClass: string; inactiveClass: string; label: string; }> = {
  presence: { Icon: CheckCircle, activeClass: 'bg-blue-500 border-blue-500 text-white', inactiveClass: 'text-slate-600 bg-slate-800/50', label: 'Presença' },
  material: { Icon: Notebook, activeClass: 'bg-pink-500 border-pink-500 text-white', inactiveClass: 'text-slate-600 bg-slate-800/50', label: 'Material' },
  task: { Icon: Pencil, activeClass: 'bg-purple-500 border-purple-500 text-white', inactiveClass: 'text-slate-600 bg-slate-800/50', label: 'Tarefa' },
  verse: { Icon: BookOpen, activeClass: 'bg-yellow-500 border-yellow-500 text-black', inactiveClass: 'text-slate-600 bg-slate-800/50', label: 'Versículo' },
  behavior: { Icon: Smile, activeClass: 'bg-emerald-500 border-emerald-500 text-white', inactiveClass: 'text-slate-600 bg-slate-800/50', label: 'Comport.' },
};

const weekDays: { key: keyof DailyTasks, label: string }[] = [
    { key: 'mon', label: 'S' },
    { key: 'tue', label: 'T' },
    { key: 'wed', label: 'Q' },
    { key: 'thu', label: 'Q' },
    { key: 'fri', label: 'S' },
    { key: 'sat', label: 'S' },
];


export function MonthlyStudentReport() {
  const [fullData, setFullData] = useState<SimulatedFullData>(getSimulatedData);
  const [currentClassId, setCurrentClassId] = useState<string>(fullData.classes[0].id);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(fullData.classes[0].students[0]?.id || null);
  const [isClient, setIsClient] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));

  const { classes, lessons, studentRecords } = fullData;
  const currentClass = useMemo(() => classes.find((c) => c.id === currentClassId) || classes[0], [classes, currentClassId]);
  const selectedStudent = useMemo(() => currentClass.students.find(s => s.id === selectedStudentId), [currentClass.students, selectedStudentId]);

  useEffect(() => {
    setIsClient(true);
    const handleStorageChange = () => {
      const data = getSimulatedData();
      setFullData(data);
    };
    window.addEventListener('storage', handleStorageChange);

    // Set initial student if class changes
    if (!currentClass.students.find(s => s.id === selectedStudentId)) {
        setSelectedStudentId(currentClass.students[0]?.id || null);
    }
    
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [currentClassId, currentClass.students, selectedStudentId]);

  const handleMonthChange = (direction: 'prev' | 'next') => {
      const newMonth = direction === 'next' ? addMonths(currentMonth, 1) : subMonths(currentMonth, 1);
      setCurrentMonth(startOfMonth(newMonth));
  }
  
  const sundaysInMonth = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const days = Array.from({ length: 35 }, (_, i) => {
        const day = new Date(monthStart);
        day.setDate(day.getDate() - monthStart.getDay() + i);
        return day;
    });
    const sundays = days.filter(day => getDay(day) === 0);
    // Ensure we only show Sundays from the current month
    return sundays.filter(day => day.getMonth() === currentMonth.getMonth());
  }, [currentMonth]);


  if (!isClient) return null;

  return (
    <div className="text-white bg-background flex-1 flex flex-col" style={{'--class-color': currentClass.color} as React.CSSProperties}>
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full sm:w-60 justify-between bg-card border-border hover:bg-secondary">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{backgroundColor: currentClass.color}}/>
                            <span className="truncate">{currentClass.name}</span>
                          </div>
                          <ChevronDown className="h-4 w-4 shrink-0" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-full sm:w-60 bg-card border-border text-white">
                        {classes.map((c) => (
                        <DropdownMenuItem key={c.id} onSelect={() => setCurrentClassId(c.id)} className="cursor-pointer hover:bg-secondary focus:bg-secondary">
                            <Check size={16} className={cn("mr-2", currentClassId === c.id ? "opacity-100" : "opacity-0")} />
                            <div className="w-3 h-3 rounded-full mr-2" style={{backgroundColor: c.color}}/>
                            {c.name}
                        </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full sm:w-60 justify-between bg-card border-border hover:bg-secondary" disabled={currentClass.students.length === 0}>
                            <span className="truncate">{selectedStudent?.name || "Selecione um aluno"}</span>
                            <ChevronDown className="h-4 w-4 shrink-0" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-full sm:w-60 bg-card border-border text-white">
                        {currentClass.students.map((s) => (
                        <DropdownMenuItem key={s.id} onSelect={() => setSelectedStudentId(s.id)} className="cursor-pointer hover:bg-secondary focus:bg-secondary">
                             <Check size={16} className={cn("mr-2", selectedStudentId === s.id ? "opacity-100" : "opacity-0")} />
                            {s.name}
                        </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
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
                {selectedStudent ? (
                    sundaysInMonth.map(day => {
                        const dateKey = format(day, 'yyyy-MM-dd');
                        const lesson = lessons[currentClassId]?.[dateKey];
                        const checks = studentRecords[currentClassId]?.[dateKey]?.[selectedStudent.id];

                        if (!lesson && !checks) return null; // Skip days with no data

                        const isLessonCancelled = lesson?.status === 'cancelled';

                        return (
                            <div key={dateKey} className="bg-slate-800 p-3 flex items-center border-b border-slate-700/50">
                                <div className="w-1/3">
                                    <p className="text-sm font-semibold text-slate-200">{format(day, "dd 'de' MMMM", { locale: ptBR })}</p>
                                    <p className={cn("text-xs truncate", isLessonCancelled ? "text-yellow-400 italic" : "text-slate-400")}>
                                        {isLessonCancelled ? lesson.cancellationReason : lesson?.title || "Sem título"}
                                    </p>
                                </div>
                                <div className="flex-1 flex justify-center items-center gap-4">
                                     {(Object.keys(checkConfig) as (CheckType | 'task')[]).map(type => {
                                        if (!currentClass.trackedItems[type]) return null;

                                        if (type === 'task' && currentClass.taskMode === 'daily') {
                                            return (
                                                <div key="daily-task-group" className="flex flex-col items-center gap-1">
                                                    <div className="flex items-center justify-center gap-1 border border-slate-700 rounded-lg p-1 bg-slate-900/50">
                                                        {weekDays.map(day => (
                                                            <div
                                                                key={day.key}
                                                                className={cn(
                                                                    "w-7 h-8 rounded-md flex items-center justify-center transition-all duration-200 text-xs font-bold",
                                                                    checks?.dailyTasks?.[day.key] ? checkConfig.task.activeClass : checkConfig.task.inactiveClass,
                                                                )}
                                                                >
                                                                {day.label}
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <span className="text-[10px] text-slate-500 font-semibold">{checkConfig.task.label}</span>
                                                </div>
                                            );
                                        }

                                        const CheckIcon = checkConfig[type].Icon;
                                        return (
                                            <div key={type} className="flex flex-col items-center gap-1">
                                                <div
                                                    className={cn(
                                                        "w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 border",
                                                        checks?.[type as CheckType] ? checkConfig[type].activeClass : checkConfig[type].inactiveClass,
                                                    )}
                                                >
                                                    {isLessonCancelled ? <Ban size={20} className="text-yellow-500"/> : <CheckIcon size={20} />}
                                                </div>
                                                <span className="text-[10px] text-slate-500 font-semibold">{checkConfig[type].label}</span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )
                    })
                ) : (
                    <div className="flex-1 flex items-center justify-center bg-card border border-border rounded-xl h-full p-10">
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
