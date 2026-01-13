
import { format, getDaysInMonth, getDay } from "date-fns";

export type CheckType = 'presence' | 'task' | 'verse' | 'behavior' | 'material';

export type Student = {
  id: string;
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
  color: string;
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

export const initialClasses: ClassConfig[] = [
  {
    id: "maternal",
    name: "Maternal",
    color: "hsl(340, 80%, 60%)",
    teachers: [{id: 'teacher-1', name: "Ana"}],
    trackedItems: { presence: true, task: false, verse: false, behavior: false, material: false },
    students: [
      { id: "m-1", name: "Júlia Pereira", birthDate: "2021-03-10", checks: {} as any, totalXp: 50 },
      { id: "m-2", name: "Lucas Almeida", birthDate: "2021-08-22", checks: {} as any, totalXp: 40 },
    ],
  },
  {
    id: "infantil",
    name: "Infantil",
    color: "hsl(45, 90%, 50%)",
    teachers: [{id: 'teacher-2', name: "Maria"}],
    trackedItems: { presence: true, task: true, verse: true, behavior: true, material: false },
    students: [
       { id: "i-1", name: "Sofia Rodrigues", birthDate: "2019-05-15", checks: {} as any, totalXp: 150 },
       { id: "i-2", name: "Davi Santos", birthDate: "2019-11-01", checks: {} as any, totalXp: 180 },
       { id: "i-3", name: "Isabella Costa", birthDate: "2020-02-20", checks: {} as any, totalXp: 160 },
    ],
  },
   {
    id: "juniores",
    name: "Juniores",
    color: "hsl(150, 78%, 35%)",
    teachers: [{id: 'teacher-3', name: "Carlos Andrade"}, {id: 'teacher-4', name: "Daniela Souza"}],
    trackedItems: { presence: true, task: true, verse: false, behavior: true, material: true },
    students: [
      { id: "j-1", name: "Davi Silva", birthDate: "2012-05-10", checks: {} as any, totalXp: 450 },
      { id: "j-2", name: "Ester Gomes", birthDate: "2011-09-22", checks: {} as any, totalXp: 520 },
      { id: "j-3", name: "Samuel Santos", birthDate: "2013-02-15", checks: {} as any, totalXp: 380 },
    ],
  },
   {
    id: "adolescentes",
    name: "Adolescentes",
    color: "hsl(210, 80%, 55%)",
    teachers: [{id: 'teacher-5', name: "Fernando Lima"}],
    trackedItems: { presence: true, task: true, verse: false, behavior: false, material: true },
    students: [
      { id: "a-1", name: "Gabriel Martins", birthDate: "2008-07-12", checks: {} as any, totalXp: 800 },
      { id: "a-2", name: "Laura Fernandes", birthDate: "2009-01-25", checks: {} as any, totalXp: 750 },
    ],
  },
  {
    id: "jovens",
    name: "Jovens",
    color: "hsl(300, 75%, 60%)",
    teachers: [{id: 'teacher-6', name: "Ricardo Borges"}],
    trackedItems: { presence: true, task: true, verse: false, behavior: false, material: false },
    students: [
       { id: "jv-1", name: "Beatriz Alves", birthDate: "2004-10-30", checks: {} as any, totalXp: 1200 },
    ],
  }
];

// --- SIMULATED DATA GENERATION ---
const SIMULATED_DATA_KEY = 'ebd-junior-tracker-data';

export type SimulatedDayData = {
  date: Date;
  checks: Record<CheckType, boolean>;
}

export type SimulatedStudentData = {
  studentId: string;
  monthData: SimulatedDayData[];
}

export type SimulatedFullData = {
  classes: ClassConfig[];
  lessons: Record<string, DailyLesson>;
  studentRecords: Record<string, Record<string, Record<string, Record<CheckType, boolean>>>>; // [classId][dateKey][studentId] -> checks
}

// Function to generate consistent random data for a student for a specific month
export const generateSimulatedDataForStudent = (studentId: string, month: Date, classConfig: ClassConfig): SimulatedStudentData => {
    const daysInMonth = getDaysInMonth(month);
    const monthData: SimulatedDayData[] = [];
    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    const studentSeed = studentId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);

    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, monthIndex, day);
        // Only generate data for Sundays
        if (getDay(date) === 0) {
            const seed = studentSeed * day * (monthIndex + 1) * year;
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

export const generateFullSimulatedData = (classes: ClassConfig[]): Omit<SimulatedFullData, 'classes'> => {
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
                         const randomTeacherIndex = Math.floor(Math.random() * classConfig.teachers.length);
                         const isCancelled = Math.random() < 0.05; // 5% chance of cancellation
                        lessons[dateKey] = {
                            teacherId: classConfig.teachers[randomTeacherIndex]?.id || "",
                            title: `Aula sobre ${["Criação", "Patriarcas", "Êxodo", "Juízes", "Reis"][Math.floor(Math.random()*5)]}`,
                            status: isCancelled ? 'cancelled' : 'held',
                            cancellationReason: isCancelled ? 'Evento especial na igreja' : undefined,
                        };
                    }

                    // Create student record for the day only if the lesson was held
                    if (lessons[dateKey].status === 'held') {
                        if (!studentRecords[classConfig.id][dateKey]) {
                            studentRecords[classConfig.id][dateKey] = {};
                        }
                        studentRecords[classConfig.id][dateKey][student.id] = dayData.checks;
                    }
                });
            });
        });
    }
    return { lessons, studentRecords };
};

// Centralized functions to get and save data from localStorage
export const getSimulatedData = (): SimulatedFullData => {
  if (typeof window === 'undefined') {
    return { classes: initialClasses, lessons: {}, studentRecords: {} };
  }
  try {
    const savedData = localStorage.getItem(SIMULATED_DATA_KEY);
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      // Ensure classes are part of the saved data, if not, add them.
      if (!parsedData.classes) {
        parsedData.classes = initialClasses;
      }
      return parsedData;
    } else {
      const { lessons, studentRecords } = generateFullSimulatedData(initialClasses);
      const newData = { classes: initialClasses, lessons, studentRecords };
      localStorage.setItem(SIMULATED_DATA_KEY, JSON.stringify(newData));
      return newData;
    }
  } catch (error) {
    console.error("Failed to read from localStorage", error);
    // Fallback to generating fresh data if localStorage fails
    const { lessons, studentRecords } = generateFullSimulatedData(initialClasses);
    return { classes: initialClasses, lessons, studentRecords };
  }
};

export const saveSimulatedData = (data: SimulatedFullData) => {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    const dataString = JSON.stringify(data);
    localStorage.setItem(SIMULATED_DATA_KEY, dataString);
    // Dispatch a storage event to notify other tabs/windows
    window.dispatchEvent(new StorageEvent('storage', {
      key: SIMULATED_DATA_KEY,
      newValue: dataString,
    }));
  } catch (error) {
    console.error("Failed to save to localStorage", error);
  }
};
