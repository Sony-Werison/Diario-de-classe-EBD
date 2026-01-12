"use client";

import React, { useState, useMemo } from 'react';
import { initialClasses, ClassConfig } from "@/lib/data";
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

// Função para simular dados históricos, já que não temos um banco de dados
const generateSimulatedHistory = (students: any[], period: 'week' | 'month' | 'year') => {
    const now = new Date();
    let days;
    let format;

    switch (period) {
        case 'month':
            days = 30;
            format = (d: Date) => d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
            break;
        case 'year':
            days = 12;
            format = (d: Date) => d.toLocaleDateString('pt-BR', { month: 'short' });
            break;
        case 'week':
        default:
            days = 7;
            format = (d: Date) => d.toLocaleDateString('pt-BR', { weekday: 'short' });
            break;
    }

    const history = [];
    for (let i = days - 1; i >= 0; i--) {
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
             // Simula uma pontuação diária aleatória
            const dailyScore = Math.floor(Math.random() * 50) + 10;
            entry[student.name] = (entry[student.name] || 0) + dailyScore;
        });

        history.push(entry);
    }
    
     // Para a visão anual, vamos agrupar os pontos simulados
    if (period === 'year') {
      const monthlyTotals = new Map<string, { name: string, [key: string]: any }>();

      history.forEach(entry => {
        const month = entry.name;
        if (!monthlyTotals.has(month)) {
          monthlyTotals.set(month, { name: month });
        }
        const monthEntry = monthlyTotals.get(month)!;
        students.forEach(student => {
          monthEntry[student.name] = (monthEntry[student.name] || 0) + entry[student.name];
        });
      });
      return Array.from(monthlyTotals.values());
    }

    return history;
};


export function RankingsDashboard() {
  const [classes] = useState<ClassConfig[]>(initialClasses);
  const [currentClassId, setCurrentClassId] = useState<string>(initialClasses[0].id);
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');

  const currentClass = useMemo(() => classes.find(c => c.id === currentClassId) || classes[0], [classes, currentClassId]);

  const studentsSortedByXp = useMemo(() => {
    return [...currentClass.students].sort((a, b) => b.totalXp - a.totalXp);
  }, [currentClass]);

  const chartData = useMemo(() => {
    return studentsSortedByXp.map(student => ({
      name: student.name.split(' ')[0], // Pega só o primeiro nome
      xp: student.totalXp,
    }));
  }, [studentsSortedByXp]);

  const evolutionData = useMemo(() => {
    return generateSimulatedHistory(currentClass.students, period);
  }, [currentClass.students, period]);
  
  const studentColors = useMemo(() => {
      const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', '#FFBB28'];
      return studentsSortedByXp.reduce((acc, student, index) => {
          acc[student.name] = colors[index % colors.length];
          return acc;
      }, {} as Record<string, string>);
  }, [studentsSortedByXp]);


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
                    <CardTitle>XP Total por Aluno</CardTitle>
                    <CardDescription>
                        Comparativo do total de XP entre os alunos da classe.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                            <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip
                                cursor={{ fill: 'rgba(100, 116, 139, 0.1)' }}
                                contentStyle={{
                                    background: "#1e293b",
                                    border: "1px solid #334155",
                                    borderRadius: "0.5rem",
                                    color: "#cbd5e1"
                                }}
                            />
                            <Bar dataKey="xp" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
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
                                <Line key={student.id} type="monotone" dataKey={student.name} stroke={studentColors[student.name] || '#8884d8'} strokeWidth={2} dot={false} />
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
