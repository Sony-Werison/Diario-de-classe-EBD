"use client";

import React, { useState, useMemo, useCallback } from "react";
import { initialClasses, POINTS, Student, CheckType, ClassConfig } from "@/lib/data";
import { AppHeader } from "./app-header";
import { StatCard } from "./stat-card";
import { StudentListHeader, SortKey } from "./student-list-header";
import { StudentRow } from "./student-row";
import { CheckCircle, BookOpen, Pencil, Star, Users, Smile, Notebook } from "lucide-react";

const calculateAge = (birthDateString: string) => {
    if (!birthDateString) return null;
    const birthDate = new Date(birthDateString);
    // Fix off-by-one error when converting from YYYY-MM-DD string
    birthDate.setUTCHours(12);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

export function StudentDashboard() {
  const [classes, setClasses] = useState<ClassConfig[]>(initialClasses);
  const [currentClassId, setCurrentClassId] = useState<string>(initialClasses[0].id);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const currentClass = useMemo(() => classes.find(c => c.id === currentClassId) || classes[0], [classes, currentClassId]);

  const handleToggleCheck = useCallback((studentId: number, type: CheckType) => {
    setClasses(prevClasses =>
      prevClasses.map(c => {
        if (c.id !== currentClassId) return c;
        
        const newStudents = c.students.map(student => {
          if (student.id !== studentId) return student;
          
          const newChecks = { ...student.checks, [type]: !student.checks[type] };

          if (type === 'presence' && !newChecks.presence) {
            Object.keys(newChecks).forEach(key => {
              if (key !== 'presence') {
                newChecks[key as CheckType] = false;
              }
            });
          }
          return { ...student, checks: newChecks };
        });

        return { ...c, students: newStudents };
      })
    );
  }, [currentClassId]);
  
  const handleDateChange = (direction: 'prev' | 'next') => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  };

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

    if (totalStudents === 0) {
      return { presencePercent: 0, versePercent: 0, taskPercent: 0, behaviorPercent: 0, materialPercent: 0, totalScore: 0, studentsWithScores: [] };
    }

    let presenceCount = 0;
    let verseCount = 0;
    let taskCount = 0;
    let behaviorCount = 0;
    let materialCount = 0;
    let totalScore = 0;

    const studentsWithScores = students.map(student => {
      const dailyScore = Object.entries(student.checks).reduce((acc, [key, value]) => {
        const checkType = key as CheckType;
        if (value && currentClass.trackedItems[checkType]) {
          return acc + (POINTS[checkType] || 0);
        }
        return acc;
      }, 0);

      if (student.checks.presence) presenceCount++;
      if (student.checks.verse) verseCount++;
      if (student.checks.task) taskCount++;
      if (student.checks.behavior) behaviorCount++;
      if (student.checks.material) materialCount++;
      totalScore += dailyScore;
      
      const age = calculateAge(student.birthDate);

      const activeTrackedItems = Object.keys(currentClass.trackedItems).filter(
        key => currentClass.trackedItems[key as CheckType]
      ) as CheckType[];
      
      const checkedItemsCount = activeTrackedItems.filter(
        key => student.checks[key]
      ).length;

      const completionPercent = activeTrackedItems.length > 0
        ? (checkedItemsCount / activeTrackedItems.length) * 100
        : 0;

      return { ...student, dailyScore, age, completionPercent, checkedItemsCount, totalTrackedItems: activeTrackedItems.length };
    }).sort((a, b) => {
        const dir = sortDirection === 'asc' ? 1 : -1;
        switch (sortKey) {
            case 'name':
                return a.name.localeCompare(b.name) * dir;
            case 'age':
                return ((a.age || 0) - (b.age || 0)) * dir;
            case 'progress':
                return (a.completionPercent - b.completionPercent) * dir;
            default:
                return 0;
        }
    });

    const presentStudentsCount = students.filter(s => s.checks.presence).length;

    return {
      presencePercent: totalStudents > 0 ? Math.round((presenceCount / totalStudents) * 100) : 0,
      versePercent: presentStudentsCount > 0 ? Math.round((verseCount / presentStudentsCount) * 100) : 0,
      taskPercent: presentStudentsCount > 0 ? Math.round((taskCount / presentStudentsCount) * 100) : 0,
      behaviorPercent: presentStudentsCount > 0 ? Math.round((behaviorCount / presentStudentsCount) * 100) : 0,
      materialPercent: presentStudentsCount > 0 ? Math.round((materialCount / presentStudentsCount) * 100) : 0,
      totalScore,
      studentsWithScores,
    };
  }, [currentClass, sortKey, sortDirection]);

  const trackedItems = currentClass.trackedItems;

  const getVisibleStats = () => {
    const stats = [];
    if(trackedItems.presence) stats.push('presence');
    if(trackedItems.material) stats.push('material');
    if(trackedItems.task) stats.push('task');
    if(trackedItems.verse) stats.push('verse');
    if(trackedItems.behavior) stats.push('behavior');
    stats.push('totalScore');
    return stats;
  }
  const visibleStats = getVisibleStats();

  return (
      <div className="flex flex-1 flex-col overflow-hidden">
        <AppHeader 
            currentDate={currentDate}
            onPrevDate={() => handleDateChange('prev')}
            onNextDate={() => handleDateChange('next')}
            classes={classes}
            currentClass={currentClass}
            onClassChange={setCurrentClassId}
        />
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 bg-background">
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
              trendText={`${currentClass.students.filter(s => s.checks.presence).length}/${currentClass.students.length}`}
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
