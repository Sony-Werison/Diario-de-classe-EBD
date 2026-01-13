
import { CheckType } from "@/lib/data";
import { cn } from "@/lib/utils";
import { ArrowUp, ArrowDown } from "lucide-react";

export type SortKey = 'name' | 'progress';

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
  ) as CheckType[];

  const orderedVisibleItems: CheckType[] = ['presence', 'material', 'task', 'verse', 'behavior'].filter(
    item => visibleItems.includes(item as CheckType)
  ) as CheckType[];
  
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
  
  const singleItem = orderedVisibleItems.length === 1;

  return (
    <div className="p-4 flex items-center text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-700">
      <div className={cn("flex justify-center items-end", singleItem ? "w-1/2" : "w-1/3")} style={{ height: '60px'}}>
         <span className={cn("w-10 text-center whitespace-nowrap text-slate-400", singleItem ? 'w-auto' : '-rotate-90 origin-center')}>Aluno</span>
      </div>
      <div className={cn("flex-1 flex justify-center gap-4 text-center items-end", singleItem && "justify-start")} style={{ height: '60px'}}>
        {orderedVisibleItems.map(item => (
            <span key={item} className={cn("w-10 text-center whitespace-nowrap text-slate-400", singleItem ? 'w-auto' : '-rotate-90 origin-center')} title={itemLabels[item]}>
                {itemLabels[item]}
            </span>
        ))}
      </div>
      {!singleItem && (
        <div className="w-1/4 text-right pr-2 hidden sm:block">
           <SortableHeader label="Progresso do Dia" sortValue="progress"/>
        </div>
      )}
    </div>
  );
}
