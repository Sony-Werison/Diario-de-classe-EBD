export type CheckType = 'presence' | 'task' | 'verse' | 'behavior' | 'material';

export type Student = {
  id: number;
  name: string;
  birthDate: string; // YYYY-MM-DD
  checks: Record<CheckType, boolean>;
  totalXp: number;
};

export type ClassConfig = {
  id: string;
  name: string;
  teacher: string;
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
    teacher: "Prof. Carlos",
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
    teacher: "Profª. Ana",
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
