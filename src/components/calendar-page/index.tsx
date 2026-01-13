"use client";

import React, { useState, useMemo, useEffect } from 'react';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  getDay,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Church, CalendarCheck, CheckCircle, Ban } from 'lucide-react';
import { cn } from '@/lib/utils';
import { initialClasses, generateFullSimulatedData, SimulatedFullData } from '@/lib/data';
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

  const sundays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    return daysInMonth.filter(day => getDay(day) === 0);
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

        <div className="flex flex-col p-4 gap-3">
          {sundays.map(day => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const lesson = dailyLessons[dateKey];
            const isToday = isSameDay(day, new Date());

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
                    <div className="flex items-center gap-4">
                       <CalendarCheck className={cn("w-6 h-6", isToday ? "text-primary" : "text-slate-500")} />
                       <div>
                            <span className={cn('font-semibold', isToday ? 'text-primary' : 'text-white')}>
                                {format(day, 'd \'de\' MMMM', { locale: ptBR })}
                            </span>
                            <span className="text-sm text-slate-400 ml-2">
                                (Domingo)
                            </span>
                       </div>
                    </div>
                    {lesson && (
                        <div className="text-right">
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
