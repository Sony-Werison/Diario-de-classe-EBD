
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  getDay,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Church, Ban, CheckCircle, ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getSimulatedData, DailyLesson, ClassConfig, initialClasses, Teacher } from '@/lib/data';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));
  const [dailyLessons, setDailyLessons] = useState<Record<string, DailyLesson>>({});
  const [isClient, setIsClient] = useState(false);
  const [classes] = useState<ClassConfig[]>(initialClasses);
  const [currentClassId, setCurrentClassId] = useState<string>(initialClasses[0].id);

  const currentClass = useMemo(() => classes.find(c => c.id === currentClassId) || classes[0], [classes, currentClassId]);

  useEffect(() => {
    const data = getSimulatedData();
    setDailyLessons(data.lessons);
    setIsClient(true);
  }, [currentMonth, currentClassId]);
  
  useEffect(() => {
    const handleStorageChange = () => {
      const data = getSimulatedData();
      setDailyLessons(data.lessons);
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);


  const sundays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    return daysInMonth.filter(day => getDay(day) === 0);
  }, [currentMonth]);

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };
  
  const getTeacherName = (teacherId: string, teachers: Teacher[]): string => {
    return teachers.find(t => t.id === teacherId)?.name || "Professor(a) não definido";
  }

  if (!isClient) {
    return null; // Or a loading skeleton
  }

  return (
    <div className="p-4 sm:p-6 text-white bg-background flex-1 flex flex-col">
      <header className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-xl shrink-0">
                <Church size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Calendário de Aulas</h1>
                <p className="text-slate-400">Selecione um domingo para ver os detalhes da aula.</p>
              </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full sm:w-60 justify-between bg-card border-border hover:bg-secondary">
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
      </header>

      <div className="bg-card border border-border rounded-xl flex flex-col flex-1">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold capitalize">
            {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
          </h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={handlePrevMonth}>
              <ChevronLeft size={16} />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleNextMonth}>
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>

        <div className="flex flex-col p-4 gap-3">
          {sundays.map(day => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const lesson = dailyLessons[dateKey];
            const isToday = isSameDay(day, new Date());
            const teacherName = lesson ? getTeacherName(lesson.teacherId, currentClass.teachers) : null;

            return (
                <Link
                    key={day.toString()}
                    href={`/dashboard/${dateKey}`}
                    className={cn(
                        'flex items-center justify-between p-4 rounded-lg transition-colors',
                        'hover:bg-secondary',
                        isToday && 'bg-primary/10 border border-primary/50'
                    )}
                >
                    <div className="flex items-center gap-4 flex-1">
                       <div className="flex flex-col items-center">
                            <span className="text-xs text-slate-400 uppercase">{format(day, "EEE", { locale: ptBR })}</span>
                            <span className={cn('text-2xl font-bold', isToday ? 'text-primary' : 'text-white')}>
                                {format(day, "d")}
                            </span>
                       </div>
                       <div className="flex-1">
                            <span className={cn('font-semibold', isToday ? 'text-primary' : 'text-white')}>
                                {format(day, "d 'de' MMMM", { locale: ptBR })}
                            </span>
                           {lesson && (
                             <div className="text-sm text-slate-400 mt-1 space-y-1">
                                <p className='truncate max-w-xs sm:max-w-sm md:max-w-md'>{lesson.title || "Aula sem título"}</p>
                                <p className="font-medium text-slate-500">{teacherName}</p>
                             </div>
                           )}
                       </div>
                    </div>
                    {lesson && (
                        <div className="ml-4">
                           {lesson.status === 'cancelled' ? (
                                <Ban className="w-5 h-5 text-yellow-500" title="Aula não realizada"/>
                           ) : (
                                <CheckCircle className="w-5 h-5 text-green-500" title="Aula registrada"/>
                           )}
                        </div>
                    )}
                </Link>
             )
          })}
           {sundays.length === 0 && (
                <div className="text-center py-10 text-slate-500">
                  <p>Nenhum domingo neste mês.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
