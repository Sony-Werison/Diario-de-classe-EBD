
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check, ChevronDown, User, TrendingUp } from "lucide-react";
import { initialClasses, ClassConfig, getSimulatedData, SimulatedFullData, CheckType } from "@/lib/data";
import { cn } from "@/lib/utils";
import { format, parseISO, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { itemLabels, itemIcons } from "../report-helpers";
import { Progress } from '../ui/progress';


type PerformanceMetric = {
  name: string;
  student: number;
  class: number;
};

export function IndividualReport() {
  const [classes] = useState<ClassConfig[]>(initialClasses);
  const [currentClassId, setCurrentClassId] = useState<string>(initialClasses[0].id);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [simulatedData, setSimulatedData] = useState<SimulatedFullData>({ lessons: {}, studentRecords: {} });
  const [isClient, setIsClient] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));

  const currentClass = useMemo(() => classes.find((c) => c.id === currentClassId) || classes[0], [classes, currentClassId]);
  const selectedStudent = useMemo(() => currentClass.students.find(s => s.id === selectedStudentId), [currentClass.students, selectedStudentId]);

  useEffect(() => {
    setIsClient(true);
    const data = getSimulatedData();
    setSimulatedData(data);
    if (currentClass.students.length > 0) {
      setSelectedStudentId(currentClass.students[0].id);
    }
  }, []);

  useEffect(() => {
    setSelectedStudentId(currentClass.students[0]?.id || null);
  }, [currentClassId, currentClass.students]);
  
  const handleMonthChange = (direction: 'prev' | 'next') => {
      const newMonth = direction === 'next' ? new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)) : new Date(currentMonth.setMonth(currentMonth.getMonth() - 1));
      setCurrentMonth(newMonth);
  }

  const performanceData = useMemo((): PerformanceMetric[] => {
    if (!selectedStudentId || !simulatedData.studentRecords[currentClassId] || !isClient) {
      return [];
    }

    const classRecords = simulatedData.studentRecords[currentClassId];
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    
    const sundaysInMonth: string[] = [];
    const studentCheckCounts: Record<CheckType, number> = { presence: 0, material: 0, task: 0, verse: 0, behavior: 0 };
    const classCheckCounts: Record<CheckType, number> = { presence: 0, material: 0, task: 0, verse: 0, behavior: 0 };
    
    // Find all Sundays in the month with records
    Object.keys(classRecords).forEach(dateKey => {
      const recordDate = parseISO(dateKey);
      if (recordDate >= monthStart && recordDate <= monthEnd && recordDate.getDay() === 0) {
        sundaysInMonth.push(dateKey);
      }
    });

    const totalSundays = sundaysInMonth.length;
    if (totalSundays === 0) return [];
    
    let totalClassAttendances = 0;
    
    // Aggregate class data first
    currentClass.students.forEach(student => {
        let studentAttended = false;
        sundaysInMonth.forEach(dateKey => {
            const dayRecord = classRecords[dateKey]?.[student.id];
            if(dayRecord?.presence) {
                studentAttended = true;
            }
        });
        if(studentAttended) totalClassAttendances++;
    });

    // Aggregate checks for student and class
    sundaysInMonth.forEach(dateKey => {
      // Student Data
      const studentDayRecord = classRecords[dateKey]?.[selectedStudentId];
      if (studentDayRecord) {
        for (const key in studentDayRecord) {
          if (studentDayRecord[key as CheckType]) {
            studentCheckCounts[key as CheckType]++;
          }
        }
      }
      
      // Class Data
      currentClass.students.forEach(student => {
        const classStudentDayRecord = classRecords[dateKey]?.[student.id];
        if (classStudentDayRecord) {
          for (const key in classStudentDayRecord) {
            if (classStudentDayRecord[key as CheckType]) {
              classCheckCounts[key as CheckType]++;
            }
          }
        }
      });
    });

    const studentAttendanceCount = studentCheckCounts.presence;

    const metrics: PerformanceMetric[] = [];

    (Object.keys(itemLabels) as CheckType[]).forEach(key => {
      if(currentClass.trackedItems[key]) {
        const studentAvg = studentAttendanceCount > 0 ? (studentCheckCounts[key] / studentAttendanceCount) * 100 : 0;
        const classTotalChecks = classCheckCounts[key];
        const classTotalPresences = classCheckCounts.presence;
        const classAvg = classTotalPresences > 0 ? (classTotalChecks / classTotalPresences) * 100 : 0;
        
        // For presence, the average is out of total sundays, not attendances
        if (key === 'presence') {
           const studentPresenceAvg = totalSundays > 0 ? (studentCheckCounts[key] / totalSundays) * 100 : 0;
           const classPresenceAvg = totalSundays > 0 && currentClass.students.length > 0
             ? (classCheckCounts[key] / (totalSundays * currentClass.students.length)) * 100
             : 0;
            metrics.push({
                name: itemLabels[key],
                student: Math.round(studentPresenceAvg),
                class: Math.round(classPresenceAvg),
            });
        } else {
             metrics.push({
                name: itemLabels[key],
                student: Math.round(studentAvg),
                class: Math.round(classAvg),
            });
        }
      }
    });

    return metrics;
  }, [selectedStudentId, currentClass, simulatedData, currentMonth, isClient]);


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
        </div>

        {selectedStudent ? (
            <Card className="bg-card border-border">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 justify-between">
                        <div className='flex items-center gap-2'>
                            <TrendingUp size={20} />
                            Desempenho Mensal
                        </div>
                        <div className="text-sm font-semibold capitalize">
                            {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {performanceData.map(metric => {
                      const Icon = itemIcons[Object.keys(itemLabels).find(key => itemLabels[key as CheckType] === metric.name) as CheckType];
                      return (
                        <div key={metric.name} className="bg-slate-800/50 rounded-lg p-4">
                          <div className="flex items-center gap-3 mb-4">
                             <Icon size={18} className="text-[var(--class-color)]"/>
                             <h4 className="font-bold text-slate-200">{metric.name}</h4>
                          </div>

                          <div className="space-y-3">
                              <div>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-xs text-slate-300 font-medium">{selectedStudent.name}</span>
                                    <span className="text-sm font-bold text-white">{metric.student}%</span>
                                </div>
                                <Progress value={metric.student} indicatorClassName="bg-[var(--class-color)]" className="h-2"/>
                              </div>
                               <div>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-xs text-slate-400 font-medium">Média da Turma</span>
                                    <span className="text-sm font-bold text-slate-300">{metric.class}%</span>
                                </div>
                                <Progress value={metric.class} indicatorClassName="bg-accent" className="h-2"/>
                              </div>
                          </div>
                        </div>
                      )
                  })}
                </CardContent>
            </Card>
        ) : (
             <div className="flex-1 flex items-center justify-center bg-card border border-border rounded-xl">
                <div className="text-center text-slate-500">
                    <User size={40} className="mx-auto mb-2" />
                    <h3 className="font-bold">Nenhum aluno selecionado</h3>
                    <p className="text-sm">Selecione uma classe e um aluno para ver o relatório.</p>
                </div>
            </div>
        )}
    </div>
  );
}

    