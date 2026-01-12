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

import { Check, ChevronDown, ChevronLeft, ChevronRight, Download, Users, Dot, CheckCircle, Notebook, Pencil, BookOpen, Smile } from "lucide-react";
import { initialClasses, ClassConfig, Student, CheckType } from "@/lib/data";
import { cn } from "@/lib/utils";
import { format, getDaysInMonth, startOfMonth, addMonths, subMonths, getDay, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toPng } from 'html-to-image';


type SimulatedDayData = {
    date: Date;
    checks: Record<CheckType, boolean>;
}

type SimulatedStudentData = {
    studentId: number;
    monthData: SimulatedDayData[];
}

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


// Function to generate consistent random data for a student for a specific month
const generateSimulatedDataForStudent = (studentId: number, month: Date, classConfig: ClassConfig): SimulatedStudentData => {
    const daysInMonth = getDaysInMonth(month);
    const monthData: SimulatedDayData[] = [];
    const year = month.getFullYear();
    const monthIndex = month.getMonth();

    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, monthIndex, day);
        // Only generate data for Sundays
        if (getDay(date) === 0) {
            const seed = studentId * day * (monthIndex + 1) * year;
            const random = () => {
                let x = Math.sin(seed + day) * 10000;
                return x - Math.floor(x);
            };

            const checks: Record<CheckType, boolean> = {} as any;
            let isPresent = false;
             if (classConfig.trackedItems.presence) {
                isPresent = random() > 0.2; // 80% chance of presence
                checks.presence = isPresent;
             }

            (Object.keys(itemIcons) as CheckType[]).forEach(key => {
                if (key !== 'presence' && classConfig.trackedItems[key]) {
                   checks[key] = isPresent && random() > 0.4; // 60% chance if present
                }
            });

            monthData.push({ date, checks });
        }
    }
    return { studentId, monthData };
};


export function MonthlyReport() {
  const [classes] = useState<ClassConfig[]>(initialClasses);
  const [currentClassId, setCurrentClassId] = useState<string>(initialClasses[0].id);
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));
  const [simulatedData, setSimulatedData] = useState<SimulatedStudentData[]>([]);
  const [isClient, setIsClient] = useState(false);


  const currentClass = useMemo(
    () => classes.find((c) => c.id === currentClassId) || classes[0],
    [classes, currentClassId]
  );

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
        const data = currentClass.students.map(student => generateSimulatedDataForStudent(student.id, currentMonth, currentClass));
        setSimulatedData(data);
    }
  }, [currentClass, currentMonth, isClient]);


  const reportRef = useRef<HTMLDivElement>(null);

  const handleExportPng = () => {
    if (!reportRef.current) return;
    toPng(reportRef.current, { cacheBust: true, backgroundColor: '#1E293B' })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = `relatorio-${currentClass.name}-${format(currentMonth, 'MM-yyyy')}.png`;
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => {
        console.error('oops, something went wrong!', err);
      });
  };

  const handleMonthChange = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => direction === 'next' ? addMonths(prev, 1) : subMonths(prev, 1));
  }

  const daysInMonth = useMemo(() => {
    const dayCount = getDaysInMonth(currentMonth);
    return Array.from({ length: dayCount }, (_, i) => new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i + 1));
  }, [currentMonth]);
  
  const sundaysInMonth = useMemo(() => daysInMonth.filter(d => getDay(d) === 0), [daysInMonth]);

  const getStudentDataForDay = (studentId: number, day: Date) => {
    const studentData = simulatedData.find(sd => sd.studentId === studentId);
    return studentData?.monthData.find(md => isSameDay(md.date, day));
  }

  return (
    <div className="p-4 sm:p-6 text-white bg-background flex-1">
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

        <Button onClick={handleExportPng} className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
            <Download size={16} className="mr-2" />
            Exportar PNG
        </Button>
      </div>

        <Card className="bg-slate-800 border-slate-700" id="report-table">
            <div ref={reportRef}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <span>Resumo de {format(currentMonth, 'MMMM, yyyy', {locale: ptBR})} - {currentClass.name}</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="overflow-x-auto pb-6">
                    <div className="border border-slate-700 rounded-lg overflow-hidden min-w-[800px]">
                    <div className="grid bg-slate-900/50 font-bold text-xs uppercase text-slate-400" style={{gridTemplateColumns: `minmax(150px, 1.5fr) repeat(${sundaysInMonth.length}, minmax(40px, 1fr))`}}>
                        <div className="p-3 border-r border-slate-700">Aluno</div>
                        {sundaysInMonth.map(day => (
                            <div key={day.toISOString()} className="p-3 text-center border-r border-slate-700 last:border-r-0">
                                {format(day, 'dd')}
                            </div>
                        ))}
                    </div>
                    <div>
                        {currentClass.students.map(student => (
                            <div key={student.id} className="grid items-center border-b border-slate-700 last:border-b-0 text-sm hover:bg-slate-700/50" style={{gridTemplateColumns: `minmax(150px, 1.5fr) repeat(${sundaysInMonth.length}, minmax(40px, 1fr))`}}>
                                <div className="p-2 whitespace-nowrap overflow-hidden text-ellipsis border-r border-slate-700 font-medium text-slate-200">{student.name}</div>
                                {sundaysInMonth.map(day => {
                                    const dayData = getStudentDataForDay(student.id, day);
                                    return (
                                    <div key={day.toISOString()} className="text-center border-r border-slate-700 last:border-r-0 h-full flex items-center justify-center py-2">
                                        {isClient && dayData ? (
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <span className="flex flex-col items-center justify-center gap-1">
                                                        {(Object.keys(itemIcons) as CheckType[]).filter(item => currentClass.trackedItems[item]).map(item => (
                                                            <div key={item}>
                                                                {dayData.checks[item] ? (
                                                                    <Check size={14} className={cn(itemColors[item])} />
                                                                ) : (
                                                                    <Dot size={16} className="text-slate-700" />
                                                                )}
                                                            </div>
                                                        ))}
                                                    </span>
                                                </TooltipTrigger>
                                                <TooltipContent className="bg-slate-900 border-slate-700 text-white">
                                                    <div className="space-y-1">
                                                        {(Object.keys(itemIcons) as CheckType[]).filter(item => currentClass.trackedItems[item]).map(item => (
                                                            <div key={item} className="flex items-center gap-2 text-xs">
                                                                {dayData.checks[item] ? <Check size={14} className="text-green-500"/> : <Dot size={14} className="text-slate-500" />}
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
                                    </div>
                                    )
                                })}
                            </div>
                        ))}
                    </div>
                    </div>
                    {currentClass.students.length === 0 && (
                        <div className="text-center py-16 text-slate-500 rounded-b-xl">
                            <Users size={40} className="mx-auto mb-2" />
                            <h3 className="font-bold">Nenhum aluno nesta classe</h3>
                            <p className="text-sm">Vá para as configurações para adicionar alunos.</p>
                        </div>
                    )}
                </CardContent>
            </div>
        </Card>
    </div>
  );
}
