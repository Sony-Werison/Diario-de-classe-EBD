"use client";

import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { initialClasses, ClassConfig, CheckType } from "@/lib/data";
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
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, CheckCircle, BookOpen, Pencil, Smile, Pen, Users, Dot, Download, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getDaysInMonth, startOfMonth, format, addMonths, subMonths, isSunday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toPng } from 'html-to-image';


const itemIcons: Record<CheckType, React.ElementType> = {
  presence: CheckCircle,
  task: Pencil,
  verse: BookOpen,
  behavior: Smile,
  material: Pen,
};

const itemLabels: Record<CheckType, string> = {
  presence: "Presença",
  task: "Tarefa",
  verse: "Versículo",
  behavior: "Comportamento",
  material: "Material",
};

const itemColors: Record<CheckType, string> = {
  presence: "text-blue-400",
  task: "text-purple-400",
  verse: "text-yellow-400",
  behavior: "text-emerald-400",
  material: "text-pink-400",
};


const generateSimulatedMonthlyData = (students: any[], month: Date, trackedItems: Record<CheckType, boolean>) => {
    const data: Record<number, Record<number, Record<CheckType, boolean>>> = {};

    const daysInMonth = getDaysInMonth(month);

    students.forEach(student => {
        data[student.id] = {};
        for(let day = 1; day <= daysInMonth; day++) {
            const date = new Date(month.getFullYear(), month.getMonth(), day);
            if (!isSunday(date)) continue; // Apenas simula para domingos

            data[student.id][day] = {
                presence: false,
                task: false,
                verse: false,
                behavior: false,
                material: false
            };

            const isPresent = Math.random() > 0.15; // 85% chance of presence
            if (trackedItems.presence && isPresent) {
                 data[student.id][day].presence = true;
            }

            if(isPresent) {
                if (trackedItems.task && Math.random() > 0.3) data[student.id][day].task = true;
                if (trackedItems.verse && Math.random() > 0.6) data[student.id][day].verse = true;
                if (trackedItems.behavior && Math.random() > 0.2) data[student.id][day].behavior = true;
                if (trackedItems.material && Math.random() > 0.25) data[student.id][day].material = true;
            }
        }
    });

    return data;
};


export function MonthlyReport() {
  const [classes] = useState<ClassConfig[]>(initialClasses);
  const [currentClassId, setCurrentClassId] = useState<string>(initialClasses[0].id);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedCriterion, setSelectedCriterion] = useState<CheckType | 'all'>('all');
  const reportRef = useRef<HTMLDivElement>(null);
  const [monthlyData, setMonthlyData] = useState<ReturnType<typeof generateSimulatedMonthlyData>>({});

  const currentClass = useMemo(() => classes.find(c => c.id === currentClassId) || classes[0], [classes, currentClassId]);
  
  useEffect(() => {
    if (!currentClass || currentClass.students.length === 0) {
        setMonthlyData({});
        return;
    };
    const data = generateSimulatedMonthlyData(currentClass.students, currentMonth, currentClass.trackedItems);
    setMonthlyData(data);
  }, [currentClass, currentMonth]);
  
  const daysInMonth = useMemo(() => {
    const days = getDaysInMonth(currentMonth);
    return Array.from({ length: days }, (_, i) => i + 1);
  }, [currentMonth]);

  const sundaysInMonth = useMemo(() => {
      return daysInMonth.filter(day => {
          const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
          return isSunday(date);
      });
  }, [currentMonth, daysInMonth]);

  const handleMonthChange = (direction: 'prev' | 'next') => {
      setCurrentMonth(prev => direction === 'next' ? addMonths(prev, 1) : subMonths(prev, 1));
  }
  
  const trackedItemsList = (Object.keys(itemLabels) as CheckType[]).filter(item => currentClass.trackedItems[item]);

  const handleExport = useCallback(() => {
    if (reportRef.current === null) {
      return;
    }

    toPng(reportRef.current, { cacheBust: true, backgroundColor: '#1e293b' })
      .then((dataUrl) => {
        const link = document.createElement('a');
        const formattedMonth = format(currentMonth, 'yyyy-MM');
        link.download = `relatorio-${currentClass.name.toLowerCase().replace(' ','-')}-${formattedMonth}.png`;
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => {
        console.error('oops, something went wrong!', err);
      });
  }, [reportRef, currentMonth, currentClass.name]);


  return (
    <div className="p-4 sm:p-6 text-white bg-background min-h-screen">
       <header className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
         <div>
            <h1 className="text-2xl font-bold text-slate-100">Relatório Mensal de Aulas</h1>
            <p className="text-slate-400">
            Visualize o registro de avaliações da turma ao longo do mês (dados simulados).
            </p>
         </div>

        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <Select value={currentClassId} onValueChange={setCurrentClassId}>
                <SelectTrigger className="w-full sm:w-36 bg-card border-border hover:bg-secondary">
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

            <Select value={selectedCriterion} onValueChange={(value) => setSelectedCriterion(value as CheckType | 'all')}>
                <SelectTrigger className="w-full sm:w-36 bg-card border-border hover:bg-secondary">
                    <SelectValue placeholder="Selecione o critério" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border text-white">
                    <SelectItem value='all' className="cursor-pointer hover:!bg-secondary focus:!bg-secondary">Todos os critérios</SelectItem>
                    {trackedItemsList.map(item => (
                        <SelectItem key={item} value={item} className="cursor-pointer hover:!bg-secondary focus:!bg-secondary">
                            {itemLabels[item]}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <div className="flex items-center gap-2 bg-card p-1 rounded-lg border border-border w-full sm:w-auto">
                <Button onClick={() => handleMonthChange('prev')} variant='ghost' size="icon" className="h-8 w-8 text-slate-400 hover:bg-secondary hover:text-white"><ChevronLeft size={16}/></Button>
                 <span className="font-semibold text-center w-32 capitalize">{format(currentMonth, 'MMMM yyyy', { locale: ptBR })}</span>
                <Button onClick={() => handleMonthChange('next')} variant='ghost' size="icon" className="h-8 w-8 text-slate-400 hover:bg-secondary hover:text-white"><ChevronRight size={16}/></Button>
            </div>
            
            <Button onClick={handleExport} variant='outline' className='w-full sm:w-auto bg-card border-border'>
                <Download size={16} className="mr-2"/>
                Exportar PNG
            </Button>
        </div>
      </header>

      {currentClass.students.length > 0 ? (
        <Card className="bg-card border-border" ref={reportRef}>
          <CardHeader>
              <CardTitle className='flex items-center justify-between text-base font-semibold'>
                  <span>Frequência da Classe: {currentClass.name}</span>
                   <div className="flex items-center gap-4 text-xs text-slate-400">
                        {trackedItemsList.map(item => {
                            const Icon = itemIcons[item];
                            return <span key={item} className={cn("flex items-center gap-1.5", itemColors[item])}><Icon size={14}/> {itemLabels[item]}</span>
                        })}
                    </div>
              </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border border-border rounded-lg overflow-x-auto">
                <Table className='min-w-[800px]'>
                    <TableHeader>
                        <TableRow className="border-border hover:bg-card">
                            <TableHead className="text-white sticky left-0 bg-card z-10 w-48">Aluno</TableHead>
                            {sundaysInMonth.map(day => (
                                <TableHead key={day} className="text-white text-center font-mono">
                                    {String(day).padStart(2, '0')}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {currentClass.students.map(student => (
                            <TableRow key={student.id} className="border-border hover:bg-secondary/50 group">
                                <TableCell className="font-semibold sticky left-0 bg-card group-hover:bg-secondary/50 z-10">
                                    {student.name}
                                </TableCell>
                                {sundaysInMonth.map(day => (
                                    <TableCell key={day} className="text-center p-1 align-middle">
                                        <div className="flex justify-center items-center gap-0.5">
                                            {monthlyData[student.id] && monthlyData[student.id][day] ? (
                                                selectedCriterion === 'all' ? (
                                                    trackedItemsList.map(item => {
                                                        const isChecked = monthlyData[student.id][day][item];
                                                        const Icon = itemIcons[item];
                                                        return (
                                                            <TooltipProvider key={item} delayDuration={100}>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <span className="w-5 h-5 flex items-center justify-center">
                                                                        {isChecked ? (
                                                                            <Icon size={14} className={cn(itemColors[item])} />
                                                                        ) : (
                                                                            <Dot size={16} className="text-slate-700" />
                                                                        )}
                                                                        </span>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent className='bg-card border-border text-white text-xs'>
                                                                        <p>{itemLabels[item]}: {isChecked ? 'Feito' : 'Não feito'}</p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                        );
                                                    })
                                                ) : (
                                                     (() => {
                                                        const isChecked = monthlyData[student.id][day][selectedCriterion];
                                                        return (
                                                             <TooltipProvider delayDuration={100}>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <span className="w-5 h-5 flex items-center justify-center">
                                                                            {isChecked ? <Check size={16} className="text-green-400" /> : <X size={16} className="text-red-500" />}
                                                                        </span>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent className='bg-card border-border text-white text-xs'>
                                                                        <p>{itemLabels[selectedCriterion]}: {isChecked ? 'Feito' : 'Não feito'}</p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                        )
                                                    })()
                                                )
                                            ) : (
                                                <span className="text-slate-600">-</span>
                                            )}
                                        </div>
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
          </CardContent>
        </Card>
        ) : (
        <div className="text-center py-20 text-slate-500 bg-card mt-6 rounded-lg border border-border">
            <Users size={40} className="mx-auto mb-4" />
            <h3 className="font-bold text-lg text-slate-300">Nenhum aluno cadastrado</h3>
            <p className="text-sm mt-1">Vá para a tela de <a href="/settings" className="text-green-400 underline">Configurações</a> para adicionar alunos a esta classe.</p>
        </div>
       )}
    </div>
  );
}
