
import { CheckCircle, Notebook, Pencil, BookOpen, Smile, ClipboardCheck, CheckType } from "lucide-react";
export { type CheckType } from '@/lib/data';

export const itemIcons: Record<CheckType | 'task', React.ElementType> = {
  presence: CheckCircle,
  material: Notebook,
  inClassTask: ClipboardCheck,
  task: Pencil,
  verse: BookOpen,
  behavior: Smile,
};

export const itemLabels: Record<CheckType | 'task', string> = {
  presence: "Presença",
  material: "Material",
  inClassTask: "Tarefa em Sala",
  task: "Tarefa de Casa",
  verse: "Versículo",
  behavior: "Comportamento",
};

export const itemColors: Record<CheckType | 'task', string> = {
    presence: 'text-blue-400',
    material: 'text-pink-400',
    inClassTask: 'text-indigo-400',
    task: 'text-purple-400',
    verse: 'text-yellow-400',
    behavior: 'text-emerald-400',
}
