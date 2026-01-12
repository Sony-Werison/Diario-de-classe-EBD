"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { initialStudents, POINTS, Student, CheckType } from "@/lib/data";
import { AppHeader } from "./app-header";
import { StatCard } from "./stat-card";
import { StudentListHeader } from "./student-list-header";
import { StudentRow } from "./student-row";
import { CheckCircle, BookOpen, Pencil, Star } from "lucide-react";

export function StudentDashboard() {
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [currentDate, setCurrentDate] = useState(new Date());

  const handleToggleCheck = useCallback((id: number, type: CheckType) => {
    setStudents(prevStudents =>
      prevStudents.map(student => {
        if (student.id !== id) return student;
        
        const newChecks = { ...student.checks, [type]: !student.checks[type] };

        // Logic for "presence" affecting other checks
        if (type === 'presence' && !newChecks.presence) {
          // If un-checking presence, un-check all other items for that day
          Object.keys(newChecks).forEach(key => {
            if (key !== 'presence') {
              newChecks[key as CheckType] = false;
            }
          });
        }
        
        return { ...student, checks: newChecks };
      })
    );
  }, []);
  
  const handleDateChange = (direction: 'prev' | 'next') => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
    // Here you would typically also fetch the data for the new date
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
    }).sort((a, b) => a.name.localeCompare(b.name));

    const presentStudentsCount = students.filter(s => s.checks.presence).length;

    return {
      presencePercent: Math.round((presenceCount / totalStudents) * 100),
      versePercent: presentStudentsCount > 0 ? Math.round((verseCount / presentStudentsCount) * 100) : 0,
      taskPercent: presentStudentsCount > 0 ? Math.round((taskCount / presentStudentsCount) * 100) : 0,
      totalScore,
      studentsWithScores,
    };
  }, [students]);

  return (
      <div className="flex flex-1 flex-col overflow-hidden">
        <AppHeader 
            currentDate={currentDate}
            onPrevDate={() => handleDateChange('prev')}
            onNextDate={() => handleDateChange('next')}
        />
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 bg-slate-900">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
            <StatCard 
              title="Presença"
              value={`${presencePercent}%`}
              Icon={CheckCircle}
              progress={presencePercent}
              trend="up"
              trendText={`${students.filter(s => s.checks.presence).length}/${students.length}`}
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
              title="Pontuação"
              value={totalScore.toString()}
              unit="pts"
              Icon={Star}
              progress={(totalScore / (students.length * 100))}
              color="emerald"
            />
          </div>

          <div className="bg-slate-800/50 rounded-t-xl overflow-x-auto">
             <StudentListHeader />
          </div>
         
          <div className="space-y-px bg-slate-800/50 rounded-b-xl overflow-hidden overflow-x-auto">
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
  );
}
