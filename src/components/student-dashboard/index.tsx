"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { initialClasses, POINTS, CheckType, ClassConfig, DailyLesson, generateFullSimulatedData, SimulatedFullData } from "@/lib/data";
import { AppHeader } from "./app-header";
import { StatCard } from "./stat-card";
import { StudentListHeader, SortKey } from "./student-list-header";
import { StudentRow } from "./student-row";
import { CheckCircle, BookOpen, Pencil, Star, Users, Smile, Notebook, Ban, Trash2 } from "lucide-react";
import { startOfDay, format, parseISO } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";

const calculateAge = (birthDateString: string) => {
    if (!birthDateString) return null;
    const birthDate = new Date(birthDateString);
    birthDate.setUTCHours(12);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

export function StudentDashboard({ initialDate }: { initialDate?: string }) {
  const router = useRouter();
  const [classes, setClasses] = useState<ClassConfig[]>(initialClasses);
  const [currentClassId, setCurrentClassId] = useState<string>(initialClasses[0].id);
  const [currentDate, setCurrentDate] = useState<Date>(() => initialDate ? startOfDay(parseISO(initialDate)) : startOfDay(new Date()));
  const [sortKey, setSortKey] = useState<SortKey>("progress");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [simulatedData, setSimulatedData] = useState<SimulatedFullData>({ lessons: {}, studentRecords: {} });
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [isCancelDialogVali, setIsCancelDialogValid] = useState(true);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");
  
  useEffect(() => {
    setIsClient(true);
    // This check prevents client-side state from being overwritten on navigation
    if (Object.keys(simulatedData.lessons).length === 0) {
      setSimulatedData(generateFullSimulatedData(initialClasses));
    }
  }, []);

  useEffect(() => {
    if (initialDate) {
      const dateFromUrl = parseISO(initialDate);
      setCurrentDate(startOfDay(dateFromUrl));
    } else if (isClient) {
      router.push('/');
    }
  }, [initialDate, isClient, router]);


  const currentClass = useMemo(() => classes.find(c => c.id === currentClassId) || classes[0], [classes, currentClassId]);

  const dateKey = useMemo(() => currentDate ? format(currentDate, "yyyy-MM-dd") : '', [currentDate]);

  const dailyLesson = useMemo(() => {
     if (!isClient || !dateKey || !simulatedData.lessons[dateKey]) {
      return {
        teacherId: currentClass.teachers[0]?.id || "",
        title: "",
        status: 'held',
        cancellationReason: '',
      } as DailyLesson;
    }
    return simulatedData.lessons[dateKey];
  }, [dateKey, simulatedData.lessons, currentClass.teachers, isClient]);
  
  const dailyStudentChecks = useMemo(() => {
    if (!isClient) return {};
    return simulatedData.studentRecords[currentClassId]?.[dateKey] || {};
  }, [simulatedData.studentRecords, currentClassId, dateKey, isClient]);


  const handleToggleCheck = useCallback((studentId: number, type: CheckType) => {
    setSimulatedData(prevData => {
        const newStudentRecords = { ...prevData.studentRecords };
        if (!newStudentRecords[currentClassId]) newStudentRecords[currentClassId] = {};
        if (!newStudentRecords[currentClassId][dateKey]) newStudentRecords[currentClassId][dateKey] = {};

        const currentChecks = newStudentRecords[currentClassId][dateKey]?.[studentId] || { presence: false, task: false, verse: false, behavior: false, material: false };
        const newChecks = { ...currentChecks, [type]: !currentChecks[type] };

        if (type === 'presence' && !newChecks.presence) {
            Object.keys(newChecks).forEach(key => {
                if (key !== 'presence') {
                    newChecks[key as CheckType] = false;
                }
            });
        }
        
        if (!newStudentRecords[currentClassId][dateKey]) {
           newStudentRecords[currentClassId][dateKey] = {};
        }
        newStudentRecords[currentClassId][dateKey][studentId] = newChecks;
        
        return { ...prevData, studentRecords: newStudentRecords };
    });
  }, [currentClassId, dateKey]);

  const handleLessonDetailChange = useCallback((field: keyof DailyLesson, value: string) => {
    setSimulatedData(prev => ({
      ...prev,
      lessons: {
        ...prev.lessons,
        [dateKey]: {
          ...(prev.lessons[dateKey] || { teacherId: currentClass.teachers[0]?.id || "", title: "", status: 'held' }),
          [field]: value,
        }
      }
    }));
  }, [dateKey, currentClass.teachers]);
  
  const handleSundayNavigation = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    const offset = direction === 'next' ? 7 : -7;
    newDate.setDate(newDate.getDate() + offset);
    const newDateKey = format(newDate, 'yyyy-MM-dd');
    router.push(`/dashboard/${newDateKey}`);
  }

  const handleSave = () => {
    if (!currentDate) return;
    
    // Make sure lesson is marked as 'held' when saved, unless it was cancelled.
    if(dailyLesson.status !== 'cancelled') {
        handleLessonDetailChange('status', 'held');
    }

    toast({
      title: "Aula Salva!",
      description: `As informações da aula de ${format(currentDate, "dd/MM/yyyy")} foram salvas com sucesso.`,
    })
  }

  const handleDeleteLesson = () => {
    setSimulatedData(prev => {
        const newLessons = { ...prev.lessons };
        delete newLessons[dateKey];
        
        const newStudentRecords = { ...prev.studentRecords };
        if(newStudentRecords[currentClassId]) {
            delete newStudentRecords[currentClassId][dateKey];
        }

        return { lessons: newLessons, studentRecords: newStudentRecords };
    });
    toast({
      title: "Aula Excluída",
      description: `O registro da aula de ${format(currentDate, "dd/MM/yyyy")} foi removido.`,
      variant: 'destructive',
    })
    setIsDeleteAlertOpen(false);
    router.push('/');
  }
  
  const handleCancelLesson = () => {
      if(!cancellationReason.trim()) {
        setIsCancelDialogValid(false);
        return;
      }
      setIsCancelDialogValid(true);
      setSimulatedData(prev => {
        const updatedLesson: DailyLesson = {
            ...(prev.lessons[dateKey] || { teacherId: currentClass.teachers[0]?.id || "", title: "" }),
            status: 'cancelled',
            cancellationReason: cancellationReason,
        };

        return {
          ...prev,
          lessons: {
            ...prev.lessons,
            [dateKey]: updatedLesson,
          }
        };
      });
      toast({
        title: "Aula cancelada",
        description: "A aula foi marcada como não realizada.",
      })
      setIsCancelDialogOpen(false);
      setCancellationReason("");
  }


  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  }

  const {
    presencePercent,
    versePercent,
    taskPercent,
    behaviorPercent,
    materialPercent,
    totalScore,
    studentsWithScores
  } = useMemo(() => {
    const students = currentClass.students;
    const totalStudents = students.length;

    if (totalStudents === 0 || !isClient) {
      return { presencePercent: 0, versePercent: 0, taskPercent: 0, behaviorPercent: 0, materialPercent: 0, totalScore: 0, studentsWithScores: [] };
    }

    let presenceCount = 0;
    let verseCount = 0;
    let taskCount = 0;
    let behaviorCount = 0;
    let materialCount = 0;
    let totalScore = 0;

    const studentsWithScores = students.map(student => {
      const studentChecks = dailyStudentChecks[student.id] || { presence: false, task: false, verse: false, behavior: false, material: false };

      const dailyScore = Object.entries(studentChecks).reduce((acc, [key, value]) => {
        const checkType = key as CheckType;
        if (value && currentClass.trackedItems[checkType]) {
          return acc + (POINTS[checkType] || 0);
        }
        return acc;
      }, 0);

      if (studentChecks.presence) presenceCount++;
      if (studentChecks.verse) verseCount++;
      if (studentChecks.task) taskCount++;
      if (studentChecks.behavior) behaviorCount++;
      if (studentChecks.material) materialCount++;
      totalScore += dailyScore;
      
      const age = calculateAge(student.birthDate);

      const activeTrackedItems = Object.keys(currentClass.trackedItems).filter(
        key => currentClass.trackedItems[key as CheckType]
      ) as CheckType[];
      
      const checkedItemsCount = activeTrackedItems.filter(
        key => studentChecks[key]
      ).length;

      const completionPercent = activeTrackedItems.length > 0
        ? (checkedItemsCount / activeTrackedItems.length) * 100
        : 0;

      return { ...student, checks: studentChecks, dailyScore, age, completionPercent, checkedItemsCount, totalTrackedItems: activeTrackedItems.length };
    }).sort((a, b) => {
        const dir = sortDirection === 'asc' ? 1 : -1;
        switch (sortKey) {
            case 'progress':
                return (a.completionPercent - b.completionPercent) * dir || (a.dailyScore - b.dailyScore) * dir;
            default:
                 return a.name.localeCompare(b.name) * (sortDirection === 'asc' ? 1 : -1);
        }
    });

    const presentStudentsCount = students.filter(s => (dailyStudentChecks[s.id] || {}).presence).length;

    return {
      presencePercent: totalStudents > 0 ? Math.round((presenceCount / totalStudents) * 100) : 0,
      versePercent: presentStudentsCount > 0 ? Math.round((verseCount / presentStudentsCount) * 100) : 0,
      taskPercent: presentStudentsCount > 0 ? Math.round((taskCount / presentStudentsCount) * 100) : 0,
      behaviorPercent: presentStudentsCount > 0 ? Math.round((behaviorCount / presentStudentsCount) * 100) : 0,
      materialPercent: presentStudentsCount > 0 ? Math.round((materialCount / presentStudentsCount) * 100) : 0,
      totalScore,
      studentsWithScores,
    };
  }, [currentClass, sortKey, sortDirection, dailyStudentChecks, isClient]);

  const trackedItems = currentClass.trackedItems;

  if (!isClient || !initialDate) {
    return null; // or a loading spinner
  }
  
  return (
      <div className="flex flex-1 flex-col">
        <AppHeader 
            currentDate={currentDate}
            onPrevSunday={() => handleSundayNavigation('prev')}
            onNextSunday={() => handleSundayNavigation('next')}
            classes={classes}
            currentClass={currentClass}
            onClassChange={setCurrentClassId}
            dailyLesson={dailyLesson}
            onLessonDetailChange={handleLessonDetailChange}
            onSave={handleSave}
            onOpenDeleteAlert={() => setIsDeleteAlertOpen(true)}
            onOpenCancelDialog={() => setIsCancelDialogOpen(true)}
        />
        <main className="flex-1 p-3 sm:p-4 md:p-6 bg-background">
          <div className="bg-slate-800/50 rounded-t-xl">
             <StudentListHeader 
                trackedItems={trackedItems}
                onSort={handleSort}
                sortKey={sortKey}
                sortDirection={sortDirection}
             />
          </div>
         
          <div className="space-y-px bg-slate-800/50 rounded-b-xl overflow-hidden">
            {studentsWithScores.map(student => (
              <StudentRow
                key={student.id}
                student={student}
                onToggleCheck={handleToggleCheck}
                trackedItems={trackedItems}
              />
            ))}
             {studentsWithScores.length === 0 && (
                <div className="text-center py-16 text-slate-500 bg-slate-800">
                    <Users size={40} className="mx-auto mb-2" />
                    <h3 className="font-bold">Nenhum aluno nesta classe</h3>
                    <p className="text-sm">Vá para as configurações para adicionar alunos.</p>
                </div>
             )}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4 mt-6">
            {trackedItems.presence && <StatCard 
              title="Presença"
              value={`${presencePercent}%`}
              Icon={CheckCircle}
              progress={presencePercent}
              trendText={`${currentClass.students.filter(s => (dailyStudentChecks[s.id] || {}).presence).length}/${currentClass.students.length}`}
              color="blue"
            />}
            {trackedItems.material && <StatCard 
              title="Material"
              value={`${materialPercent}%`}
              Icon={Notebook}
              progress={materialPercent}
              color="pink"
            />}
            {trackedItems.task && <StatCard 
              title="Tarefas"
              value={`${taskPercent}%`}
              Icon={Pencil}
              progress={taskPercent}
              color="purple"
            />}
            {trackedItems.verse && <StatCard 
              title="Versículos"
              value={`${versePercent}%`}
              Icon={BookOpen}
              progress={versePercent}
              color="yellow"
            />}
             {trackedItems.behavior && <StatCard 
              title="Comportamento"
              value={`${behaviorPercent}%`}
              Icon={Smile}
              progress={behaviorPercent}
              color="emerald"
            />}
            <StatCard 
              title="Pontos do Dia"
              value={totalScore.toString()}
              unit="pts"
              Icon={Star}
              progress={(totalScore / (currentClass.students.length * 100))}
              color="indigo"
            />
          </div>
        </main>
        
        <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                <AlertDialogDescription>
                    Esta ação não pode ser desfeita. Todos os registros de presença e pontuação para esta aula serão perdidos permanentemente.
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteLesson} className="bg-destructive hover:bg-destructive/90">Excluir</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

        <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Marcar aula como não realizada</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <Label htmlFor="cancellation-reason">Motivo (Obrigatório)</Label>
                    <Textarea 
                        id="cancellation-reason"
                        value={cancellationReason}
                        onChange={(e) => {
                            setCancellationReason(e.target.value)
                            if (e.target.value.trim()) setIsCancelDialogValid(true);
                        }}
                        placeholder="Ex: Feriado, evento especial na igreja, etc."
                        className={!isCancelDialogValid ? 'border-destructive' : ''}
                    />
                    {!isCancelDialogValid && <p className="text-xs text-destructive">O motivo é obrigatório.</p>}
                </div>
                <div className="flex justify-end gap-2 pt-4">
                    <Button variant="ghost" onClick={() => setIsCancelDialogOpen(false)}>Cancelar</Button>
                    <Button onClick={handleCancelLesson}>Confirmar</Button>
                </div>
            </DialogContent>
        </Dialog>
      </div>
  );
}
