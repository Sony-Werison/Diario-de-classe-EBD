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

export const initialClasses: ClassConfig[] = [];

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
