import { CheckCircle, Notebook, Pencil, BookOpen, Smile, CheckType } from "lucide-react";
export { type CheckType } from '@/lib/data';

export const itemIcons: Record<CheckType, React.ElementType> = {
  presence: CheckCircle,
  material: Notebook,
  task: Pencil,
  verse: BookOpen,
  behavior: Smile,
};

export const itemLabels: Record<CheckType, string> = {
  presence: "Presença",
  material: "Material",
  task: "Tarefa",
  verse: "Versículo",
  behavior: "Comportamento",
};

export const itemColors: Record<CheckType, string> = {
    presence: 'text-blue-400',
    material: 'text-pink-400',
    task: 'text-purple-400',
    verse: 'text-yellow-400',
    behavior: 'text-emerald-400',
}
