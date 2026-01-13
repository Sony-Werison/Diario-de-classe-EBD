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

interface AppHeaderProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onPrevSunday: () => void;
  onNextSunday: () => void;
  classes: ClassConfig[];
  currentClass: ClassConfig;
  onClassChange: (classId: string) => void;
  dailyLesson: DailyLesson | undefined;
  onLessonDetailChange: (field: keyof DailyLesson, value: string) => void;
  onSave: () => void;
  dailyLessons: Record<string, DailyLesson>;
}

export function AppHeader({
  currentDate,
  onDateChange,
  onPrevSunday,
  onNextSunday,
  classes,
  currentClass,
  onClassChange,
  dailyLesson,
  onLessonDetailChange,
  onSave,
  dailyLessons,
}: AppHeaderProps) {
  const formattedDate = format(currentDate, "EEEE, dd 'de' MMMM", { locale: ptBR });
  const teacherName = currentClass.teachers.find(
    (t) => t.id === dailyLesson?.teacherId
  )?.name;
  
  return (
    <header className="bg-slate-800 border-b border-slate-700 p-3 flex flex-col shadow-lg z-10 shrink-0 gap-4">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-xl shrink-0">
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
            <DropdownMenuContent className="bg-slate-800 border-slate-700 text-white">
              {classes.map((c) => (
                <DropdownMenuItem
                  key={c.id}
                  onSelect={() => onClassChange(c.id)}
                  className="cursor-pointer hover:bg-slate-700 focus:bg-slate-700"
                >
                  <Check
                    size={16}
                    className={cn(
                      "mr-2",
                      currentClass.id === c.id ? "opacity-100" : "opacity-0"
                    )}
                  />
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
        <div className="flex items-center gap-2 bg-slate-900 px-2 py-1.5 rounded-full border border-slate-700 w-full justify-between">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-slate-400 hover:text-white"
            onClick={onPrevSunday}
          >
            <ChevronLeft size={16} />
          </Button>
          
          <div className="flex items-center gap-2">
            <CalendarIcon size={16} className="text-indigo-400"/>
            <span className="text-sm font-semibold text-indigo-300 capitalize whitespace-nowrap">
                {formattedDate}
            </span>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-slate-400 hover:text-white"
            onClick={onNextSunday}
          >
            <ChevronRight size={16} />
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
          <div className="w-full sm:col-span-1">
            <Label htmlFor="lesson-teacher" className="sr-only">Professor</Label>
            <Select
              value={dailyLesson?.teacherId}
              onValueChange={(value) => onLessonDetailChange('teacherId', value)}
            >
              <SelectTrigger id="lesson-teacher" className="w-full bg-slate-900 border-slate-700">
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
              className="bg-slate-900 border-slate-700"
              value={dailyLesson?.title || ""}
              onChange={(e) => onLessonDetailChange('title', e.target.value)}
            />
          </div>
        </div>
         <Button onClick={onSave} className="bg-primary hover:bg-primary/90 w-full md:w-auto">
          <Save size={16} className="mr-2" />
          Salvar Aula
        </Button>
      </div>
    </header>
  );
}

    