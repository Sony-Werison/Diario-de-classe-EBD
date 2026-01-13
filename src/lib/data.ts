import { format, getDaysInMonth, getDay } from "date-fns";

export type CheckType = 'presence' | 'task' | 'verse' | 'behavior' | 'material';

export type Student = {
  id: number;
  name: string;
  birthDate: string; // YYYY-MM-DD
  checks: Record<CheckType, boolean>;
  totalXp: number;
};

export type Teacher = {
  id: string;
  name: string;
}

export type DailyLesson = {
  teacherId: string;
  title: string;
  status?: 'held' | 'cancelled';
  cancellationReason?: string;
}

export type ClassConfig = {
  id: string;
  name: string;
  teachers: Teacher[];
  trackedItems: Record<CheckType, boolean>;
  students: Student[];
};

export const POINTS: Record<CheckType, number> = {
    presence: 10,
    task: 20,
    verse: 40,
    behavior: 15,
    material: 15
};

const initialStudents: Student[] = [
    { id: 1, name: "Davi Silva", birthDate: "2012-05-10", checks: { presence: false, task: false, verse: false, behavior: false, material: false }, totalXp: 450 },
    { id: 2, name: "Ester Gomes", birthDate: "2011-09-22", checks: { presence: false, task: false, verse: false, behavior: false, material: false }, totalXp: 520 },
    { id: 3, name: "Samuel Santos", birthDate: "2013-02-15", checks: { presence: false, task: false, verse: false, behavior: false, material: false }, totalXp: 380 },
    { id: 4, name: "Rebeca Lima", birthDate: "2012-11-30", checks: { presence: false, task: false, verse: false, behavior: false, material: false }, totalXp: 600 },
    { id: 5, name: "João Pedro", birthDate: "2014-07-18", checks: { presence: false, task: false, verse: false, behavior: false, material: false }, totalXp: 210 },
    { id: 6, name: "Lia Oliveira", birthDate: "2011-03-05", checks: { presence: false, task: false, verse: false, behavior: false, material: false }, totalXp: 490 },
    { id: 7, name: "Lucas Melo", birthDate: "2013-10-01", checks: { presence: false, task: false, verse: false, behavior: false, material: false }, totalXp: 310 },
];

export const initialClasses: ClassConfig[] = [
  {
    id: "juniors-2",
    name: "Júniors 2",
    teachers: [{id: 'teacher-1', name: "Prof. Carlos"}, {id: 'teacher-2', name: "Profª. Daniela"}],
    trackedItems: {
      presence: true,
      task: true,
      verse: true,
      behavior: true,
      material: true,
    },
    students: initialStudents,
  },
    {
    id: "primarios-1",
    name: "Primários 1",
    teachers: [{id: 'teacher-3', name: "Profª. Ana"}],
    trackedItems: {
      presence: true,
      task: true,
      verse: false,
      behavior: true,
      material: false,
    },
    students: [
      { id: 8, name: "Ana Clara", birthDate: "2015-01-20", checks: { presence: false, task: false, verse: false, behavior: false, material: false }, totalXp: 150 },
      { id: 9, name: "Miguel Costa", birthDate: "2016-04-12", checks: { presence: false, task: false, verse: false, behavior: false, material: false }, totalXp: 220 },
    ],
  }
];

// --- SIMULATED DATA GENERATION ---

export type SimulatedDayData = {
  date: Date;
  checks: Record<CheckType, boolean>;
}

export type SimulatedStudentData = {
  studentId: number;
  monthData: SimulatedDayData[];
}

export type SimulatedFullData = {
  lessons: Record<string, DailyLesson>;
  studentRecords: Record<string, Record<string, Record<number, Record<CheckType, boolean>>>>; // [classId][dateKey][studentId] -> checks
}

// Function to generate consistent random data for a student for a specific month
export const generateSimulatedDataForStudent = (studentId: number, month: Date, classConfig: ClassConfig): SimulatedStudentData => {
    const daysInMonth = getDaysInMonth(month);
    const monthData: SimulatedDayData[] = [];
    const year = month.getFullYear();
    const monthIndex = month.getMonth();

    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, monthIndex, day);
        // Only generate data for Sundays
        if (getDay(date) === 0) {
            const seed = studentId * day * (monthIndex + 1) * year;
            const random = () => {
                let x = Math.sin(seed + day) * 10000;
                return x - Math.floor(x);
            };

            const checks: Record<CheckType, boolean> = {} as any;
            
            const orderedVisibleItems: CheckType[] = ['presence', 'material', 'task', 'verse', 'behavior'].filter(
                item => classConfig.trackedItems[item as CheckType]
            ) as CheckType[];
            
            let isPresent = false;
             if (classConfig.trackedItems.presence) {
                isPresent = random() > 0.2; // 80% chance of presence
                checks.presence = isPresent;
             }


            orderedVisibleItems.forEach(key => {
                if (key !== 'presence' && classConfig.trackedItems[key]) {
                   checks[key] = isPresent && random() > 0.4; // 60% chance if present
                } else if (!classConfig.trackedItems[key]) {
                   checks[key] = false;
                }
            });

            monthData.push({ date, checks });
        }
    }
    return { studentId, monthData };
};

let memoizedData: SimulatedFullData | null = null;

export const generateFullSimulatedData = (classes: ClassConfig[]): SimulatedFullData => {
    if (memoizedData) {
        return memoizedData;
    }

    const lessons: Record<string, DailyLesson> = {};
    const studentRecords: SimulatedFullData['studentRecords'] = {};

    const today = new Date();
    
    // Generate for a wider range of months to ensure data consistency
    for (let monthOffset = -12; monthOffset <= 12; monthOffset++) {
        const month = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
        
        classes.forEach(classConfig => {
            if (!studentRecords[classConfig.id]) {
                studentRecords[classConfig.id] = {};
            }

            classConfig.students.forEach(student => {
                const studentMonthlyData = generateSimulatedDataForStudent(student.id, month, classConfig);
                
                studentMonthlyData.monthData.forEach(dayData => {
                    const dateKey = format(dayData.date, "yyyy-MM-dd");
                    
                    // Create lesson if it doesn't exist
                    if (!lessons[dateKey]) {
                        lessons[dateKey] = {
                            teacherId: classConfig.teachers[Math.floor(Math.random() * classConfig.teachers.length)]?.id || "",
                            title: `Aula sobre ${["Criação", "Patriarcas", "Êxodo", "Juízes", "Reis"][Math.floor(Math.random()*5)]}`,
                            status: 'held',
                        };
                    }

                    // Create student record for the day
                    if (!studentRecords[classConfig.id][dateKey]) {
                        studentRecords[classConfig.id][dateKey] = {};
                    }
                    studentRecords[classConfig.id][dateKey][student.id] = dayData.checks;
                });
            });
        });
    }
    memoizedData = { lessons, studentRecords };
    return memoizedData;
};
