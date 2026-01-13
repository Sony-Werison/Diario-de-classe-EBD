
import { CheckType, TaskMode } from "@/lib/data";
import { cn } from "@/lib/utils";
import { ArrowUp, ArrowDown } from "lucide-react";

export type SortKey = 'name' | 'progress';

interface StudentListHeaderProps {
  trackedItems: Record<CheckType | 'task', boolean>;
  onSort: (key: SortKey) => void;
  sortKey: SortKey;
  sortDirection: "asc" | "desc";
  taskMode: TaskMode;
}

const itemLabels: Record<CheckType | 'task', string> = {
  presence: "Presença",
  material: "Material",
  task: "Tarefa",
  verse: "Versículo",
  behavior: "Comport.",
};

export function StudentListHeader({ trackedItems, onSort, sortKey, sortDirection, taskMode }: StudentListHeaderProps) {
  const visibleItems = (Object.keys(itemLabels) as (CheckType | 'task')[]).filter(
    item => trackedItems[item]
  );

  const orderedVisibleItems: (CheckType | 'task')[] = ['presence', 'material', 'task', 'verse', 'behavior'].filter(
    item => visibleItems.includes(item as (CheckType | 'task'))
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
  
  const singleItem = orderedVisibleItems.length === 1 && taskMode === 'unique';

  return (
    <div className="p-4 flex items-center text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-700">
      <div className={cn("flex justify-center items-end", singleItem ? "w-1/2" : "w-1/3")} style={{ height: '60px'}}>
         <span className={cn("w-10 text-center whitespace-nowrap text-slate-400", singleItem ? 'w-auto' : '-rotate-90 origin-center')}>Aluno</span>
      </div>
      <div className={cn("flex-1 flex justify-center gap-4 text-center items-end", singleItem && "justify-start")} style={{ height: '60px'}}>
        {orderedVisibleItems.map(item => (
            <span key={item} className={cn("w-10 text-center whitespace-nowrap text-slate-400", (singleItem || (item === 'task' && taskMode === 'daily')) ? 'w-auto' : '-rotate-90 origin-center')} title={itemLabels[item]}>
                {itemLabels[item]}
            </span>
        ))}
      </div>
      {(!singleItem || taskMode === 'daily') && (
        <div className="w-1/4 text-right pr-2 hidden sm:block">
           <SortableHeader label="Progresso do Dia" sortValue="progress"/>
        </div>
      )}
    </div>
  );
}
