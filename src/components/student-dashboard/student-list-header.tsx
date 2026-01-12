export function StudentListHeader() {
  return (
    <div className="p-4 flex items-center text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-700">
      <div className="w-2/5 md:w-1/3 pl-2">Aluno</div>
      <div className="flex-1 flex justify-center gap-1 sm:gap-6 text-center">
        <span className="w-8 sm:w-10" title="Presença">Pres</span>
        <span className="w-8 sm:w-10" title="Tarefa">Tar</span>
        <span className="w-8 sm:w-10 text-yellow-500" title="Versículo">Ver</span>
        <span className="w-8 sm:w-10" title="Comportamento">Comp</span>
        <span className="w-8 sm:w-10" title="Material">Mat</span>
      </div>
      <div className="w-1/4 text-right pr-2">Nível / XP</div>
      <div className="w-12 text-right"></div>
    </div>
  );
}
