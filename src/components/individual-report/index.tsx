
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check, ChevronDown, Award, Star, User, TrendingUp } from "lucide-react";
import { initialClasses, ClassConfig, getSimulatedData, SimulatedFullData, POINTS, Student } from "@/lib/data";
import { cn } from "@/lib/utils";
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { itemIcons, itemLabels, CheckType } from "../report-helpers";

export function IndividualReport() {
  const [classes, setClasses] = useState<ClassConfig[]>(initialClasses);
  const [currentClassId, setCurrentClassId] = useState<string>(initialClasses[0].id);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [simulatedData, setSimulatedData] = useState<SimulatedFullData>({ lessons: {}, studentRecords: {} });
  const [isClient, setIsClient] = useState(false);

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

  const studentPerformanceData = useMemo(() => {
    if (!selectedStudentId || !simulatedData.studentRecords[currentClassId]) {
      return { monthlyScores: [], totalPoints: 0, attendanceCount: 0, totalSundays: 0 };
    }

    const records = simulatedData.studentRecords[currentClassId];
    const scoresByMonth: Record<string, number> = {};
    let totalPoints = 0;
    let attendanceCount = 0;
    let totalSundays = 0;

    Object.keys(records).sort().forEach(dateKey => {
        const studentDayRecord = records[dateKey][selectedStudentId];
        const monthKey = format(parseISO(dateKey), "MMM/yy", { locale: ptBR });
        
        if (!scoresByMonth[monthKey]) scoresByMonth[monthKey] = 0;
        
        totalSundays++;
        if (studentDayRecord) {
            if (studentDayRecord.presence) attendanceCount++;
            let dayScore = 0;
            for (const key in studentDayRecord) {
                const checkType = key as CheckType;
                if (studentDayRecord[checkType] && currentClass.trackedItems[checkType]) {
                    dayScore += POINTS[checkType] || 0;
                }
            }
            scoresByMonth[monthKey] += dayScore;
            totalPoints += dayScore;
        }
    });

    const monthlyScores = Object.keys(scoresByMonth).map(month => ({
      month,
      total: scoresByMonth[month],
    })).slice(-6); // Last 6 months

    return { monthlyScores, totalPoints, attendanceCount, totalSundays };
  }, [selectedStudentId, currentClassId, simulatedData, currentClass.trackedItems]);


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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Card className="bg-card border-border">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp size={20} />
                                Desempenho Mensal (Pontos)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="h-64">
                             <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={studentPerformanceData.monthlyScores}>
                                    <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false}/>
                                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        cursor={{ fill: 'hsl(var(--secondary))', radius: 8 }}
                                        contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                                    />
                                    <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
                <div className="space-y-4">
                    <Card className="bg-card border-border">
                         <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-slate-400">Pontuação Total</CardTitle>
                             <Star className="w-4 h-4 text-yellow-400" />
                         </CardHeader>
                         <CardContent>
                             <div className="text-2xl font-bold">{studentPerformanceData.totalPoints}</div>
                             <p className="text-xs text-slate-500">Acumulado em todo o período</p>
                         </CardContent>
                    </Card>
                     <Card className="bg-card border-border">
                         <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-slate-400">Frequência</CardTitle>
                             <Award className="w-4 h-4 text-emerald-400" />
                         </CardHeader>
                         <CardContent>
                             <div className="text-2xl font-bold">
                                {studentPerformanceData.totalSundays > 0 ? Math.round((studentPerformanceData.attendanceCount / studentPerformanceData.totalSundays) * 100) : 0}%
                             </div>
                             <p className="text-xs text-slate-500">{studentPerformanceData.attendanceCount} de {studentPerformanceData.totalSundays} aulas</p>
                         </CardContent>
                    </Card>
                </div>
            </div>
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
