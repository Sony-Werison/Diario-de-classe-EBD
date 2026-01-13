
"use client";

import React, { useState, useMemo, useCallback, useEffect, useContext } from "react";
import { POINTS, CheckType, ClassConfig, DailyLesson, saveSimulatedData, StudentChecks, DailyTasks, Teacher, SimulatedFullData } from "@/lib/data";
import { AppHeader } from "./app-header";
import { StatCard } from "./stat-card";
import { StudentListHeader } from "./student-list-header";
import { StudentRow } from "./student-row";
import { CheckCircle, BookOpen, Pencil, Star, Users, Smile, Notebook, Ban, Trash2, ClipboardCheck } from "lucide-react";
import { startOfDay, format, parseISO } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { DataContext } from "@/contexts/DataContext";

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
    inClassTask: false,
    dailyTasks: { mon: false, tue: false, wed: false, thu: false, fri: false, sat: false }
};


export function StudentDashboard({ initialDate, classId: initialClassId }: { initialDate?: string, classId?: string }) {
  const router = useRouter();
  const dataContext = useContext(DataContext);
  const { fullData, updateAndSaveData, isLoading } = dataContext || { fullData: null, updateAndSaveData: () => {}, isLoading: true };

  const [currentClassId, setCurrentClassId] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<Date>(() => initialDate ? startOfDay(parseISO(initialDate)) : startOfDay(new Date()));
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");
  const [userRole, setUserRole] = useState<string>('');
  const [currentUser, setCurrentUser] = useState('');
  const isReadOnly = userRole === 'viewer';
  
  // These states hold the current data for the dashboard
  const [dailyLesson, setDailyLesson] = useState<DailyLesson | undefined>();
  const [dailyStudentChecks, setDailyStudentChecks] = useState<Record<string, StudentChecks>>({});

  const classes = useMemo(() => fullData?.classes || [], [fullData]);

  useEffect(() => {
    setIsClient(true);
    const role = sessionStorage.getItem('userRole') || 'admin';
    setUserRole(role);

    if (fullData) {
        let availableClasses = fullData.classes;
        let currentUserName = role;
        
        const teacherId = sessionStorage.getItem('teacherId');
        if (role === 'teacher' && teacherId) {
            availableClasses = fullData.classes.filter(c => c.teachers.some(t => t.id === teacherId));
            const allTeachers = fullData.classes.flatMap(c => c.teachers);
            const teacher = allTeachers.find(t => t.id === teacherId);
            if (teacher) {
                currentUserName = teacher.name;
            }
        }
        setCurrentUser(currentUserName);

        const resolvedClassId = initialClassId || availableClasses[0]?.id;
        if(resolvedClassId) {
            setCurrentClassId(resolvedClassId);
        }

        if (!initialDate) {
            router.push('/calendar');
        }
    }
  }, [fullData, initialClassId, initialDate, router]);

  const currentClass = useMemo(() => classes.find(c => c.id === currentClassId), [classes, currentClassId]);
  const dateKey = useMemo(() => currentDate ? format(currentDate, "yyyy-MM-dd") : '', [currentDate]);

  useEffect(() => {
    if (fullData && currentClass && dateKey) {
        const lesson = fullData.lessons[currentClassId]?.[dateKey] || {
          teacherId: (sessionStorage.getItem('userRole') === 'teacher' ? sessionStorage.getItem('teacherId') : currentClass.teachers[0]?.id) || "",
          title: "",
          status: 'held',
          cancellationReason: '',
        };
        
        const checks: Record<string, StudentChecks> = {};
        const savedChecks = fullData.studentRecords[currentClassId]?.[dateKey] || {};
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
    }
  }, [fullData, currentClass, dateKey]);


  const handleClassChange = (newClassId: string) => {
    setCurrentClassId(newClassId);
    if (currentDate) {
      const newDateKey = format(currentDate, 'yyyy-MM-dd');
      router.push(`/dashboard/${newDateKey}?classId=${newClassId}`);
    }
  };


  const handleToggleCheck = useCallback((studentId: string, type: CheckType | 'task') => {
    if(isReadOnly) return;
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
  }, [isReadOnly]);

  const handleToggleDailyTask = useCallback((studentId: string, day: keyof DailyTasks) => {
    if(isReadOnly) return;
    setDailyStudentChecks(prevChecks => {
        const newChecksForStudent = { ...(prevChecks[studentId] || defaultChecks) };
        const newDailyTasks = { ...(newChecksForStudent.dailyTasks || {}) };
        (newDailyTasks as any)[day] = !(newDailyTasks as any)[day];

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
  }, [isReadOnly]);

  const handleLessonDetailChange = useCallback((field: keyof DailyLesson, value: string) => {
    if(!currentClass || isReadOnly) return;
    setDailyLesson(prev => ({
      ...(prev || { teacherId: currentClass.teachers[0]?.id || "", title: "", status: 'held', cancellationReason: '' }),
      [field]: value,
    }) as DailyLesson);
  }, [currentClass, isReadOnly]);
  
  const handleSundayNavigation = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    const offset = direction === 'next' ? 7 : -7;
    newDate.setDate(newDate.getDate() + offset);
    const newDateKey = format(newDate, 'yyyy-MM-dd');
    router.push(`/dashboard/${newDateKey}?classId=${currentClassId}`);
  }

  const handleSave = () => {
    if (!currentDate || !currentClass || isReadOnly || !fullData || !updateAndSaveData) return;
    
    updateAndSaveData((prevData: SimulatedFullData) => {
        const dataToSave = JSON.parse(JSON.stringify(prevData)) as SimulatedFullData;
    
        const finalLesson: DailyLesson = { 
            teacherId: dailyLesson?.teacherId || currentClass.teachers[0]?.id || "",
            title: dailyLesson?.title || "",
            status: dailyLesson?.status === 'cancelled' ? 'cancelled' : 'held',
            cancellationReason: dailyLesson?.status === 'cancelled' ? cancellationReason : "",
        };

        if (!dataToSave.lessons[currentClassId]) {
            dataToSave.lessons[currentClassId] = {};
        }
        dataToSave.lessons[currentClassId][dateKey] = finalLesson;

        if (!dataToSave.studentRecords[currentClassId]) {
            dataToSave.studentRecords[currentClassId] = {};
        }
        dataToSave.studentRecords[currentClassId][dateKey] = dailyStudentChecks;
        
        return dataToSave;
    });

    toast({
      title: "Aula Salva!",
      description: `As informações da aula de ${format(currentDate, "dd/MM/yyyy")} foram salvas com sucesso.`,
    })
  }

  const handleDeleteLesson = () => {
    if (!currentDate || !currentClassId || isReadOnly || !fullData || !updateAndSaveData) return;
  
    updateAndSaveData((prevData: SimulatedFullData) => {
        const dataToSave = JSON.parse(JSON.stringify(prevData)) as SimulatedFullData;
        
        if (dataToSave.lessons[currentClassId]) {
        delete dataToSave.lessons[currentClassId][dateKey];
        }
        if (dataToSave.studentRecords[currentClassId]) {
        delete dataToSave.studentRecords[currentClassId][dateKey];
        }
        
        return dataToSave;
    });
    
    setIsDeleteAlertOpen(false);
    router.push(`/calendar?classId=${currentClassId}`);
    
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
      if(!currentClass || isReadOnly || !fullData || !updateAndSaveData) return;
      
      const updatedLesson: DailyLesson = {
          ...(dailyLesson || { teacherId: currentClass.teachers[0]?.id || "", title: "", status: 'held' }),
          status: 'cancelled',
          cancellationReason: cancellationReason,
      };

      setDailyLesson(updatedLesson);

      updateAndSaveData((prevData: SimulatedFullData) => {
          const dataToSave = JSON.parse(JSON.stringify(prevData)) as SimulatedFullData;
          if (!dataToSave.lessons[currentClassId]) {
            dataToSave.lessons[currentClassId] = {};
          }
          dataToSave.lessons[currentClassId][dateKey] = updatedLesson;
          return dataToSave;
      });
      
      setIsCancelDialogOpen(false);
      
      toast({
        title: "Aula cancelada",
        description: "A aula foi marcada como não realizada.",
      });
  }

  const {
    studentsWithScores
  } = useMemo(() => {
    if (!currentClass || !isClient) {
      return { studentsWithScores: [] };
    }

    const students = currentClass.students;

    const studentsWithScores = students.map(student => {
      const studentChecks = dailyStudentChecks[student.id] || defaultChecks;
      const age = calculateAge(student.birthDate);

      const activeTrackedItems = (Object.keys(currentClass.trackedItems) as (CheckType | 'task')[]).filter(
        key => currentClass.trackedItems[key]
      );
      
      const checkedItemsCount = activeTrackedItems.filter(
        key => {
          if ((studentChecks as any)[key]) {
            if (['behavior', 'verse', 'material', 'inClassTask'].includes(key) && !studentChecks.presence) {
                return false;
            }
            return true;
          }
          return false;
        }
      ).length;

      const totalItemsForPercentage = activeTrackedItems.filter(key => {
          if (['behavior', 'verse', 'material', 'inClassTask'].includes(key)) {
            return studentChecks.presence;
          }
          return true;
      }).length;


      const completionPercent = totalItemsForPercentage > 0
        ? (checkedItemsCount / totalItemsForPercentage) * 100
        : 0;

      return { ...student, checks: studentChecks, age, completionPercent, checkedItemsCount, totalTrackedItems: totalItemsForPercentage };
    }).sort((a, b) => {
        return a.name.localeCompare(b.name);
    });

    return {
      studentsWithScores,
    };
  }, [currentClass, dailyStudentChecks, isClient]);

  const {
    presencePercent,
    versePercent,
    taskPercent,
    inClassTaskPercent,
    behaviorPercent,
    materialPercent,
  } = useMemo(() => {
    if (!currentClass || currentClass.students.length === 0 || !isClient) {
        return { presencePercent: 0, versePercent: 0, taskPercent: 0, inClassTaskPercent: 0, behaviorPercent: 0, materialPercent: 0 };
    }
    
    let presenceCount = 0;
    let verseCount = 0;
    let taskCount = 0;
    let inClassTaskCount = 0;
    let behaviorCount = 0;
    let materialCount = 0;

    studentsWithScores.forEach(student => {
        const checks = student.checks;
        if(checks.presence) presenceCount++;
        if(checks.task) taskCount++;
        // These depend on presence
        if(checks.presence) {
            if(checks.verse) verseCount++;
            if(checks.behavior) behaviorCount++;
            if(checks.material) materialCount++;
            if(checks.inClassTask) inClassTaskCount++;
        }
    });

    const presentStudentsCount = studentsWithScores.filter(s => s.checks.presence).length;

    return {
        presencePercent: Math.round((presenceCount / studentsWithScores.length) * 100),
        versePercent: presentStudentsCount > 0 ? Math.round((verseCount / presentStudentsCount) * 100) : 0,
        taskPercent: studentsWithScores.length > 0 ? Math.round((taskCount / studentsWithScores.length) * 100) : 0,
        inClassTaskPercent: presentStudentsCount > 0 ? Math.round((inClassTaskCount / presentStudentsCount) * 100) : 0,
        behaviorPercent: presentStudentsCount > 0 ? Math.round((behaviorCount / presentStudentsCount) * 100) : 0,
        materialPercent: presentStudentsCount > 0 ? Math.round((materialCount / presentStudentsCount) * 100) : 0,
    }
  }, [currentClass, studentsWithScores, isClient]);


  if (isLoading || !isClient || !initialDate || !dailyLesson || !currentClass || !fullData) {
    return <div className="p-4 sm:p-6 text-white flex-1 flex flex-col items-center justify-center"><div className="text-slate-500">Carregando dados...</div></div>;
  }

  const trackedItems = currentClass?.trackedItems;
  
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
            isReadOnly={isReadOnly}
            currentUser={currentUser}
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
                isReadOnly={isReadOnly}
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
             {trackedItems.inClassTask && <StatCard 
              title="T. em Sala"
              value={`${inClassTaskPercent}%`}
              Icon={ClipboardCheck}
              progress={inClassTaskPercent}
              color="indigo"
            />}
            {trackedItems.task && <StatCard 
              title="T. de Casa"
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
          </div>
        </main>
        
        <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                <AlertDialogDescription>
                    Esta ação não pode ser desfeita. Todos os registros de presença e pontuação para esta aula serão perdidos permanentemente para esta classe.
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
                <fieldset disabled={isReadOnly}>
                    <div className="space-y-4">
                        <Label htmlFor="cancellation-reason">Motivo (Obrigatório)</Label>
                        <Textarea 
                            id="cancellation-reason"
                            value={cancellationReason}
                            onChange={(e) => setCancellationReason(e.target.value)}
                            placeholder="Ex: Feriado, evento especial na igreja, etc."
                        />
                    </div>
                    {!isReadOnly && <div className="flex justify-end gap-2 pt-4">
                        <Button variant="ghost" onClick={() => setIsCancelDialogOpen(false)}>Cancelar</Button>
                        <Button onClick={handleConfirmCancelLesson} className="bg-primary text-primary-foreground hover:bg-primary/90">Confirmar</Button>
                    </div>}
                </fieldset>
            </DialogContent>
        </Dialog>
      </div>
  );
}
