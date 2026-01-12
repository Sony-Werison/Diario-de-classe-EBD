export type CheckType = 'presence' | 'task' | 'verse' | 'behavior' | 'material';

export type Student = {
  id: number;
  name: string;
  photo: string; // initials
  checks: Record<CheckType, boolean>;
  totalXp: number;
};

export const POINTS: Record<CheckType, number> = {
    presence: 10,
    task: 20,
    verse: 40,
    behavior: 15,
    material: 15
};

export const initialStudents: Student[] = [
    { id: 1, name: "Davi Silva", photo: "DS", checks: { presence: false, task: false, verse: false, behavior: false, material: false }, totalXp: 450 },
    { id: 2, name: "Ester Gomes", photo: "EG", checks: { presence: false, task: false, verse: false, behavior: false, material: false }, totalXp: 520 },
    { id: 3, name: "Samuel Santos", photo: "SS", checks: { presence: false, task: false, verse: false, behavior: false, material: false }, totalXp: 380 },
    { id: 4, name: "Rebeca Lima", photo: "RL", checks: { presence: false, task: false, verse: false, behavior: false, material: false }, totalXp: 600 },
    { id: 5, name: "João Pedro", photo: "JP", checks: { presence: false, task: false, verse: false, behavior: false, material: false }, totalXp: 210 },
    { id: 6, name: "Lia Oliveira", photo: "LO", checks: { presence: false, task: false, verse: false, behavior: false, material: false }, totalXp: 490 },
    { id: 7, name: "Lucas Melo", photo: "LM", checks: { presence: false, task: false, verse: false, behavior: false, material: false }, totalXp: 310 },
];
