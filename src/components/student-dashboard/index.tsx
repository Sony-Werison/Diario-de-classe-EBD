"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { initialClasses, POINTS, Student, CheckType, ClassConfig, DailyLesson, generateFullSimulatedData, SimulatedFullData } from "@/lib/data";
import { AppHeader } from "./app-header";
import { StatCard } from "./stat-card";
import { StudentListHeader, SortKey } from "./student-list-header";
import { StudentRow } from "./student-row";
import { CheckCircle, BookOpen, Pencil, Star, Users, Smile, Notebook } from "lucide-react";
import { startOfDay, format, parseISO } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';

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
  const [currentDate, setCurrentDate] = useState<Date>(startOfDay(new Date()));
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [simulatedData, setSimulatedData] = useState<SimulatedFullData>({ lessons: {}, studentRecords: {} });
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
    setSimulatedData(generateFullSimulatedData(initialClasses));
    if (initialDate) {
        // Ensure the date is parsed correctly, considering timezone
        const dateFromUrl = parseISO(initialDate);
        setCurrentDate(startOfDay(dateFromUrl));
    } else {
        router.push('/');
    }
  }, [initialDate, router]);

  const currentClass = useMemo(() => classes.find(c => c.id === currentClassId) || classes[0], [classes, currentClassId]);

  const dateKey = useMemo(() => currentDate ? format(currentDate, "yyyy-MM-dd") : '', [currentDate]);

  const dailyLesson = useMemo(() => {
     if (!isClient || !dateKey || !simulatedData.lessons[dateKey]) {
      return {
        teacherId: currentClass.teachers[0]?.id || "",
        title: "",
      };
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

        const currentChecks = newStudentRecords[currentClassId][dateKey][studentId] || { presence: false, task: false, verse: false, behavior: false, material: false };
        const newChecks = { ...currentChecks, [type]: !currentChecks[type] };

        if (type === 'presence' && !newChecks.presence) {
            Object.keys(newChecks).forEach(key => {
                if (key !== 'presence') {
                    newChecks[key as CheckType] = false;
                }
            });
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
          ...(prev.lessons[dateKey] || { teacherId: currentClass.teachers[0]?.id || "", title: "" }),
          [field]: value,
        }
      }
    }));
  }, [dateKey, currentClass.teachers]);
  
  const handleSundayNavigation = (direction: 'prev' | 'next') => {
     setCurrentDate(prevDate => {
      if (!prevDate) return startOfDay(new Date());
      let newDate = new Date(prevDate);
      const offset = direction === 'next' ? 7 : -7;
      newDate.setDate(newDate.getDate() + offset);
      
      const newDateKey = format(newDate, 'yyyy-MM-dd');
      router.push(`/dashboard/${newDateKey}`);
      return newDate;
    });
  }

  const handleSave = () => {
    if (!currentDate) return;
    // Data is already saved in state via handleLessonDetailChange and handleToggleCheck.
    // This function can be used for API calls in the future.
    setSimulatedData(prev => ({...prev})); // Trigger re-render to update dependent components if needed
    toast({
      title: "Aula Salva!",
      description: `As informações da aula de ${format(currentDate, "dd/MM/yyyy")} foram salvas com sucesso.`,
    })
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
            case 'name':
                return a.name.localeCompare(b.name) * dir;
            case 'progress':
                return (a.completionPercent - b.completionPercent) * dir || (a.dailyScore - b.dailyScore) * dir;
            default:
                return 0;
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
      </div>
  );
}
