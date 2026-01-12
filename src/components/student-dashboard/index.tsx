"use client";

import React, { useState, useMemo, useCallback } from "react";
import { initialStudents, POINTS, Student, CheckType } from "@/lib/data";
import { AppHeader } from "./app-header";
import { AppSidebar } from "./app-sidebar";
import { StatCard } from "./stat-card";
import { StudentListHeader } from "./student-list-header";
import { StudentRow } from "./student-row";
import { CheckCircle, BookOpen, Pencil, Star } from "lucide-react";

export function StudentDashboard() {
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [currentDate, setCurrentDate] = useState(new Date());

  const handleToggleCheck = useCallback((id: number, type: CheckType) => {
    setStudents(prevStudents =>
      prevStudents.map(student =>
        student.id === id
          ? { ...student, checks: { ...student.checks, [type]: !student.checks[type] } }
          : student
      )
    );
  }, []);
  
  const handleDateChange = (direction: 'prev' | 'next') => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  };

  const {
    presencePercent,
    versePercent,
    taskPercent,
    totalScore,
    studentsWithScores
  } = useMemo(() => {
    const totalStudents = students.length;
    if (totalStudents === 0) {
      return { presencePercent: 0, versePercent: 0, taskPercent: 0, totalScore: 0, studentsWithScores: [] };
    }

    let presenceCount = 0;
    let verseCount = 0;
    let taskCount = 0;
    let totalScore = 0;

    const studentsWithScores = students.map(student => {
      const dailyScore = Object.entries(student.checks).reduce((acc, [key, value]) => {
        if (value) {
          return acc + (POINTS[key as CheckType] || 0);
        }
        return acc;
      }, 0);

      if (student.checks.presence) presenceCount++;
      if (student.checks.verse) verseCount++;
      if (student.checks.task) taskCount++;
      totalScore += dailyScore;
      
      const currentXp = student.totalXp + dailyScore;
      const level = Math.floor(currentXp / 100);
      const levelXp = currentXp % 100;
      const xpPercent = Math.min((levelXp / 100) * 100, 100);

      return { ...student, dailyScore, level, xpPercent };
    });

    return {
      presencePercent: Math.round((presenceCount / totalStudents) * 100),
      versePercent: Math.round((verseCount / totalStudents) * 100),
      taskPercent: Math.round((taskCount / totalStudents) * 100),
      totalScore,
      studentsWithScores,
    };
  }, [students]);

  return (
    <div className="flex h-screen bg-slate-900 text-slate-200">
      <AppSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AppHeader 
            currentDate={currentDate}
            onPrevDate={() => handleDateChange('prev')}
            onNextDate={() => handleDateChange('next')}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-background">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard 
              title="Presença Hoje"
              value={`${presencePercent}%`}
              Icon={CheckCircle}
              progress={presencePercent}
              trend="up"
              trendText="Alta"
              color="blue"
            />
            <StatCard 
              title="Versículos"
              value={`${versePercent}%`}
              Icon={BookOpen}
              progress={versePercent}
              color="yellow"
            />
            <StatCard 
              title="Tarefas"
              value={`${taskPercent}%`}
              Icon={Pencil}
              progress={taskPercent}
              color="purple"
            />
            <StatCard 
              title="Pontuação Total"
              value={totalScore.toString()}
              unit="pts"
              Icon={Star}
              progress={(totalScore / (students.length * 100))}
              color="emerald"
            />
          </div>

          <div className="bg-slate-800/50 rounded-t-xl">
             <StudentListHeader />
          </div>
         
          <div className="space-y-1 bg-slate-800/50 rounded-b-xl overflow-hidden">
            {studentsWithScores.map(student => (
              <StudentRow
                key={student.id}
                student={student}
                onToggleCheck={handleToggleCheck}
              />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
