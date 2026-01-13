

"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { initialClasses, POINTS, CheckType, ClassConfig, DailyLesson, getSimulatedData, saveSimulatedData, StudentChecks } from "@/lib/data";
import { AppHeader } from "./app-header";
import { StatCard } from "./stat-card";
import { StudentListHeader } from "./student-list-header";
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

const defaultChecks: StudentChecks = {
    presence: false,
    material: false,
    verse: false,
    behavior: false,
    task: false,
    dailyTasks: { mon: false, tue: false, wed: false, thu: false, fri: false, sat: false }
};


export function StudentDashboard({ initialDate, classId: initialClassId }: { initialDate?: string, classId?: string }) {
  const router = useRouter();
  const [classes, setClasses] = useState<ClassConfig[]>(initialClasses);
  const [currentClassId, setCurrentClassId] = useState<string>(initialClassId || initialClasses[0].id);
  const [currentDate, setCurrentDate] = useState<Date>(() => initialDate ? startOfDay(parseISO(initialDate)) : startOfDay(new Date()));
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");
  
  // These states hold the current data for the dashboard
  const [dailyLesson, setDailyLesson] = useState<DailyLesson | undefined>();
  const [dailyStudentChecks, setDailyStudentChecks] = useState<Record<string, StudentChecks>>({});

  const currentClass = useMemo(() => classes.find(c => c.id === currentClassId) || classes[0], [classes, currentClassId]);

  useEffect(() => {
    const data = getSimulatedData();
    setClasses(data.classes);
    if(initialClassId) {
      setCurrentClassId(initialClassId);
    }
    setIsClient(true);
  }, [initialClassId]);

  useEffect(() => {
    // On mount or date change, load data from our central source
    if (initialDate && currentClass) {
        const dateFromUrl = parseISO(initialDate);
        setCurrentDate(startOfDay(dateFromUrl));
        
        const dateKey = format(dateFromUrl, "yyyy-MM-dd");
        const data = getSimulatedData();

        const lesson = data.lessons[dateKey] || {
          teacherId: currentClass.teachers[0]?.id || "",
          title: "",
          status: 'held',
          cancellationReason: '',
        };
        
        const checks: Record<string, StudentChecks> = {};
        const savedChecks = data.studentRecords[currentClassId]?.[dateKey] || {};
        currentClass.students.forEach(student => {
            checks[student.id] = {
                ...defaultChecks,
                ...(savedChecks[student.id] || {}),
                dailyTasks: {
                    ...defaultChecks.dailyTasks,
                    ...(savedChecks[student.id]?.dailyTasks || {})
                }
            };
        });

        setDailyLesson(lesson as DailyLesson);
        setDailyStudentChecks(checks);
        setCancellationReason(lesson.cancellationReason || "");
    } else if (!initialDate) {
      router.push('/calendar');
    }
  }, [initialDate, currentClass, currentClassId, router]);


  const dateKey = useMemo(() => currentDate ? format(currentDate, "yyyy-MM-dd") : '', [currentDate]);

  const handleClassChange = (newClassId: string) => {
    setCurrentClassId(newClassId);
    if (currentDate) {
      const newDateKey = format(currentDate, 'yyyy-MM-dd');
      router.push(`/dashboard/${newDateKey}?classId=${newClassId}`);
    }
  };


  const handleToggleCheck = useCallback((studentId: string, type: CheckType | 'task') => {
    setDailyStudentChecks(prevChecks => {
        const newChecksForStudent = { ...(prevChecks[studentId] || defaultChecks) };
        (newChecksForStudent as any)[type] = !(newChecksForStudent as any)[type];

        // If un-checking presence, un-check everything else except tasks
        if (type === 'presence' && !newChecksForStudent.presence) {
            Object.keys(newChecksForStudent).forEach(key => {
                const checkKey = key as keyof StudentChecks;
                if (checkKey !== 'presence' && checkKey !== 'task' && checkKey !== 'dailyTasks') {
                    (newChecksForStudent as any)[checkKey] = false;
                }
            });
        }
        
        return {
            ...prevChecks,
            [studentId]: newChecksForStudent
        };
    });
  }, []);

  const handleToggleDailyTask = useCallback((studentId: string, day: string) => {
    setDailyStudentChecks(prevChecks => {
        const newChecksForStudent = { ...(prevChecks[studentId] || defaultChecks) };
        const newDailyTasks = { ...(newChecksForStudent.dailyTasks || {}) };
        newDailyTasks[day] = !newDailyTasks[day];

        // Update main task check if 5 or more days are completed
        const completedCount = Object.values(newDailyTasks).filter(v => v).length;
        newChecksForStudent.task = completedCount >= 5;

        return {
            ...prevChecks,
            [studentId]: {
                ...newChecksForStudent,
                dailyTasks: newDailyTasks
            }
        };
    });
  }, []);

  const handleLessonDetailChange = useCallback((field: keyof DailyLesson, value: string) => {
    setDailyLesson(prev => ({
      ...(prev || { teacherId: currentClass.teachers[0]?.id || "", title: "", status: 'held' }),
      [field]: value,
    }) as DailyLesson);
  }, [currentClass.teachers]);
  
  const handleSundayNavigation = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    const offset = direction === 'next' ? 7 : -7;
    newDate.setDate(newDate.getDate() + offset);
    const newDateKey = format(newDate, 'yyyy-MM-dd');
    router.push(`/dashboard/${newDateKey}?classId=${currentClassId}`);
  }

  const handleSave = () => {
    if (!currentDate) return;
    
    const data = getSimulatedData();
    
    const finalLesson = { ...dailyLesson, status: dailyLesson?.status === 'cancelled' ? 'cancelled' : 'held', cancellationReason: dailyLesson?.status === 'cancelled' ? cancellationReason : "" };

    data.lessons[dateKey] = finalLesson as DailyLesson;
    if (!data.studentRecords[currentClassId]) {
        data.studentRecords[currentClassId] = {};
    }
    data.studentRecords[currentClassId][dateKey] = dailyStudentChecks;
    
    saveSimulatedData(data);

    toast({
      title: "Aula Salva!",
      description: `As informações da aula de ${format(currentDate, "dd/MM/yyyy")} foram salvas com sucesso.`,
    })
  }

  const handleDeleteLesson = () => {
    if (!currentDate) return;
  
    const data = getSimulatedData();
    delete data.lessons[dateKey];
    if (data.studentRecords[currentClassId]) {
      delete data.studentRecords[currentClassId][dateKey];
    }
    saveSimulatedData(data);
    
    setIsDeleteAlertOpen(false);
    router.push('/calendar');
    
    toast({
      title: "Aula Excluída",
      description: `O registro da aula de ${format(currentDate, "dd/MM/yyyy")} foi removido.`,
      variant: 'destructive',
    });
  }
  
  const handleConfirmCancelLesson = () => {
      if(!cancellationReason.trim()) {
        toast({ title: "O motivo é obrigatório", variant: "destructive" });
        return;
      }
      
      const updatedLesson: DailyLesson = {
          ...(dailyLesson || { teacherId: currentClass.teachers[0]?.id || "", title: "" }),
          status: 'cancelled',
          cancellationReason: cancellationReason,
      };

      setDailyLesson(updatedLesson);

      const data = getSimulatedData();
      data.lessons[dateKey] = updatedLesson;
      saveSimulatedData(data);
      
      setIsCancelDialogOpen(false);
      
      toast({
        title: "Aula cancelada",
        description: "A aula foi marcada como não realizada.",
      });
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
      const studentChecks = dailyStudentChecks[student.id] || defaultChecks;

      const dailyScore = (Object.keys(POINTS) as (CheckType | 'task')[]).reduce((acc, key) => {
        if ((studentChecks as any)[key] && currentClass.trackedItems[key]) {
           // Behavior, verse, and material points only count if the student is present
          if (['behavior', 'verse', 'material'].includes(key) && !studentChecks.presence) {
            return acc;
          }
          return acc + (POINTS[key] || 0);
        }
        return acc;
      }, 0);

      if (studentChecks.presence) presenceCount++;
      if (studentChecks.verse && studentChecks.presence) verseCount++;
      if (studentChecks.task) taskCount++;
      if (studentChecks.behavior && studentChecks.presence) behaviorCount++;
      if (studentChecks.material && studentChecks.presence) materialCount++;
      totalScore += dailyScore;
      
      const age = calculateAge(student.birthDate);

      const activeTrackedItems = (Object.keys(currentClass.trackedItems) as (CheckType | 'task')[]).filter(
        key => currentClass.trackedItems[key]
      );
      
      const checkedItemsCount = activeTrackedItems.filter(
        key => {
          if ((studentChecks as any)[key]) {
            if (['behavior', 'verse', 'material'].includes(key) && !studentChecks.presence) {
                return false;
            }
            return true;
          }
          return false;
        }
      ).length;

      const totalItemsForPercentage = activeTrackedItems.filter(key => {
          if (['behavior', 'verse', 'material'].includes(key)) {
            return studentChecks.presence;
          }
          return true;
      }).length;


      const completionPercent = totalItemsForPercentage > 0
        ? (checkedItemsCount / totalItemsForPercentage) * 100
        : 0;

      return { ...student, checks: studentChecks, dailyScore, age, completionPercent, checkedItemsCount, totalTrackedItems: totalItemsForPercentage };
    }).sort((a, b) => {
        return a.name.localeCompare(b.name);
    });

    const presentStudentsCount = students.filter(s => (dailyStudentChecks[s.id] || {}).presence).length;
    const totalStudentsForTask = totalStudents;

    return {
      presencePercent: totalStudents > 0 ? Math.round((presenceCount / totalStudents) * 100) : 0,
      versePercent: presentStudentsCount > 0 ? Math.round((verseCount / presentStudentsCount) * 100) : 0,
      taskPercent: totalStudentsForTask > 0 ? Math.round((taskCount / totalStudentsForTask) * 100) : 0,
      behaviorPercent: presentStudentsCount > 0 ? Math.round((behaviorCount / presentStudentsCount) * 100) : 0,
      materialPercent: presentStudentsCount > 0 ? Math.round((materialCount / presentStudentsCount) * 100) : 0,
      totalScore,
      studentsWithScores,
    };
  }, [currentClass, dailyStudentChecks, isClient]);

  const trackedItems = currentClass.trackedItems;

  if (!isClient || !initialDate || !dailyLesson) {
    return null; // or a loading spinner
  }
  
  return (
      <div className="flex flex-1 flex-col" style={{'--class-color': currentClass.color} as React.CSSProperties}>
        <AppHeader 
            currentDate={currentDate}
            onPrevSunday={() => handleSundayNavigation('prev')}
            onNextSunday={() => handleSundayNavigation('next')}
            classes={classes}
            currentClass={currentClass}
            onClassChange={handleClassChange}
            dailyLesson={dailyLesson}
            onLessonDetailChange={handleLessonDetailChange}
            onSave={handleSave}
            onOpenDeleteAlert={() => setIsDeleteAlertOpen(true)}
            onOpenCancelDialog={() => {
                setCancellationReason(dailyLesson?.cancellationReason || "");
                setIsCancelDialogOpen(true);
            }}
        />
        <main className="flex-1 p-3 sm:p-4 md:p-6 bg-background">
          <div className="bg-card rounded-t-xl">
             <StudentListHeader />
          </div>
         
          <div className="space-y-px bg-card rounded-b-xl overflow-hidden">
            {studentsWithScores.map(student => (
              <StudentRow
                key={student.id}
                student={student}
                onToggleCheck={handleToggleCheck}
                onToggleDailyTask={handleToggleDailyTask}
                trackedItems={trackedItems}
                taskMode={currentClass.taskMode}
                isLessonCancelled={dailyLesson.status === 'cancelled'}
              />
            ))}
             {studentsWithScores.length === 0 && (
                <div className="text-center py-16 text-slate-500 bg-card">
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
              color="custom"
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
                        onChange={(e) => setCancellationReason(e.target.value)}
                        placeholder="Ex: Feriado, evento especial na igreja, etc."
                    />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                    <Button variant="ghost" onClick={() => setIsCancelDialogOpen(false)}>Cancelar</Button>
                    <Button onClick={handleConfirmCancelLesson} className="bg-primary text-primary-foreground hover:bg-primary/90">Confirmar</Button>
                </div>
            </DialogContent>
        </Dialog>
      </div>
  );
}
