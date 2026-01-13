
"use client";
import React, { useState, useMemo, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Check, ChevronDown, ChevronLeft, ChevronRight, Users } from "lucide-react";
import { initialClasses, ClassConfig, getSimulatedData, SimulatedFullData } from "@/lib/data";
import { cn } from "@/lib/utils";
import { format, getDaysInMonth, startOfMonth, addMonths, subMonths, getDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { itemIcons, itemLabels, itemColors, CheckType } from "../report-helpers";

export function MonthlyReport() {
  const [classes, setClasses] = useState<ClassConfig[]>(initialClasses);
  const [currentClassId, setCurrentClassId] = useState<string>(initialClasses[0].id);
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date(new Date().getFullYear(), 0, 1)));
  const [simulatedData, setSimulatedData] = useState<SimulatedFullData>({ classes: [], lessons: {}, studentRecords: {} });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Load data once on mount
    const handleStorageChange = () => {
        const data = getSimulatedData();
        setSimulatedData(data);
        if (data.classes) {
          setClasses(data.classes);
        }
    };
    handleStorageChange(); // Initial load
    window.addEventListener('storage', handleStorageChange);
    return () => {
        window.removeEventListener('storage', handleStorageChange);
    };
  }, []);


  const currentClass = useMemo(
    () => classes.find((c) => c.id === currentClassId) || classes[0],
    [classes, currentClassId]
  );
  
  const orderedVisibleItems: CheckType[] = useMemo(() => ['presence', 'material', 'task', 'verse', 'behavior'].filter(
    item => currentClass.trackedItems[item as CheckType]
  ) as CheckType[], [currentClass.trackedItems]);


  const monthStudentRecords = useMemo(() => {
    if (!isClient) return {};
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
  }, [simulatedData.studentRecords, currentClassId, currentMonth, isClient]);


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

  const getStudentChecksForDay = (studentId: string, day: Date) => {
    const dateKey = format(day, 'yyyy-MM-dd');
    return monthStudentRecords[dateKey]?.[studentId];
  }
  
  const Legend = () => (
    <div className="px-4 py-3 border-b border-border bg-card">
        <span className="text-xs font-bold text-slate-400 uppercase mb-2 block">Legenda:</span>
        <div className="flex flex-wrap gap-x-4 gap-y-2 items-center">
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
    </div>
  )

  if (!isClient || !currentClass) {
    return null;
  }

  return (
    <div className="text-white bg-background flex-1 flex flex-col" style={{'--class-color': currentClass.color} as React.CSSProperties}>
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                variant="outline"
                className="w-full sm:w-60 justify-between bg-card border-border hover:bg-secondary"
                >
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{backgroundColor: currentClass.color}}/>
                    <span className="truncate">{currentClass.name}</span>
                </div>
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
                    <div className="w-3 h-3 rounded-full mr-2" style={{backgroundColor: c.color}}/>
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

      <div className="flex-1 flex flex-col min-h-0 bg-card border border-border rounded-xl">
          <Legend />
          <div className="overflow-auto rounded-b-xl" ref={reportRef}>
              <table className="w-full border-collapse table-fixed">
                  <thead className="sticky top-0 z-10 bg-card/80 backdrop-blur-sm">
                      <tr>
                          <th className="p-3 border-b border-r border-border text-left text-xs font-bold uppercase text-slate-400 sticky left-0 bg-card/80 z-20 w-1/3 sm:w-48">
                            Aluno
                          </th>
                          {sundaysInMonth.map(day => (
                              <th key={day.toISOString()} className="p-3 text-center border-b border-r border-border last:border-r-0 text-xs font-bold uppercase text-slate-400 w-16">
                                  {format(day, 'dd')}
                              </th>
                          ))}
                      </tr>
                  </thead>
                  <tbody>
                      {currentClass.students.map(student => {
                          return (
                              <tr key={student.id} className="text-sm hover:bg-secondary/50">
                                  <td className="p-2 whitespace-nowrap overflow-hidden text-ellipsis border-b border-r border-border font-medium text-slate-200 sticky left-0 bg-card/50 backdrop-blur-sm z-10">{student.name}</td>
                                  {sundaysInMonth.map(day => {
                                      const studentChecks = getStudentChecksForDay(student.id, day);
                                      return (
                                          <td key={day.toISOString()} className="text-center border-b border-r border-border last:border-r-0 h-full p-2">
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
                                                                      {studentChecks[item] ? <Check size={14} className="text-green-500"/> : <span className="w-[14px] h-[14px] flex items-center justify-center text-slate-500">-</span>}
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
                  <div className="text-center py-16 text-slate-500 rounded-b-xl bg-card">
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

