
import { format, getDaysInMonth, getDay } from "date-fns";

export type CheckType = 'presence' | 'verse' | 'behavior' | 'material' | 'inClassTask';
export type TaskMode = 'unique' | 'daily';

// For daily tasks, the key is a 3-letter day abbreviation (e.g., 'mon', 'tue')
export type DailyTasks = Record<string, boolean>;

export type StudentChecks = Record<CheckType, boolean> & {
    task: boolean; 
    dailyTasks: DailyTasks;
};

export type Student = {
  id: string;
  name: string;
  birthDate: string; // YYYY-MM-DD
  checks: StudentChecks;
  totalXp: number;
};

export type Teacher = {
  id: string;
  name: string;
}

export type DailyLesson = {
  teacherId: string;
  title: string;
  status: 'held' | 'cancelled';
  cancellationReason?: string;
}

export type ClassConfig = {
  id: string;
  name: string;
  color: string;
  teachers: Teacher[];
  trackedItems: Record<CheckType | 'task', boolean>;
  taskMode: TaskMode;
  students: Student[];
};

export const POINTS: Record<CheckType | 'task', number> = {
    presence: 10,
    task: 20,
    inClassTask: 15,
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
    trackedItems: { presence: true, task: false, verse: false, behavior: false, material: false, inClassTask: false },
    taskMode: 'unique',
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
    trackedItems: { presence: true, task: true, verse: true, behavior: true, material: false, inClassTask: true },
    taskMode: 'unique',
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
    trackedItems: { presence: true, task: true, verse: false, behavior: true, material: true, inClassTask: true },
    taskMode: 'unique',
    students: [
      { id: "j-1", name: "Davi Silva", birthDate: "2012-05-10", checks: {} as any, totalXp: 450 },
      { id: "j-2", name: "Ester Gomes", birthDate: "2011-09-22", checks: {} as any, totalXp: 520 },
      { id: "j-3", name: "Samuel Santos", birthDate: "2013-02-15", checks: {} as any, totalXp: 380 },
      { id: "j-4", name: "Livia Oliveira", birthDate: "2012-11-30", checks: {} as any, totalXp: 410 },
      { id: "j-5", name: "Pedro Lima", birthDate: "2011-06-05", checks: {} as any, totalXp: 490 },
    ],
  },
   {
    id: "adolescentes",
    name: "Adolescentes",
    color: "hsl(210, 80%, 55%)",
    teachers: [{id: 'teacher-5', name: "Fernando Lima"}],
    trackedItems: { presence: true, task: true, verse: false, behavior: false, material: true, inClassTask: true },
    taskMode: 'daily',
    students: [
      { id: "a-1", name: "Gabriel Martins", birthDate: "2008-07-12", checks: {} as any, totalXp: 800 },
      { id: "a-2", name: "Laura Fernandes", birthDate: "2009-01-25", checks: {} as any, totalXp: 750 },
      { id: "a-3", name: "Matheus Ferreira", birthDate: "2008-09-18", checks: {} as any, totalXp: 780 },
    ],
  },
  {
    id: "jovens",
    name: "Jovens",
    color: "hsl(300, 75%, 60%)",
    teachers: [{id: 'teacher-6', name: "Ricardo Borges"}],
    trackedItems: { presence: true, task: true, verse: false, behavior: false, material: false, inClassTask: true },
    taskMode: 'daily',
    students: [
       { id: "jv-1", name: "Beatriz Alves", birthDate: "2004-10-30", checks: {} as any, totalXp: 1200 },
       { id: "jv-2", name: "Thiago Mendes", birthDate: "2003-12-05", checks: {} as any, totalXp: 1100 },
    ],
  }
];

// --- SIMULATED DATA GENERATION ---
const SIMULATED_DATA_KEY = 'ebd-junior-tracker-data-v2';

export type SimulatedDayData = {
  date: Date;
  checks: StudentChecks;
}

export type SimulatedStudentData = {
  studentId: string;
  monthData: SimulatedDayData[];
}

export type SimulatedFullData = {
  classes: ClassConfig[];
  lessons: Record<string, Record<string, DailyLesson>>; // [classId][dateKey] -> lesson
  studentRecords: Record<string, Record<string, Record<string, StudentChecks>>>; // [classId][dateKey][studentId] -> checks
}

// Function to generate consistent random data for a student for a specific month
export const generateSimulatedDataForStudent = (studentId: string, month: Date, classConfig: ClassConfig): SimulatedDayData[] => {
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
            let sineSeed = Math.sin(seed) * 10000;
            const random = () => {
                sineSeed += 1;
                let x = Math.sin(sineSeed) * 10000;
                return x - Math.floor(x);
            };

            const checks: StudentChecks = { presence: false, verse: false, behavior: false, material: false, task: false, inClassTask: false, dailyTasks: {} };
            
            const allItems: (CheckType | 'task')[] = ['presence', 'material', 'task', 'verse', 'behavior', 'inClassTask'];
            
            let isPresent = false;
             if (classConfig.trackedItems.presence) {
                isPresent = random() > 0.2; // 80% chance of presence
                checks.presence = isPresent;
             }

            allItems.forEach(key => {
                if (key !== 'presence' && classConfig.trackedItems[key]) {
                    if (key === 'task') {
                        if (classConfig.taskMode === 'unique') {
                            checks.task = random() > 0.4; // not dependent on presence
                        } else {
                            checks.dailyTasks = {
                                mon: random() > 0.3,
                                tue: random() > 0.3,
                                wed: random() > 0.3,
                                thu: random() > 0.3,
                                fri: random() > 0.3,
                                sat: random() > 0.3,
                            };
                            const completedCount = Object.values(checks.dailyTasks).filter(v => v).length;
                            checks.task = completedCount >= 5;
                        }
                    } else {
                       (checks as any)[key] = isPresent && random() > 0.4; // 60% chance if present
                    }
                } else if (!classConfig.trackedItems[key]) {
                   if (key === 'task') {
                     checks.task = false;
                     checks.dailyTasks = {};
                   } else {
                    (checks as any)[key] = false;
                   }
                }
            });

            monthData.push({ date, checks });
        }
    }
    return monthData;
};

export const generateFullSimulatedData = (classes: ClassConfig[]): Omit<SimulatedFullData, 'classes'> => {
    const lessons: SimulatedFullData['lessons'] = {};
    const studentRecords: SimulatedFullData['studentRecords'] = {};
    const today = new Date();
    
    // Generate for a wider range of months to ensure data consistency
    for (let monthOffset = -12; monthOffset <= 12; monthOffset++) {
        const month = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
        
        classes.forEach(classConfig => {
            if (!studentRecords[classConfig.id]) {
                studentRecords[classConfig.id] = {};
            }
             if (!lessons[classConfig.id]) {
                lessons[classConfig.id] = {};
            }

            classConfig.students.forEach(student => {
                const studentMonthlyData = generateSimulatedDataForStudent(student.id, month, classConfig);
                
                studentMonthlyData.forEach(dayData => {
                    const dateKey = format(dayData.date, "yyyy-MM-dd");
                    
                    if (!lessons[classConfig.id][dateKey]) {
                         const randomTeacherIndex = Math.floor(Math.random() * classConfig.teachers.length);
                         const isCancelled = Math.random() < 0.05; // 5% chance of cancellation
                        lessons[classConfig.id][dateKey] = {
                            teacherId: classConfig.teachers[randomTeacherIndex]?.id || "",
                            title: `Aula sobre ${["Criação", "Patriarcas", "Êxodo", "Juízes", "Reis"][Math.floor(Math.random()*5)]}`,
                            status: isCancelled ? 'cancelled' : 'held',
                            cancellationReason: isCancelled ? 'Evento especial na igreja' : undefined,
                        };
                    }
                    
                    if (lessons[classConfig.id][dateKey].status === 'held') {
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
      const parsedData: SimulatedFullData = JSON.parse(savedData);
      
      let needsUpdate = false;
      if (!parsedData.classes || parsedData.classes.length === 0) {
        parsedData.classes = initialClasses;
        needsUpdate = true;
      }
      
      // Migration: Ensure lesson structure is per-class
      const firstKey = Object.keys(parsedData.lessons)[0];
      if (firstKey && typeof (parsedData.lessons as any)[firstKey].teacherId === 'string') {
          // This is the old structure, needs migration
          needsUpdate = true;
      }

      parsedData.classes.forEach((c: ClassConfig) => {
        if (c.taskMode === undefined) {
          c.taskMode = c.id === 'adolescentes' || c.id === 'jovens' ? 'daily' : 'unique';
          needsUpdate = true;
        }
        if (c.trackedItems.inClassTask === undefined) {
            c.trackedItems.inClassTask = c.id !== 'maternal';
            needsUpdate = true;
        }
      });
      
      if(needsUpdate) {
        const { lessons, studentRecords } = generateFullSimulatedData(parsedData.classes);
        const newData = { classes: parsedData.classes, lessons, studentRecords };
        localStorage.setItem(SIMULATED_DATA_KEY, JSON.stringify(newData));
        return newData;
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

    