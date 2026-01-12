export function StudentListHeader() {
  return (
    <div className="p-4 flex items-center text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-700 min-w-[640px]">
      <div className="w-2/5 md:w-1/3 pl-2">Aluno</div>
      <div className="flex-1 flex justify-center gap-2 sm:gap-4 text-center">
        <span className="w-10 text-center" title="Presença">Pres</span>
        <span className="w-10 text-center" title="Tarefa">Tar</span>
        <span className="w-10 text-center text-yellow-500" title="Versículo">Ver</span>
        <span className="w-10 text-center" title="Comportamento">Comp</span>
        <span className="w-10 text-center" title="Material">Mat</span>
      </div>
      <div className="w-1/4 text-right pr-2">Nível / XP</div>
      <div className="w-12 text-right"></div>
    </div>
  );
}
