import { CheckType } from "@/lib/data";

interface StudentListHeaderProps {
  trackedItems: Record<CheckType, boolean>;
}

export function StudentListHeader({ trackedItems }: StudentListHeaderProps) {
  return (
    <div className="p-4 flex items-center text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-700">
      <div className="w-2/5 md:w-1/3 pl-2">Aluno</div>
      <div className="flex-1 flex justify-end sm:justify-center gap-2 sm:gap-4 text-center">
        {trackedItems.presence && <span className="w-10 text-center" title="Presença">Pres</span>}
        {trackedItems.task && <span className="w-10 text-center" title="Tarefa">Tar</span>}
        {trackedItems.verse && <span className="w-10 text-center text-yellow-500" title="Versículo">Ver</span>}
        {trackedItems.behavior && <span className="w-10 text-center" title="Comportamento">Comp</span>}
        {trackedItems.material && <span className="w-10 text-center" title="Material">Mat</span>}
      </div>
      <div className="w-1/4 text-right pr-2 hidden sm:block">Progresso do Dia</div>
    </div>
  );
}
