"use client";

import React, { useState, useMemo } from 'react';
import { initialClasses, ClassConfig, POINTS, CheckType } from "@/lib/data";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Crown, Star, Users, Award, Medal } from 'lucide-react';

const itemLabels: Record<CheckType, string> = {
  presence: "Presença",
  task: "Tarefa",
  verse: "Versículo",
  behavior: "Comportamento",
  material: "Material",
};

const studentColors = ['#22c55e', '#3b82f6', '#f97316', '#8b5cf6', '#ec4899'];
const criteriaColors: Record<CheckType, string> = {
  presence: studentColors[0],
  task: studentColors[1],
  verse: studentColors[2],
  behavior: studentColors[3],
  material: studentColors[4],
};


// Função para simular dados históricos
const generateSimulatedHistory = (students: any[], period: 'week' | 'month' | 'year', trackedItems: Record<CheckType, boolean>) => {
    const now = new Date();
    let entriesCount;
    let format;

    switch (period) {
        case 'month':
            entriesCount = 30;
            format = (d: Date) => d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
            break;
        case 'year':
            entriesCount = 12;
            format = (d: Date) => d.toLocaleDateString('pt-BR', { month: 'short' });
            break;
        case 'week':
        default:
            entriesCount = 7;
            format = (d: Date) => d.toLocaleDateString('pt-BR', { weekday: 'short' });
            break;
    }
    
    const history: any[] = [];
    for (let i = entriesCount - 1; i >= 0; i--) {
        const date = new Date(now);
        if(period === 'year') {
            date.setMonth(now.getMonth() - i);
        } else {
            date.setDate(now.getDate() - i);
        }

        const entry: { name: string, [key: string]: any } = {
            name: period === 'year' ? format(date).toUpperCase() : format(date),
        };

        students.forEach(student => {
            let dailyScore = 0;
            (Object.keys(POINTS) as CheckType[]).forEach(key => {
                if (trackedItems[key] && Math.random() > 0.4) { // 60% de chance de pontuar
                    dailyScore += POINTS[key];
                }
            });
            entry[student.name] = (entry[student.name] || 0) + dailyScore;
        });
        history.push(entry);
    }
    
    return history;
};

const aggregateDataForChart = (students: any[], trackedItems: Record<CheckType, boolean>) => {
    return students.map(student => {
        const studentData: {[key: string]: any} = {
            name: student.name.split(' ')[0],
            totalXp: student.totalXp,
        };

        let remainingXp = student.totalXp;
        
        const activeCriteria = (Object.keys(POINTS) as CheckType[]).filter(c => trackedItems[c]);
        const distribution = activeCriteria.reduce((acc, key) => {
            const simulatedPortion = Math.random();
            acc[key] = simulatedPortion;
            return acc;
        }, {} as Record<string, number>);

        const totalPortions = Object.values(distribution).reduce((sum, val) => sum + val, 0);

        activeCriteria.forEach((key, index) => {
            if (index === activeCriteria.length -1) {
                 studentData[key] = remainingXp;
            } else {
                const portion = distribution[key] / totalPortions;
                const xpForCriterion = Math.floor(student.totalXp * portion);
                studentData[key] = xpForCriterion;
                remainingXp -= xpForCriterion;
            }
        });
        
        return studentData;
    });
};


export function RankingsDashboard() {
  const [classes] = useState<ClassConfig[]>(initialClasses);
  const [currentClassId, setCurrentClassId] = useState<string>(initialClasses[0].id);
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');

  const currentClass = useMemo(() => classes.find(c => c.id === currentClassId) || classes[0], [classes, currentClassId]);

  const studentsSortedByXp = useMemo(() => {
    return [...currentClass.students].sort((a, b) => b.totalXp - a.totalXp);
  }, [currentClass]);

  const stackedBarChartData = useMemo(() => {
    return aggregateDataForChart(studentsSortedByXp, currentClass.trackedItems);
  }, [studentsSortedByXp, currentClass.trackedItems]);

  const evolutionData = useMemo(() => {
    return generateSimulatedHistory(currentClass.students, period, currentClass.trackedItems);
  }, [currentClass.students, period, currentClass.trackedItems]);
  
  const studentLineColors = useMemo(() => {
      return studentsSortedByXp.reduce((acc, student, index) => {
          acc[student.name] = studentColors[index % studentColors.length];
          return acc;
      }, {} as Record<string, string>);
  }, [studentsSortedByXp]);
  
  const trackedItemsList = (Object.keys(itemLabels) as CheckType[]).filter(item => currentClass.trackedItems[item]);

  const topStudents = studentsSortedByXp.slice(0, 3);
  const otherStudents = studentsSortedByXp.slice(3);


  return (
    <div className="p-4 sm:p-6 text-white bg-background min-h-screen">
      <header className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
         <div>
            <h1 className="text-2xl font-bold text-slate-100">Dashboard de Desempenho</h1>
            <p className="text-slate-400">
            Analise a pontuação dos alunos e o progresso da turma.
            </p>
         </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Select value={currentClassId} onValueChange={setCurrentClassId}>
            <SelectTrigger className="w-full sm:w-48 bg-card border-border hover:bg-secondary">
                <SelectValue placeholder="Selecione a classe" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border text-white">
                {classes.map(c => (
                <SelectItem key={c.id} value={c.id} className="cursor-pointer hover:!bg-secondary focus:!bg-secondary">
                    {c.name}
                </SelectItem>
                ))}
            </SelectContent>
            </Select>

            <div className="flex gap-1 bg-card p-1 rounded-lg border border-border w-full sm:w-auto">
                <Button onClick={() => setPeriod('week')} variant='ghost' size="sm" className={cn("flex-1 text-xs", period === 'week' ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'text-slate-400 hover:bg-secondary hover:text-white')}>Semana</Button>
                <Button onClick={() => setPeriod('month')} variant='ghost' size="sm" className={cn("flex-1 text-xs", period === 'month' ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'text-slate-400 hover:bg-secondary hover:text-white')}>Mês</Button>
                <Button onClick={() => setPeriod('year')} variant='ghost' size="sm" className={cn("flex-1 text-xs", period === 'year' ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'text-slate-400 hover:bg-secondary hover:text-white')}>Ano</Button>
            </div>
        </div>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {/* Coluna do Ranking */}
        <div className="md:col-span-3 lg:col-span-1 flex flex-col gap-6">
            <Card className="bg-card border-border">
                <CardHeader>
                    <CardTitle className='flex items-center gap-2 text-base font-semibold text-green-400'>
                        <Star size={16} />
                        Ranking da Turma
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-2 text-center">
                        {topStudents[1] && (
                            <div className="flex flex-col items-center">
                                <Medal size={24} className="text-slate-400"/>
                                <p className="font-bold text-sm truncate mt-1">{topStudents[1].name.split(' ')[0]}</p>
                                <p className="text-xs text-slate-400">{topStudents[1].totalXp} XP</p>
                            </div>
                        )}
                         {topStudents[0] && (
                            <div className="flex flex-col items-center order-first sm:order-none">
                                <Crown size={28} className="text-yellow-400"/>
                                <p className="font-bold text-base truncate mt-1">{topStudents[0].name.split(' ')[0]}</p>
                                <p className="text-sm text-yellow-400">{topStudents[0].totalXp} XP</p>
                            </div>
                        )}
                         {topStudents[2] && (
                            <div className="flex flex-col items-center">
                                <Award size={24} className="text-yellow-700"/>
                                <p className="font-bold text-sm truncate mt-1">{topStudents[2].name.split(' ')[0]}</p>
                                <p className="text-xs text-slate-400">{topStudents[2].totalXp} XP</p>
                            </div>
                        )}
                    </div>
                     <div className="space-y-2 pt-4 border-t border-border">
                        {otherStudents.map((student, index) => (
                            <div key={student.id} className="flex items-center gap-3 text-sm">
                               <div className="font-semibold text-slate-500 w-5 text-center">{index + 4}</div>
                               <p className="flex-1 font-medium text-slate-300 truncate">{student.name}</p>
                               <p className="font-bold text-green-400">{student.totalXp} <span className="text-xs text-slate-500">XP</span></p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>

        {/* Coluna dos Gráficos */}
        <div className="md:col-span-3 lg:col-span-3 flex flex-col gap-6">
            <Card className="bg-card border-border">
                 <CardHeader>
                    <CardTitle className="text-base font-semibold">Evolução do XP (Dados Simulados)</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={evolutionData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <defs>
                                <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4}/>
                                <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                            <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false}/>
                            <Tooltip
                                contentStyle={{
                                    background: "hsl(var(--background))",
                                    border: "1px solid hsl(var(--border))",
                                    borderRadius: "0.5rem",
                                    color: "#cbd5e1",
                                    fontSize: '12px'
                                }}
                                cursor={{ stroke: '#22c55e', strokeWidth: 1, strokeDasharray: "3 3" }}
                            />
                            <Legend wrapperStyle={{fontSize: "12px", paddingTop: "10px"}}/>
                            {studentsSortedByXp.slice(0, 3).map(student => (
                                <Area key={student.id} type="monotone" dataKey={student.name} stroke={studentLineColors[student.name] || '#8884d8'} fillOpacity={0} strokeWidth={2} />
                            ))}
                             <Area type="monotone" dataKey={studentsSortedByXp[0]?.name} strokeWidth={2} stroke={studentLineColors[studentsSortedByXp[0]?.name] || '#8884d8'} fill="url(#colorUv)" />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card className="bg-card border-border">
                <CardHeader>
                    <CardTitle className="text-base font-semibold">Composição do XP por Aluno</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={stackedBarChartData} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                             <XAxis type="number" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                             <YAxis type="category" dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} width={60} />
                            <Tooltip
                                cursor={{ fill: 'rgba(34, 197, 94, 0.1)' }}
                                contentStyle={{
                                    background: "hsl(var(--background))",
                                    border: "1px solid hsl(var(--border))",
                                    borderRadius: "0.5rem",
                                    color: "#cbd5e1",
                                    fontSize: '12px'
                                }}
                            />
                             <Legend wrapperStyle={{fontSize: "12px", paddingTop: "10px"}} />
                            {trackedItemsList.map((item, index) => (
                                <Bar key={item} dataKey={item} name={itemLabels[item]} stackId="a" fill={studentColors[index % studentColors.length]} radius={[0, 4, 4, 0]} barSize={12} />
                            ))}
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
      </div>
       {currentClass.students.length === 0 && (
        <div className="text-center py-20 text-slate-500 bg-card mt-6 rounded-lg border border-border">
            <Users size={40} className="mx-auto mb-4" />
            <h3 className="font-bold text-lg text-slate-300">Nenhum aluno cadastrado</h3>
            <p className="text-sm mt-1">Vá para a tela de <a href="/settings" className="text-green-400 underline">Configurações</a> para adicionar alunos a esta classe.</p>
        </div>
      )}
    </div>
  );
}
