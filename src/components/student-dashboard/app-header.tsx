"use client";

import { Button } from "@/components/ui/button";
import { Church, ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AppHeaderProps {
  currentDate: Date;
  onPrevDate: () => void;
  onNextDate: () => void;
}

export function AppHeader({ currentDate, onPrevDate, onNextDate }: AppHeaderProps) {
  const formattedDate = format(currentDate, "EEEE, dd MMM", { locale: ptBR });
  
  return (
    <header className="bg-slate-800 border-b border-slate-700 p-3 sm:p-4 flex flex-col sm:flex-row justify-between items-center shadow-lg z-10 shrink-0 gap-3">
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-xl shrink-0">
          <Church size={24} />
        </div>
        <div>
          <h1 className="font-bold text-base sm:text-lg text-white tracking-wide">
            EBD CONTROLE <span className="text-primary">JÚNIORS</span>
          </h1>
          <p className="text-xs text-slate-400">Classe 2 - Prof. Carlos</p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 bg-slate-900 px-3 py-2 sm:px-4 rounded-full border border-slate-700 w-full sm:w-auto justify-between">
        <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-6 sm:w-6 text-slate-400 hover:text-white" onClick={onPrevDate}>
          <ChevronLeft size={16} />
        </Button>
        <span className="text-sm font-semibold text-indigo-300 flex items-center gap-2 capitalize">
          <CalendarDays size={16} />
          {formattedDate}
        </span>
        <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-6 sm:w-6 text-slate-400 hover:text-white" onClick={onNextDate}>
          <ChevronRight size={16} />
        </Button>
      </div>
    </header>
  );
}
