
"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { initialClasses, POINTS, CheckType, ClassConfig, DailyLesson, getSimulatedData, saveSimulatedData } from "@/lib/data";
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
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [isCancelDialogVali, setIsCancelDialogVali] = useState(true);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");
  
  // These states hold the current data for the dashboard
  const [dailyLesson, setDailyLesson] = useState<DailyLesson | undefined>();
  const [dailyStudentChecks, setDailyStudentChecks] = useState<Record<number, Record<CheckType, boolean>>>({});

  const currentClass = useMemo(() => classes.find(c => c.id === currentClassId) || classes[0], [classes, currentClassId]);

  useEffect(() => {
    setIsClient(true);
    // On mount or date change, load data from our central source
    if (initialDate) {
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
        const checks = data.studentRecords[currentClassId]?.[dateKey] || {};

        setDailyLesson(lesson as DailyLesson);
        setDailyStudentChecks(checks);
    } else {
      router.push('/');
    }
  }, [initialDate, currentClass.teachers, currentClassId, router]);


  const dateKey = useMemo(() => currentDate ? format(currentDate, "yyyy-MM-dd") : '', [currentDate]);


  const handleToggleCheck = useCallback((studentId: number, type: CheckType) => {
    setDailyStudentChecks(prevChecks => {
        const newChecksForStudent = { ...(prevChecks[studentId] || { presence: false, task: false, verse: false, behavior: false, material: false }) };
        newChecksForStudent[type] = !newChecksForStudent[type];

        // If un-checking presence, un-check everything else
        if (type === 'presence' && !newChecksForStudent.presence) {
            Object.keys(newChecksForStudent).forEach(key => {
                newChecksForStudent[key as CheckType] = false;
            });
        }
        
        return {
            ...prevChecks,
            [studentId]: newChecksForStudent
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
    router.push(`/dashboard/${newDateKey}`);
  }

  const handleSave = () => {
    if (!currentDate) return;
    
    const data = getSimulatedData();
    
    // Ensure lesson is marked as 'held' unless already cancelled
    const finalLesson = { ...dailyLesson, status: dailyLesson?.status === 'cancelled' ? 'cancelled' : 'held' };

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
    setIsDeleteAlertOpen(false);
    if (!currentDate) return;
  
    // Clear local component state before potentially unmounting
    setDailyLesson(undefined);
    setDailyStudentChecks({});

    // Perform data mutation
    const data = getSimulatedData();
    delete data.lessons[dateKey];
    if (data.studentRecords[currentClassId]) {
      delete data.studentRecords[currentClassId][dateKey];
    }
    saveSimulatedData(data);
  
    // Redirect after mutation
    router.push('/');
    
    toast({
      title: "Aula Excluída",
      description: `O registro da aula de ${format(currentDate, "dd/MM/yyyy")} foi removido.`,
      variant: 'destructive',
    });
  }
  
  const handleCancelLesson = () => {
      if(!cancellationReason.trim()) {
        setIsCancelDialogVali(false);
        return;
      }
      
      const updatedLesson: DailyLesson = {
          ...(dailyLesson || { teacherId: currentClass.teachers[0]?.id || "", title: "" }),
          status: 'cancelled',
          cancellationReason: cancellationReason,
      };

      // Update data source
      const data = getSimulatedData();
      data.lessons[dateKey] = updatedLesson;
      saveSimulatedData(data);
      
      // Update local state immediately for UI feedback
      setDailyLesson(updatedLesson); 
      setIsCancelDialogOpen(false);
      setCancellationReason("");

      toast({
        title: "Aula cancelada",
        description: "A aula foi marcada como não realizada.",
      });
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
            case 'name':
            default:
                 return a.name.localeCompare(b.name) * dir;
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

  if (!isClient || !initialDate || !dailyLesson) {
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
                            if (e.target.value.trim()) setIsCancelDialogVali(true);
                        }}
                        placeholder="Ex: Feriado, evento especial na igreja, etc."
                        className={!isCancelDialogVali ? 'border-destructive' : ''}
                    />
                    {!isCancelDialogVali && <p className="text-xs text-destructive">O motivo é obrigatório.</p>}
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
