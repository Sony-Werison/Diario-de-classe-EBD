
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
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { itemLabels } from "../report-helpers";

type PerformanceMetric = {
  name: string;
  student: number;
  class: number;
};

export function IndividualReport() {
  const [classes] = useState<ClassConfig[]>(initialClasses);
  const [currentClassId, setCurrentClassId] = useState<string>(initialClasses[0].id);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
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
           const classPresenceAvg = totalSundays > 0 ? (classCheckCounts[key] / (totalSundays * currentClass.students.length)) * 100 : 0;
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
    <div className="text-white bg-background flex-1 flex flex-col">
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full sm:w-60 justify-between bg-card border-border hover:bg-secondary">
                        <span className="truncate">{currentClass.name}</span>
                        <ChevronDown className="h-4 w-4 shrink-0" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-full sm:w-60 bg-card border-border text-white">
                        {classes.map((c) => (
                        <DropdownMenuItem key={c.id} onSelect={() => setCurrentClassId(c.id)} className="cursor-pointer hover:bg-secondary focus:bg-secondary">
                            <Check size={16} className={cn("mr-2", currentClassId === c.id ? "opacity-100" : "opacity-0")} />
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
                            Desempenho Mensal (%)
                        </div>
                        <div className="text-sm font-semibold capitalize">
                            {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent className="h-96">
                        <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={performanceData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} interval={0} />
                            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} unit="%" />
                            <Tooltip
                                cursor={{ fill: 'hsl(var(--secondary))', radius: 8 }}
                                contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                                formatter={(value: number) => `${value}%`}
                            />
                            <Legend wrapperStyle={{fontSize: "0.8rem"}} />
                            <Bar dataKey="student" name={selectedStudent.name} fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="class" name="Média da Turma" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
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
