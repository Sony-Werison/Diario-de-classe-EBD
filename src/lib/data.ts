
import { format, getDaysInMonth, getDay } from "date-fns";

export type CheckType = 'presence' | 'verse' | 'behavior' | 'material' | 'inClassTask';
export type TaskMode = 'unique' | 'daily';

export type DailyTasks = Record<string, boolean>;

export type StudentChecks = Record<CheckType, boolean> & {
    task: boolean; 
    dailyTasks: DailyTasks;
};

export type Student = {
  id: string;
  name: string;
  birthDate: string; // YYYY-MM-DD
  photoUrl: string;
  checks: StudentChecks;
  totalXp: number;
};

export type Teacher = {
  id: string;
  name: string;
  photoUrl: string;
}

export type Passwords = {
  admin: string;
  teacher: string;
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
    id: "class-1",
    name: "Primários",
    color: "hsl(150, 78%, 35%)",
    teachers: [
      { id: 'teacher-1', name: 'Tia Joana', photoUrl: '' },
      { id: 'teacher-2', name: 'Tio Pedro', photoUrl: '' }
    ],
    trackedItems: { presence: true, material: true, inClassTask: true, task: true, verse: true, behavior: true },
    taskMode: 'daily',
    students: [
      { id: 'student-1', name: 'Alice', birthDate: '2016-05-10', photoUrl: '', totalXp: 0, checks: { presence: false, material: false, inClassTask: false, verse: false, behavior: false, task: false, dailyTasks: {} } },
      { id: 'student-2', name: 'Bruno', birthDate: '2015-08-22', photoUrl: '', totalXp: 0, checks: { presence: false, material: false, inClassTask: false, verse: false, behavior: false, task: false, dailyTasks: {} } },
    ]
  },
  {
    id: "class-2",
    name: "Juniores",
    color: "hsl(210, 80%, 55%)",
    teachers: [
      { id: 'teacher-3', name: 'Irmã Maria', photoUrl: '' }
    ],
    trackedItems: { presence: true, material: true, inClassTask: true, task: true, verse: true, behavior: false },
    taskMode: 'unique',
    students: [
      { id: 'student-3', name: 'Carlos', birthDate: '2013-02-15', photoUrl: '', totalXp: 0, checks: { presence: false, material: false, inClassTask: false, verse: false, behavior: false, task: false, dailyTasks: {} } },
      { id: 'student-4', name: 'Daniela', birthDate: '2014-11-30', photoUrl: '', totalXp: 0, checks: { presence: false, material: false, inClassTask: false, verse: false, behavior: false, task: false, dailyTasks: {} } },
    ]
  }
];

export type SimulatedFullData = {
  classes: ClassConfig[];
  lessons: Record<string, Record<string, DailyLesson>>; // [classId][dateKey] -> lesson
  studentRecords: Record<string, Record<string, Record<string, StudentChecks>>>; // [classId][dateKey][studentId] -> checks
  passwords: Passwords;
}

export const getInitialData = (): SimulatedFullData => {
  return { 
    classes: initialClasses, 
    lessons: {}, 
    studentRecords: {},
    passwords: {
      admin: 'admin123',
      teacher: 'professorebd',
    }
  };
}


export const getSimulatedData = async (): Promise<SimulatedFullData> => {
  if (typeof window === 'undefined') {
    return getInitialData();
  }
  try {
    const response = await fetch('/api/data', { cache: 'no-store' });
    if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
    }
    const data: SimulatedFullData = await response.json();
    if (data && Array.isArray(data.classes) && data.lessons && data.studentRecords && data.passwords) {
      return data;
    }
    console.warn("Loaded data is invalid, returning initial data.");
    return getInitialData();
  } catch (error) {
    console.error("Failed to fetch from API", error);
    const initialData = getInitialData();
    await saveSimulatedData(initialData);
    return initialData;
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
