"use client";

import React, { useState, useMemo, useEffect } from 'react';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  getDay,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Church } from 'lucide-react';
import { cn } from '@/lib/utils';
import { initialClasses, generateFullSimulatedData, SimulatedFullData, DailyLesson } from '@/lib/data';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));
  const [simulatedData, setSimulatedData] = useState<SimulatedFullData>({ lessons: {}, studentRecords: {} });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setSimulatedData(generateFullSimulatedData(initialClasses));
  }, []);

  const days = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const startDate = startOfWeek(monthStart, { locale: ptBR });
    const endDate = endOfWeek(monthEnd, { locale: ptBR });
    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [currentMonth]);
  
  const dailyLessons = useMemo(() => {
    if (!isClient) return {};
    return simulatedData.lessons;
  }, [isClient, simulatedData.lessons]);

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  if (!isClient) {
    return null; // Or a loading skeleton
  }

  const isSunday = (day: Date) => getDay(day) === 0;

  return (
    <div className="p-4 sm:p-6 text-white bg-background flex-1 flex flex-col">
      <header className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-xl shrink-0">
                <Church size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Calendário de Aulas</h1>
                <p className="text-slate-400">Selecione um domingo para ver os detalhes da aula.</p>
              </div>
          </div>
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

        <div className="grid grid-cols-7 text-center text-xs font-bold text-slate-400 border-b border-border">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
            <div key={day} className="py-2">{day}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 flex-1">
          {days.map(day => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const hasLesson = dailyLessons[dateKey] && isSunday(day);
            const isToday = isSameDay(day, new Date());

            const cellContent = (
                <div className="p-2 flex flex-col h-full">
                    <span
                        className={cn(
                        'font-semibold mb-1',
                        isToday && 'bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center'
                        )}
                    >
                        {format(day, 'd')}
                    </span>
                    {hasLesson && (
                        <div className="mt-auto text-left">
                            <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full">
                                Aula registrada
                            </span>
                        </div>
                    )}
                </div>
            );

            if (isSunday(day) && isSameMonth(day, currentMonth)) {
                 return (
                    <Link
                        key={day.toString()}
                        href={`/dashboard/${dateKey}`}
                        className={cn(
                            'relative border-r border-b border-border',
                            !isSameMonth(day, currentMonth) && 'bg-secondary/20 text-slate-500',
                            isSameMonth(day, currentMonth) && 'hover:bg-secondary transition-colors',
                            'h-24 sm:h-32'
                        )}
                    >
                        {cellContent}
                    </Link>
                 )
            }
            
            return (
              <div
                key={day.toString()}
                className={cn(
                  'relative border-r border-b border-border',
                  !isSameMonth(day, currentMonth) && 'bg-secondary/30 text-slate-600',
                   isSunday(day) && 'bg-primary/5',
                   'h-24 sm:h-32'
                )}
              >
               {cellContent}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
