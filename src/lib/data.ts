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

export type SimulatedFullData = {
  classes: ClassConfig[];
  lessons: Record<string, Record<string, DailyLesson>>; // [classId][dateKey] -> lesson
  studentRecords: Record<string, Record<string, Record<string, StudentChecks>>>; // [classId][dateKey][studentId] -> checks
}

export const getInitialData = (): SimulatedFullData => {
  return { classes: initialClasses, lessons: {}, studentRecords: {} };
}


// Centralized functions to get and save data from the API
export const getSimulatedData = async (): Promise<SimulatedFullData> => {
  if (typeof window === 'undefined') {
    return getInitialData();
  }
  try {
    const response = await fetch('/api/data');
    if (!response.ok) {
        if (response.status === 404) {
            console.log("No data found in blob storage, returning initial data.");
            return getInitialData();
        }
        throw new Error(`Failed to fetch data: ${response.statusText}`);
    }
    const data: SimulatedFullData = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch from API", error);
    return getInitialData();
  }
};

export const saveSimulatedData = async (data: SimulatedFullData): Promise<void> => {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    const response = await fetch('/api/data', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error(`Failed to save data: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Failed to save to API", error);
  }
};
