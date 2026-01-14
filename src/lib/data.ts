
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

export const initialClasses: ClassConfig[] = [];

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
