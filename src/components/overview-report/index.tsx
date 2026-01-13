

"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { getSimulatedData, ClassConfig, SimulatedFullData, CheckType } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Cake, ArrowUp, ArrowDown, Crown, ChevronLeft, ChevronRight } from 'lucide-react';
import { itemIcons } from '../report-helpers';
import { startOfMonth, format, addMonths, subMonths } from 'date-fns';
import { Progress } from '../ui/progress';
import { Button } from '../ui/button';
import { ptBR } from 'date-fns/locale';

const calculateAge = (birthDateString: string) => {
    if (!birthDateString) return 0;
    const birthDate = new Date(birthDateString);
    birthDate.setUTCHours(12);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
};

const StatItem: React.FC<{ Icon: React.ElementType, label: string, value: string | number, iconColor?: string }> = ({ Icon, label, value, iconColor = 'text-slate-400' }) => (
    <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
            <Icon size={14} className={iconColor} />
            <span className="text-slate-300">{label}</span>
        </div>
        <span className="font-semibold text-white">{value}</span>
    </div>
);

const AgeStat: React.FC<{ Icon: React.ElementType, label: string, studentName: string, age: number }> = ({ Icon, label, studentName, age }) => (
    <div className="flex items-center justify-between text-xs p-1 px-2 bg-slate-800/50 rounded-md">
        <div className="flex items-center gap-1.5">
            <Icon size={12} className="text-slate-400" />
            <span className="text-slate-400">{label}</span>
        </div>
        <div className="text-right">
            <span className="font-semibold text-slate-200 block truncate max-w-[100px]">{studentName}</span>
            <span className="text-slate-400">{age} anos</span>
        </div>
    </div>
);

const calculateStatsForPeriod = (classConfig: ClassConfig, studentRecords: SimulatedFullData['studentRecords'], startDate: Date, endDate: Date) => {
    const students = classConfig.students;
    if (students.length === 0) {
        return {
            attendanceRate: 0,
            criteriaRates: {},
            topStudents: []
        };
    }

    const classRecords = studentRecords[classConfig.id] || {};
    let totalPossibleAttendance = 0;
    let actualAttendance = 0;
    const criteriaCounts = {
        total: {} as Record<CheckType | 'task', number>,
        checked: {} as Record<CheckType | 'task', number>
    };
    
    const studentScores: Record<string, { score: number, count: number }> = {};
    students.forEach(s => studentScores[s.id] = { score: 0, count: 0 });

    for (const dateKey in classRecords) {
        const recordDate = new Date(dateKey);
        recordDate.setUTCHours(12);
        if (recordDate < startDate || recordDate > endDate) continue;

        const dayRecords = classRecords[dateKey];
        totalPossibleAttendance += students.length;

        students.forEach(student => {
            const record = dayRecords[student.id];
            
            let dayScore = 0;
            let dayTotal = 0;

            if (record?.presence) {
                actualAttendance++;
            }
            
            for (const key in classConfig.trackedItems) {
                const item = key as CheckType | 'task';
                if (classConfig.trackedItems[item]) {
                    if (!criteriaCounts.total[item]) criteriaCounts.total[item] = 0;
                    if (!criteriaCounts.checked[item]) criteriaCounts.checked[item] = 0;
                    
                     const isApplicable = (item !== 'presence' && item !== 'task') ? record?.presence : true;
                     if(isApplicable) {
                        dayTotal++;
                     }

                     if (item === 'presence' || item === 'task') {
                         criteriaCounts.total[item]++;
                         if(record?.[item]) {
                            criteriaCounts.checked[item]++;
                            if(isApplicable) dayScore++;
                         }
                     } else if (record?.presence) {
                         criteriaCounts.total[item]++;
                         if(record?.[item]) {
                            criteriaCounts.checked[item]++;
                             if(isApplicable) dayScore++;
                         }
                     }
                }
            }
            if (dayTotal > 0) {
                studentScores[student.id].score += (dayScore / dayTotal);
                studentScores[student.id].count++;
            }
        });
    }

    const attendanceRate = totalPossibleAttendance > 0 ? (actualAttendance / totalPossibleAttendance) * 100 : 0;
    
    const criteriaRates: Record<string, number> = {};
    for (const key in criteriaCounts.total) {
        const item = key as CheckType | 'task';
        const total = criteriaCounts.total[item];
        const checked = criteriaCounts.checked[item];
        criteriaRates[item] = total > 0 ? (checked / total) * 100 : 0;
    }
    
    const topStudents = students.map(student => ({
        name: student.name,
        avgScore: studentScores[student.id].count > 0 ? (studentScores[student.id].score / studentScores[student.id].count) * 100 : 0
    })).sort((a,b) => b.avgScore - a.avgScore).slice(0, 3);

    return {
        attendanceRate,
        criteriaRates,
        topStudents,
    };
};

const calculateClassStats = (classConfig: ClassConfig, studentRecords: SimulatedFullData['studentRecords'], currentMonth: Date) => {
    const students = classConfig.students;
    if (students.length === 0) {
        return {
            totalStudents: 0,
            avgAge: 0,
            minAgeStudent: { name: '-', age: 0 },
            maxAgeStudent: { name: '-', age: 0 },
            monthStats: { attendanceRate: 0, criteriaRates: {}, topStudents: [] },
        };
    }

    const ages = students.map(s => calculateAge(s.birthDate)).filter(age => age > 0);
    const avgAge = ages.length > 0 ? ages.reduce((sum, age) => sum + age, 0) / ages.length : 0;
    
    const sortedByAge = [...students].sort((a, b) => calculateAge(a.birthDate) - calculateAge(b.birthDate));
    const minAgeStudent = sortedByAge[0];
    const maxAgeStudent = sortedByAge[sortedByAge.length - 1];

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
    const monthStats = calculateStatsForPeriod(classConfig, studentRecords, monthStart, monthEnd);

    return {
        totalStudents: students.length,
        avgAge: Math.round(avgAge),
        minAgeStudent: { name: minAgeStudent.name, age: calculateAge(minAgeStudent.birthDate) },
        maxAgeStudent: { name: maxAgeStudent.name, age: calculateAge(maxAgeStudent.birthDate) },
        monthStats,
    };
};

const RateDisplay = ({ rate }: { rate: number }) => (
    <div className="flex items-center gap-2 justify-end">
        <span className="font-semibold text-white w-8 text-right">{rate.toFixed(0)}%</span>
        <Progress value={rate} className="h-1.5 w-10 bg-slate-700" indicatorClassName="bg-primary/50" />
    </div>
);


export function OverviewReport() {
    const [fullData, setFullData] = useState<SimulatedFullData | null>(null);
    const [isClient, setIsClient] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));

    useEffect(() => {
        setIsClient(true);
        const data = getSimulatedData();
        setFullData(data);

        const handleStorageChange = () => {
            const updatedData = getSimulatedData();
            setFullData(updatedData);
        };
        window.addEventListener('storage', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    const classStats = useMemo(() => {
        if (!fullData) return [];
        return fullData.classes.map(c => ({
            ...c,
            stats: calculateClassStats(c, fullData.studentRecords, currentMonth)
        }));
    }, [fullData, currentMonth]);

    const handleMonthChange = (direction: 'prev' | 'next') => {
        setCurrentMonth(prev => direction === 'next' ? addMonths(prev, 1) : subMonths(prev, 1));
    };
    
    if (!isClient || !fullData) return null; // or a loading spinner
    
    const allTrackedItems: (CheckType | 'task')[] = ['presence', 'material', 'inClassTask', 'task', 'verse', 'behavior'];
    
    const rankColors = ["text-yellow-400", "text-slate-300", "text-yellow-600"];

    return (
        <div>
            <div className="flex items-center gap-2 bg-card border border-border px-2 py-1 rounded-md w-full sm:w-auto justify-between mb-6">
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
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {classStats.map(classData => (
                    <Card key={classData.id} className="bg-card border-border flex flex-col" style={{ '--class-color': classData.color } as React.CSSProperties}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3">
                                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: classData.color }} />
                                {classData.name}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 flex-1 flex flex-col">
                            <div className="space-y-2">
                                <StatItem Icon={Users} label="Total de Alunos" value={classData.stats.totalStudents} />
                                <StatItem Icon={Cake} label="Média de Idade" value={`${classData.stats.avgAge} anos`} />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                {classData.stats.totalStudents > 0 ? (
                                    <>
                                        <AgeStat Icon={ArrowDown} label="Mais Novo" studentName={classData.stats.minAgeStudent.name} age={classData.stats.minAgeStudent.age} />
                                        <AgeStat Icon={ArrowUp} label="Mais Velho" studentName={classData.stats.maxAgeStudent.name} age={classData.stats.maxAgeStudent.age} />
                                    </>
                                ) : (
                                    <div className="col-span-2 text-center text-xs text-slate-500 py-2">Sem alunos para calcular idade.</div>
                                )}
                            </div>

                            <div className="space-y-2 pt-2 border-t border-border">
                                <h4 className="text-sm font-semibold text-slate-300">Destaques do Mês</h4>
                                {classData.stats.monthStats.topStudents.length > 0 ? classData.stats.monthStats.topStudents.map((student, index) => (
                                    <div key={student.name} className="grid grid-cols-[auto_1fr_auto] items-center text-sm gap-2">
                                        <div className="flex items-center gap-2">
                                            <Crown size={14} className={rankColors[index]} />
                                            <span className="text-slate-300 truncate max-w-40">{student.name}</span>
                                        </div>
                                        <Progress value={student.avgScore} className="h-1.5 bg-slate-700" indicatorClassName="bg-primary/50" />
                                        <span className="font-semibold text-white w-8 text-right">{student.avgScore.toFixed(0)}%</span>
                                    </div>
                                )) : (
                                    <p className="text-xs text-slate-500 text-center py-2">Sem dados de avaliação no mês.</p>
                                )}
                            </div>
                            
                            <div className="space-y-2 pt-2 border-t border-border mt-auto">
                            <div className="grid grid-cols-[1fr_auto] items-center pt-2 gap-2">
                                    <h4 className="text-sm font-semibold text-slate-300">Médias do Mês</h4>
                                </div>
                            
                            {allTrackedItems.map(itemKey => {
                                    if (!classData.trackedItems[itemKey]) return null;
                                    const Icon = itemIcons[itemKey];
                                    const monthlyRate = (itemKey === 'presence' ? classData.stats.monthStats.attendanceRate : classData.stats.monthStats.criteriaRates[itemKey]) || 0;
                                    
                                    let label = '';
                                    switch(itemKey) {
                                        case 'presence': label = 'Frequência'; break;
                                        case 'task': label = 'Tarefas'; break;
                                        case 'verse': label = 'Versículos'; break;
                                        case 'material': label = 'Material'; break;
                                        case 'inClassTask': label = 'T. em Sala'; break;
                                        case 'behavior': label = 'Comport.'; break;
                                    }

                                    return (
                                        <div key={itemKey} className="grid grid-cols-[1fr_auto] items-center text-sm gap-2">
                                            <div className="flex items-center gap-2">
                                                <Icon size={14} className="text-slate-400" />
                                                <span className="text-slate-300">{label}</span>
                                            </div>
                                            <RateDisplay rate={monthlyRate} />
                                        </div>
                                    )
                            })}
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {classStats.length === 0 && (
                    <div className="md:col-span-2 xl:col-span-3 text-center py-16 text-slate-500">
                        <h3 className="font-bold text-lg">Nenhuma classe encontrada</h3>
                        <p className="text-sm">Vá para a tela de "Ajustes" para criar sua primeira classe.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
