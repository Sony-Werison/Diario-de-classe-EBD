"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check, ChevronDown, Trophy, Users } from "lucide-react";
import { initialClasses, ClassConfig } from "@/lib/data";
import { cn } from "@/lib/utils";

const calculateAge = (birthDateString: string) => {
  if (!birthDateString) return null;
  const birthDate = new Date(birthDateString);
  birthDate.setUTCHours(12);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

export function ReportDashboard() {
  const [classes] = useState<ClassConfig[]>(initialClasses);
  const [currentClassId, setCurrentClassId] = useState<string>(
    initialClasses[0].id
  );

  const currentClass = useMemo(
    () => classes.find((c) => c.id === currentClassId) || classes[0],
    [classes, currentClassId]
  );
  
  const studentsSortedByXp = useMemo(() => {
    return [...currentClass.students].sort((a, b) => b.totalXp - a.totalXp);
  }, [currentClass.students]);


  return (
    <div className="p-4 sm:p-6 text-white bg-background flex-1">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Relatório da Classe</h1>
        <p className="text-slate-400">
          Veja o resumo de pontuação total dos alunos.
        </p>
      </header>

      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="w-full sm:w-72 justify-between bg-card border-border hover:bg-secondary"
            >
              <span className="truncate">{currentClass.name}</span>
              <ChevronDown className="h-4 w-4 shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-full sm:w-72 bg-card border-border text-white">
            {classes.map((c) => (
              <DropdownMenuItem
                key={c.id}
                onSelect={() => setCurrentClassId(c.id)}
                className="cursor-pointer hover:bg-secondary focus:bg-secondary"
              >
                <Check
                  size={16}
                  className={cn(
                    "mr-2",
                    currentClassId === c.id ? "opacity-100" : "opacity-0"
                  )}
                />
                {c.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Trophy size={20} className="text-yellow-400" />
                <span>Ranking de Pontuação Total</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border border-border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-card">
                    <TableHead className="w-12 text-center text-white">Rank</TableHead>
                    <TableHead className="text-white">Aluno</TableHead>
                    <TableHead className="text-center text-white">Idade</TableHead>
                    <TableHead className="text-right text-white">XP Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentsSortedByXp.map((student, index) => (
                    <TableRow key={student.id} className="border-border hover:bg-secondary/50">
                       <TableCell className="text-center">
                          <span className={cn(
                              "font-bold w-6 h-6 flex items-center justify-center rounded-full mx-auto",
                              index === 0 && "bg-yellow-400 text-slate-900",
                              index === 1 && "bg-slate-400 text-slate-900",
                              index === 2 && "bg-yellow-700 text-white",
                          )}>
                            {index + 1}
                          </span>
                       </TableCell>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell className="text-center text-slate-400">
                        {calculateAge(student.birthDate)
                          ? `${calculateAge(student.birthDate)} anos`
                          : "-"}
                      </TableCell>
                      <TableCell className="text-right font-bold text-lg text-primary">
                        {student.totalXp}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
             {studentsSortedByXp.length === 0 && (
                <div className="text-center py-16 text-slate-500 bg-slate-800/50 rounded-b-xl">
                    <Users size={40} className="mx-auto mb-2" />
                    <h3 className="font-bold">Nenhum aluno nesta classe</h3>
                    <p className="text-sm">Vá para as configurações para adicionar alunos.</p>
                </div>
             )}
          </CardContent>
        </Card>
    </div>
  );
}
