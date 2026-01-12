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
} from "recharts";
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Crown, Star } from 'lucide-react';

const itemLabels: Record<CheckType, string> = {
  presence: "Presença",
  task: "Tarefa",
  verse: "Versículo",
  behavior: "Comportamento",
  material: "Material",
};

const studentColors = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', '#FFBB28'];
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
    let days;
    let format;
    let entriesCount;

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
                const criteriaKey = `${student.name}_${key}`;
                entry[criteriaKey] = 0;
                if (trackedItems[key] && Math.random() > 0.4) { // 60% de chance de pontuar
                    const score = POINTS[key];
                    dailyScore += score;
                    entry[criteriaKey] = score;
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
        
        // Simula a distribuição de XP entre os critérios
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

  return (
    <div className="p-4 sm:p-6 text-white bg-slate-900 min-h-screen">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Rankings e Desempenho</h1>
        <p className="text-slate-400">
          Analise a pontuação dos alunos e o progresso das turmas.
        </p>
      </header>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <Select value={currentClassId} onValueChange={setCurrentClassId}>
          <SelectTrigger className="w-full sm:w-60 bg-slate-800 border-slate-700">
            <SelectValue placeholder="Selecione a classe" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700 text-white">
            {classes.map(c => (
              <SelectItem key={c.id} value={c.id} className="cursor-pointer hover:!bg-slate-700 focus:!bg-slate-700">
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700">
            <Button onClick={() => setPeriod('week')} variant='ghost' size="sm" className={cn("flex-1", period === 'week' ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'text-slate-400 hover:bg-slate-700 hover:text-white')}>Semana</Button>
            <Button onClick={() => setPeriod('month')} variant='ghost' size="sm" className={cn("flex-1", period === 'month' ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'text-slate-400 hover:bg-slate-700 hover:text-white')}>Mês</Button>
            <Button onClick={() => setPeriod('year')} variant='ghost' size="sm" className={cn("flex-1", period === 'year' ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'text-slate-400 hover:bg-slate-700 hover:text-white')}>Ano</Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Coluna do Ranking */}
        <div className="lg:col-span-2">
            <Card className="bg-slate-800 border-slate-700 h-full">
                 <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                        <Star className="text-yellow-400" />
                        Ranking Geral de XP
                    </CardTitle>
                    <CardDescription>
                        Total de pontos de experiência (XP) por aluno.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {studentsSortedByXp.map((student, index) => (
                            <div key={student.id} className="flex items-center gap-4 p-2 rounded-lg bg-slate-800/50">
                               <div className={cn("w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg",
                                 index === 0 ? "bg-yellow-400 text-slate-900" : 
                                 index === 1 ? "bg-slate-500 text-white" :
                                 index === 2 ? "bg-yellow-800 text-white" : "bg-slate-700 text-slate-300"
                                )}>
                                    {index === 0 ? <Crown size={16} /> : index + 1}
                               </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-slate-200">{student.name}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-lg text-indigo-300">{student.totalXp} <span className="text-xs">XP</span></p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>

        {/* Coluna dos Gráficos */}
        <div className="lg:col-span-3 flex flex-col gap-6">
            <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                    <CardTitle>Composição do XP por Aluno</CardTitle>
                    <CardDescription>
                        Análise de como o XP de cada aluno é distribuído pelos critérios de avaliação.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={stackedBarChartData} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                             <XAxis type="number" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                             <YAxis type="category" dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} width={60} />
                            <Tooltip
                                cursor={{ fill: 'rgba(100, 116, 139, 0.1)' }}
                                contentStyle={{
                                    background: "#1e293b",
                                    border: "1px solid #334155",
                                    borderRadius: "0.5rem",
                                    color: "#cbd5e1"
                                }}
                            />
                             <Legend wrapperStyle={{fontSize: "12px", paddingTop: "10px"}} />
                            {trackedItemsList.map(item => (
                                <Bar key={item} dataKey={item} name={itemLabels[item]} stackId="a" fill={criteriaColors[item]} radius={[4, 4, 0, 0]} />
                            ))}
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
                 <CardHeader>
                    <CardTitle>Evolução do XP (Dados Simulados)</CardTitle>
                    <CardDescription>
                        Acompanhe o ganho de XP dos alunos no período selecionado.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={evolutionData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="name" stroke="#888888" fontSize={12} />
                            <YAxis stroke="#888888" fontSize={12}/>
                            <Tooltip
                                contentStyle={{
                                    background: "#1e293b",
                                    border: "1px solid #334155",
                                    borderRadius: "0.5rem",
                                    color: "#cbd5e1"
                                }}
                            />
                            <Legend wrapperStyle={{fontSize: "12px"}}/>
                            {studentsSortedByXp.slice(0, 5).map(student => ( // Limita a 5 alunos para não poluir o gráfico
                                <Line key={student.id} type="monotone" dataKey={student.name} stroke={studentLineColors[student.name] || '#8884d8'} strokeWidth={2} dot={false} />
                            ))}
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
