"use client";
import React, { useState, useMemo, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Check, ChevronDown, ChevronLeft, ChevronRight, Download, Users, X, CheckCircle, Notebook, Pencil, BookOpen, Smile } from "lucide-react";
import { initialClasses, ClassConfig, Student, CheckType, generateFullSimulatedData, SimulatedFullData } from "@/lib/data";
import { cn } from "@/lib/utils";
import { format, getDaysInMonth, startOfMonth, addMonths, subMonths, getDay, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";


const itemIcons: Record<CheckType, React.ElementType> = {
  presence: CheckCircle,
  material: Notebook,
  task: Pencil,
  verse: BookOpen,
  behavior: Smile,
};

const itemLabels: Record<CheckType, string> = {
  presence: "Presença",
  material: "Material",
  task: "Tarefa",
  verse: "Versículo",
  behavior: "Comportamento",
};

const itemColors: Record<CheckType, string> = {
    presence: 'text-blue-400',
    material: 'text-pink-400',
    task: 'text-purple-400',
    verse: 'text-yellow-400',
    behavior: 'text-emerald-400',
}

export function MonthlyReport() {
  const [classes, setClasses] = useState<ClassConfig[]>(initialClasses);
  const [currentClassId, setCurrentClassId] = useState<string>(initialClasses[0].id);
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));
  const [simulatedData, setSimulatedData] = useState<SimulatedFullData>({ lessons: {}, studentRecords: {} });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setSimulatedData(generateFullSimulatedData(initialClasses));
    setCurrentMonth(startOfMonth(new Date()));
  }, []);

  const currentClass = useMemo(
    () => classes.find((c) => c.id === currentClassId) || classes[0],
    [classes, currentClassId]
  );
  
  const orderedVisibleItems: CheckType[] = useMemo(() => ['presence', 'material', 'task', 'verse', 'behavior'].filter(
    item => currentClass.trackedItems[item as CheckType]
  ) as CheckType[], [currentClass.trackedItems]);


  const monthStudentRecords = useMemo(() => {
    const classRecords = simulatedData.studentRecords[currentClassId];
    if (!classRecords) return {};

    const monthKey = format(currentMonth, 'yyyy-MM');
    const relevantRecords: typeof classRecords = {};
    
    for (const dateKey in classRecords) {
      if (dateKey.startsWith(monthKey)) {
        relevantRecords[dateKey] = classRecords[dateKey];
      }
    }
    return relevantRecords;
  }, [simulatedData.studentRecords, currentClassId, currentMonth]);


  const reportRef = useRef<HTMLDivElement>(null);

  const handleMonthChange = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => direction === 'next' ? addMonths(prev, 1) : subMonths(prev, 1));
  }

  const daysInMonth = useMemo(() => {
    if (!isClient) return [];
    const dayCount = getDaysInMonth(currentMonth);
    return Array.from({ length: dayCount }, (_, i) => new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i + 1));
  }, [currentMonth, isClient]);
  
  const sundaysInMonth = useMemo(() => daysInMonth.filter(d => getDay(d) === 0), [daysInMonth]);

  const getStudentChecksForDay = (studentId: number, day: Date) => {
    const dateKey = format(day, 'yyyy-MM-dd');
    return monthStudentRecords[dateKey]?.[studentId];
  }
  
  const Legend = () => (
    <div className="flex flex-wrap gap-x-4 gap-y-1 items-center px-4 py-2 border-b border-slate-700 bg-slate-800 rounded-t-xl">
        <span className="text-xs font-bold text-slate-400 uppercase">Legenda:</span>
        {orderedVisibleItems.map(item => {
            const Icon = itemIcons[item];
            return (
                <div key={item} className="flex items-center gap-1.5">
                    <Icon size={14} className={cn(itemColors[item])} />
                    <span className="text-xs text-slate-300">{itemLabels[item]}</span>
                </div>
            )
        })}
    </div>
  )

  if (!isClient) {
    return null;
  }

  return (
    <div className="p-4 sm:p-6 text-white bg-background flex-1 flex flex-col">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Relatório Mensal</h1>
        <p className="text-slate-400">
          Acompanhe a frequência e o cumprimento dos critérios de avaliação.
        </p>
      </header>

      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                variant="outline"
                className="w-full sm:w-60 justify-between bg-card border-border hover:bg-secondary"
                >
                <span className="truncate">{currentClass.name}</span>
                <ChevronDown className="h-4 w-4 shrink-0" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-full sm:w-60 bg-card border-border text-white">
                {classes.map((c) => (
                <DropdownMenuItem
                    key={c.id}
                    onSelect={() => setCurrentClassId(c.id)}
                    className="cursor-pointer hover:bg-secondary focus:bg-secondary"
                >
                    <Check
                    size={16}
                    className={cn(
                        "mr-2",
                        currentClassId === c.id ? "opacity-100" : "opacity-0"
                    )}
                    />
                    {c.name}
                </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
            </DropdownMenu>
            
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

      </div>

      <div className="flex-1 flex flex-col min-h-0">
          <Legend />
          <div className="overflow-auto border border-slate-700 border-t-0 rounded-b-xl" ref={reportRef}>
              <table className="w-full border-collapse table-fixed">
                  <thead className="sticky top-0 z-10 bg-slate-900/80 backdrop-blur-sm">
                      <tr>
                          <th className="p-3 border-b border-r border-slate-700 text-left text-xs font-bold uppercase text-slate-400 sticky left-0 bg-slate-900/80 z-20 w-1/3 sm:w-1/4">Aluno</th>
                          {sundaysInMonth.map(day => (
                              <th key={day.toISOString()} className="p-3 text-center border-b border-r border-slate-700 last:border-r-0 text-xs font-bold uppercase text-slate-400 w-12">
                                  {format(day, 'dd')}
                              </th>
                          ))}
                      </tr>
                  </thead>
                  <tbody>
                      {currentClass.students.map(student => {
                          return (
                              <tr key={student.id} className="text-sm hover:bg-slate-800/50">
                                  <td className="p-2 whitespace-nowrap overflow-hidden text-ellipsis border-b border-r border-slate-700 font-medium text-slate-200 sticky left-0 bg-slate-800/50 z-10">{student.name}</td>
                                  {sundaysInMonth.map(day => {
                                      const studentChecks = getStudentChecksForDay(student.id, day);
                                      return (
                                          <td key={day.toISOString()} className="text-center border-b border-r border-slate-700 last:border-r-0 h-full p-2">
                                              {studentChecks ? (
                                              <TooltipProvider>
                                                  <Tooltip>
                                                      <TooltipTrigger asChild>
                                                          <div className="flex flex-col items-center justify-center gap-0.5">
                                                              {orderedVisibleItems.map(item => {
                                                                  const Icon = itemIcons[item];
                                                                  const isChecked = studentChecks[item];
                                                                  return (
                                                                      <Icon key={item} size={14} className={cn(isChecked ? itemColors[item] : 'text-slate-700 opacity-60')} />
                                                                  )
                                                              })}
                                                          </div>
                                                      </TooltipTrigger>
                                                      <TooltipContent className="bg-slate-900 border-slate-700 text-white">
                                                          <div className="space-y-1">
                                                              {orderedVisibleItems.map(item => (
                                                                  <div key={item} className="flex items-center gap-2 text-xs">
                                                                      {studentChecks[item] ? <Check size={14} className="text-green-500"/> : <X size={14} className="text-slate-500" />}
                                                                      <span>{itemLabels[item]}</span>
                                                                  </div>
                                                              ))}
                                                          </div>
                                                      </TooltipContent>
                                                  </Tooltip>
                                              </TooltipProvider>
                                              ) : (
                                                  <span className="text-slate-600">-</span>
                                              )}
                                          </td>
                                      )
                                  })}
                              </tr>
                          )
                      })}
                  </tbody>
              </table>
              {currentClass.students.length === 0 && (
                  <div className="text-center py-16 text-slate-500 rounded-b-xl bg-slate-800">
                      <Users size={40} className="mx-auto mb-2" />
                      <h3 className="font-bold">Nenhum aluno nesta classe</h3>
                      <p className="text-sm">Vá para as configurações para adicionar alunos.</p>
                  </div>
              )}
          </div>
      </div>
    </div>
  );
}
