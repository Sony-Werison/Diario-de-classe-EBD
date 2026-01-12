import { CheckType } from "@/lib/data";
import { cn } from "@/lib/utils";

interface StudentListHeaderProps {
  trackedItems: Record<CheckType, boolean>;
}

const itemLabels: Record<CheckType, string> = {
  presence: "Presença",
  task: "Tarefa",
  verse: "Versículo",
  behavior: "Comport.",
  material: "Material",
};

export function StudentListHeader({ trackedItems }: StudentListHeaderProps) {
  const visibleItems = (Object.keys(itemLabels) as CheckType[]).filter(
    item => trackedItems[item]
  );
  
  return (
    <div className="p-4 flex items-center text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-700">
      <div className="w-2/5 md:w-1/3 pl-2">Aluno</div>
      <div className="flex-1 flex justify-end sm:justify-center gap-2 sm:gap-4 text-center items-end" style={{ height: '60px'}}>
        {visibleItems.map(item => (
            <span key={item} className="w-10 text-center -rotate-90 origin-center whitespace-nowrap" title={itemLabels[item]}>
                {itemLabels[item]}
            </span>
        ))}
      </div>
      <div className="w-1/4 text-right pr-2 hidden sm:block">Progresso do Dia</div>
    </div>
  );
}
