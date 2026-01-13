
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
import { ChevronLeft, ChevronRight, Church, Ban, CheckCircle, ChevronDown, Check, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getSimulatedData, DailyLesson, ClassConfig, saveSimulatedData, SimulatedFullData } from '@/lib/data';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));
  const [fullData, setFullData] = useState<SimulatedFullData | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [currentClassId, setCurrentClassId] = useState<string>("");
  const [userRole, setUserRole] = useState<string>('');
  const [currentUser, setCurrentUser] = useState('');

  useEffect(() => {
    setIsClient(true);
    const role = sessionStorage.getItem('userRole') || 'admin';
    setUserRole(role);

    const loadData = async () => {
        const savedData = await getSimulatedData();
        setFullData(savedData);
        
        let availableClasses = savedData.classes;
        let currentUserName = role;
        const teacherId = sessionStorage.getItem('teacherId');
        if (role === 'teacher' && teacherId) {
            availableClasses = savedData.classes.filter(c => c.teachers.some(t => t.id === teacherId));
            const allTeachers = savedData.classes.flatMap(c => c.teachers);
            const teacher = allTeachers.find(t => t.id === teacherId);
            if (teacher) {
                currentUserName = teacher.name;
            }
        }
        setCurrentUser(currentUserName);
        
        if (availableClasses.length > 0 && (!currentClassId || !availableClasses.find(c => c.id === currentClassId))) {
            setCurrentClassId(availableClasses[0].id);
        }
    }

    loadData();
  }, [currentClassId]);
  
  const { classes: allSystemClasses, lessons: allLessons } = fullData || { classes: [], lessons: {} };

  const availableClasses = useMemo(() => {
    if (!userRole || !allSystemClasses) return [];
    if (userRole === 'admin' || userRole === 'viewer') return allSystemClasses;
    if (userRole === 'teacher') {
      const teacherId = sessionStorage.getItem('teacherId');
      return allSystemClasses.filter(c => c.teachers.some(t => t.id === teacherId));
    }
    return [];
  }, [allSystemClasses, userRole]);

  const currentClass = useMemo(() => availableClasses.find(c => c.id === currentClassId), [availableClasses, currentClassId]);

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
  
  const getTeacherName = (teacherId: string, classConfig: ClassConfig): string => {
    if (!classConfig) return "Professor(a) não definido";
    return classConfig.teachers.find(t => t.id === teacherId)?.name || "Professor(a) não definido";
  }

  if (!isClient || !fullData || !currentClass) {
     return (
       <div className="p-4 sm:p-6 text-white flex-1 flex flex-col items-center justify-center">
            {isClient && fullData && availableClasses.length === 0 && userRole === 'teacher' ? (
                <>
                    <User size={48} className="text-slate-500 mb-4" />
                    <h2 className="text-xl font-bold text-slate-300">Nenhuma turma atribuída</h2>
                    <p className="text-slate-500 max-w-sm text-center mt-2">
                        Parece que seu perfil de professor não está associado a nenhuma turma. Por favor, entre em contato com o administrador.
                    </p>
                </>
            ): <div className="text-slate-500">Carregando dados...</div>}
        </div>
     );
  }

  return (
    <div className="p-4 sm:p-6 text-white bg-background flex-1 flex flex-col">
      <header className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-xl shrink-0">
                <Church size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Aulas</h1>
              </div>
          </div>
          <div className='flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto'>
            <div className="flex items-center gap-2 justify-end sm:hidden">
              <User size={12} className="text-slate-400"/>
              <p className="text-xs text-slate-400 font-medium truncate capitalize">
                {currentUser}
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-60 justify-between bg-card border-border hover:bg-card">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{backgroundColor: currentClass.color}}/>
                      <span className="truncate">{currentClass.name}</span>
                    </div>
                  <ChevronDown className="h-4 w-4 shrink-0" />
                  </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] bg-card border-border text-white">
                  {availableClasses.map((c) => (
                  <DropdownMenuItem
                      key={c.id}
                      onSelect={() => setCurrentClassId(c.id)}
                      className="cursor-pointer"
                  >
                      <Check
                      size={16}
                      className={cn(
                          "mr-2",
                          currentClassId === c.id ? "opacity-100" : "opacity-0"
                      )}
                      />
                      <div className="w-3 h-3 rounded-full mr-2" style={{backgroundColor: c.color}}/>
                      {c.name}
                  </DropdownMenuItem>
                  ))}
              </DropdownMenuContent>
              </DropdownMenu>
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
            const lesson = allLessons[currentClass.id]?.[dateKey];
            const isToday = isSameDay(day, new Date());
            const teacherName = lesson ? getTeacherName(lesson.teacherId, currentClass) : null;
            const hasRecord = !!fullData.studentRecords[currentClass.id]?.[dateKey];

            return (
                <Link
                    key={day.toString()}
                    href={`/dashboard/${dateKey}?classId=${currentClass.id}`}
                    className={cn(
                        'flex items-center justify-between p-4 rounded-lg transition-colors',
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
                           {lesson ? (
                             <div className="text-sm text-slate-400 mt-1 space-y-1">
                                <p className='truncate max-w-xs sm:max-w-sm md:max-w-md'>
                                  {lesson.status === 'cancelled' ? (
                                    <span className="text-yellow-400 italic">{lesson.cancellationReason || "Aula não realizada"}</span>
                                  ) : (
                                    <>
                                      <span>{lesson.title || "Aula sem título"}</span>
                                      {teacherName && <span className="ml-2 text-slate-500 font-medium hidden sm:inline">- {teacherName}</span>}
                                    </>
                                  )}
                                </p>
                                {lesson.status !== 'cancelled' && teacherName && (
                                  <p className="font-medium text-slate-500 sm:hidden">{teacherName}</p>
                                )}
                             </div>
                           ) : (
                              <div className="text-sm text-slate-500 mt-1">
                                <p>Nenhuma aula registrada.</p>
                              </div>
                           )}
                       </div>
                    </div>
                    {lesson && (
                        <div className="ml-4">
                           {lesson.status === 'cancelled' ? (
                                <Ban className="w-5 h-5 text-yellow-500" title="Aula não realizada"/>
                           ) : (
                              hasRecord && <CheckCircle className="w-5 h-5 text-green-500" title="Aula registrada"/>
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
