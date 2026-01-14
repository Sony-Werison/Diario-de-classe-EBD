
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
    const data = await response.json();
    
    // Check for a valid structure. If not, start fresh.
    if (!data || typeof data !== 'object') {
        console.warn("Loaded data is not an object, returning initial data.");
        return getInitialData();
    }
    
    // Merge loaded data with initial data to ensure all keys exist
    const initialData = getInitialData();
    const mergedData: SimulatedFullData = {
        classes: Array.isArray(data.classes) ? data.classes : initialData.classes,
        lessons: data.lessons && typeof data.lessons === 'object' ? data.lessons : initialData.lessons,
        studentRecords: data.studentRecords && typeof data.studentRecords === 'object' ? data.studentRecords : initialData.studentRecords,
        passwords: data.passwords && typeof data.passwords === 'object' ? data.passwords : initialData.passwords,
    };
    
    // Specifically check for core properties. If they don't exist, it's safer to start over.
    if (!Array.isArray(mergedData.classes)) {
        console.warn("Loaded data is invalid (classes is not an array), returning initial data.");
        return getInitialData();
    }
    
    return mergedData;
  } catch (error) {
    console.error("Failed to fetch from API, returning initial data. Error:", error);
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
