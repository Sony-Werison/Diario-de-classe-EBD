
"use client";

import { Button } from "@/components/ui/button";
import {
  Church,
  ChevronDown,
  Check,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Save,
  Trash2,
  Ban,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ClassConfig, DailyLesson } from "@/lib/data";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Badge } from "../ui/badge";

interface AppHeaderProps {
  currentDate: Date;
  onPrevSunday: () => void;
  onNextSunday: () => void;
  classes: ClassConfig[];
  currentClass: ClassConfig;
  onClassChange: (classId: string) => void;
  dailyLesson: DailyLesson | undefined;
  onLessonDetailChange: (field: keyof DailyLesson, value: string) => void;
  onSave: () => void;
  onOpenDeleteAlert: () => void;
  onOpenCancelDialog: () => void;
}

export function AppHeader({
  currentDate,
  onPrevSunday,
  onNextSunday,
  classes,
  currentClass,
  onClassChange,
  dailyLesson,
  onLessonDetailChange,
  onSave,
  onOpenDeleteAlert,
  onOpenCancelDialog,
}: AppHeaderProps) {
  const formattedDate = format(currentDate, "EEEE, dd 'de' MMMM", { locale: ptBR });
  const teacherName = currentClass.teachers.find(
    (t) => t.id === dailyLesson?.teacherId
  )?.name;
  
  return (
    <header className="bg-card border-b border-border p-3 flex flex-col shadow-lg z-10 shrink-0 gap-4" style={{'--class-color': currentClass.color} as React.CSSProperties}>
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[var(--class-color)] rounded-lg flex items-center justify-center text-white font-bold text-xl shrink-0">
            <Church size={20} />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="p-0 h-auto font-bold text-base text-white tracking-wide hover:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 -ml-1"
              >
                <span className="truncate max-w-28 sm:max-w-xs">
                  {currentClass.name}
                </span>
                <ChevronDown size={16} className="text-slate-500 ml-1 shrink-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-card border-border text-white">
              {classes.map((c) => (
                <DropdownMenuItem
                  key={c.id}
                  onSelect={() => onClassChange(c.id)}
                  className="cursor-pointer hover:bg-secondary focus:bg-secondary"
                >
                  <Check
                    size={16}
                    className={cn(
                      "mr-2",
                      currentClass.id === c.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="w-3 h-3 rounded-full mr-2" style={{backgroundColor: c.color}} />
                  {c.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="text-right">
          <p className="text-xs text-slate-400 font-medium truncate">
            {teacherName || currentClass.teachers[0]?.name || "Sem professor"}
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-3 w-full">
        <div className="flex items-center gap-2 bg-card-foreground/5 px-2 py-1.5 rounded-full border border-border w-full justify-between">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-slate-400 hover:text-white"
            onClick={onPrevSunday}
          >
            <ChevronLeft size={16} />
          </Button>
          
          <Link href="/calendar" className="flex items-center gap-2 hover:bg-secondary rounded-full px-3 py-1 transition-colors">
            <CalendarIcon size={16} className="text-[var(--class-color)]"/>
            <span className="text-sm font-semibold capitalize whitespace-nowrap">
                {formattedDate}
            </span>
          </Link>
          
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-slate-400 hover:text-white"
            onClick={onNextSunday}
          >
            <ChevronRight size={16} />
          </Button>
        </div>
        
        {dailyLesson?.status === 'cancelled' ? (
          <div className="w-full bg-card-foreground/5 border border-dashed border-yellow-600/50 rounded-md p-3 text-center">
            <p className="text-sm font-semibold text-yellow-400">Aula não realizada</p>
            <p className="text-xs text-slate-400 mt-1">{dailyLesson.cancellationReason}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
            <div className="w-full sm:col-span-1">
              <Label htmlFor="lesson-teacher" className="sr-only">Professor</Label>
              <Select
                value={dailyLesson?.teacherId}
                onValueChange={(value) => onLessonDetailChange('teacherId', value)}
              >
                <SelectTrigger id="lesson-teacher" className="w-full bg-card-foreground/5 border-border">
                  <SelectValue placeholder="Selecione o Professor" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border text-white">
                  {currentClass.teachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:col-span-2">
              <Label htmlFor="lesson-title" className="sr-only">Título da Aula</Label>
              <Input
                id="lesson-title"
                placeholder="Título da Aula do Dia"
                className="bg-card-foreground/5 border-border"
                value={dailyLesson?.title || ""}
                onChange={(e) => onLessonDetailChange('title', e.target.value)}
              />
            </div>
          </div>
        )}

         <div className="flex gap-2 w-full md:w-auto">
            {dailyLesson?.status !== 'cancelled' ? (
              <>
                <Button onClick={onSave} className="bg-primary text-primary-foreground hover:bg-primary/90 w-full md:w-auto">
                  <Save size={16} className="mr-2" />
                  Salvar
                </Button>
                <Button variant="outline" size="sm" onClick={onOpenCancelDialog}>
                  <Ban size={14} className="mr-2"/> Não realizada
                </Button>
              </>
            ) : (
               <Button variant="secondary" size="sm" onClick={onOpenCancelDialog}>
                  <Ban size={14} className="mr-2"/> Editar motivo
                </Button>
            )}
             <Button variant="destructive" size="icon" className="h-9 w-9" onClick={onOpenDeleteAlert}>
                <Trash2 size={16}/>
                <span className="sr-only">Excluir</span>
              </Button>
         </div>

      </div>
    </header>
  );
}
