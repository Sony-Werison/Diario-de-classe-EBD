import { CheckType } from "@/lib/data";
import { cn } from "@/lib/utils";
import { ArrowUp, ArrowDown } from "lucide-react";

export type SortKey = 'name' | 'age' | 'progress';

interface StudentListHeaderProps {
  trackedItems: Record<CheckType, boolean>;
  onSort: (key: SortKey) => void;
  sortKey: SortKey;
  sortDirection: "asc" | "desc";
}

const itemLabels: Record<CheckType, string> = {
  presence: "Presença",
  material: "Material",
  task: "Tarefa",
  verse: "Versículo",
  behavior: "Comport.",
};

export function StudentListHeader({ trackedItems, onSort, sortKey, sortDirection }: StudentListHeaderProps) {
  const visibleItems = (Object.keys(itemLabels) as CheckType[]).filter(
    item => trackedItems[item]
  );
  
  const SortableHeader = ({ label, sortValue }: { label: string, sortValue: SortKey }) => {
    const isActive = sortKey === sortValue;
    return (
        <button onClick={() => onSort(sortValue)} className="flex items-center gap-1 group">
            <span>{label}</span>
            {isActive ? (
                sortDirection === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
            ) : (
                <ArrowUp size={12} className="text-slate-600 group-hover:text-slate-400" />
            )}
        </button>
    )
  }

  return (
    <div className="p-4 flex items-center text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-700">
      <div className="w-2/5 md:w-1/3 pl-2">
         <SortableHeader label="Aluno" sortValue="name"/>
      </div>
      <div className="flex-1 flex justify-end sm:justify-center gap-2 sm:gap-4 text-center items-end" style={{ height: '60px'}}>
        {visibleItems.map(item => (
            <span key={item} className="w-10 text-center -rotate-90 origin-center whitespace-nowrap text-slate-400" title={itemLabels[item]}>
                {itemLabels[item]}
            </span>
        ))}
      </div>
      <div className="w-1/4 text-right pr-2 hidden sm:block">
         <SortableHeader label="Progresso do Dia" sortValue="progress"/>
      </div>
    </div>
  );
}
