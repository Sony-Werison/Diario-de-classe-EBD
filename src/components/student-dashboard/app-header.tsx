"use client";

import { Button } from "@/components/ui/button";
import { Church, ChevronLeft, ChevronRight, CalendarDays, ChevronDown, Check } from "lucide-react";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ClassConfig } from "@/lib/data";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils";


interface AppHeaderProps {
  currentDate: Date;
  onPrevDate: () => void;
  onNextDate: () => void;
  classes: ClassConfig[];
  currentClass: ClassConfig;
  onClassChange: (classId: string) => void;
}

export function AppHeader({ currentDate, onPrevDate, onNextDate, classes, currentClass, onClassChange }: AppHeaderProps) {
  const formattedDate = format(currentDate, "EEEE, dd MMM", { locale: ptBR });
  
  return (
    <header className="bg-slate-800 border-b border-slate-700 p-3 sm:p-4 flex flex-col sm:flex-row justify-between items-center shadow-lg z-10 shrink-0 gap-3">
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-xl shrink-0">
          <Church size={24} />
        </div>
        <div>
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="p-0 h-auto font-bold text-base sm:text-lg text-white tracking-wide hover:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 -ml-1">
                 EBD CONTROLE <span className="text-primary ml-1.5 mr-1">{currentClass.name.toUpperCase()}</span>
                 <ChevronDown size={16} className="text-slate-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-slate-800 border-slate-700 text-white">
              {classes.map(c => (
                <DropdownMenuItem key={c.id} onSelect={() => onClassChange(c.id)} className="cursor-pointer hover:bg-slate-700 focus:bg-slate-700">
                  <Check size={16} className={cn("mr-2", currentClass.id === c.id ? 'opacity-100' : 'opacity-0')} />
                  {c.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <p className="text-xs text-slate-400">{currentClass.teacher}</p>
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
