"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { PlusCircle, Trash2, Edit, ChevronDown, Check } from "lucide-react";
import { initialClasses, CheckType, Student, ClassConfig } from "@/lib/data";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const itemLabels: Record<CheckType, string> = {
  presence: "Presença",
  task: "Tarefa",
  verse: "Versículo",
  behavior: "Comportamento",
  material: "Material",
};

const calculateAge = (birthDateString: string) => {
    if (!birthDateString) return null;
    const birthDate = new Date(birthDateString);
    // Fix off-by-one error when converting from YYYY-MM-DD string
    birthDate.setUTCHours(12);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}


export function ClassSettings() {
  const [classes, setClasses] = useState<ClassConfig[]>(initialClasses);
  const [currentClassId, setCurrentClassId] = useState<string>(initialClasses[0].id);
  const [isStudentDialogOpen, setIsStudentDialogOpen] = useState(false);
  const [isClassDialogOpen, setIsClassDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editingClass, setEditingClass] = useState<ClassConfig | null>(null);

  const currentClass = classes.find(c => c.id === currentClassId) || classes[0];

  const handleTrackedItemToggle = (item: CheckType) => {
    setClasses(prevClasses => prevClasses.map(c => 
      c.id === currentClassId 
      ? { ...c, trackedItems: { ...c.trackedItems, [item]: !c.trackedItems[item] } }
      : c
    ));
  };
  
  const handleSaveStudent = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const birthDate = formData.get("birthDate") as string;

    setClasses(prevClasses => prevClasses.map(c => {
      if (c.id !== currentClassId) return c;

      let newStudents;
      if (editingStudent) {
        newStudents = c.students.map(s => s.id === editingStudent.id ? {...s, name, birthDate} : s);
      } else {
        const newStudent: Student = {
          id: Date.now(),
          name,
          birthDate,
          totalXp: 0,
          checks: { presence: false, task: false, verse: false, behavior: false, material: false }
        };
        newStudents = [...c.students, newStudent];
      }
      return {...c, students: newStudents };
    }));
    
    setEditingStudent(null);
    setIsStudentDialogOpen(false);
  };
  
  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    setIsStudentDialogOpen(true);
  }

  const handleDeleteStudent = (studentId: number) => {
     setClasses(prevClasses => prevClasses.map(c => 
      c.id === currentClassId 
      ? { ...c, students: c.students.filter(s => s.id !== studentId) }
      : c
    ));
  }
  
  const openNewStudentDialog = () => {
    setEditingStudent(null);
    setIsStudentDialogOpen(true);
  }

  const handleSaveClass = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const teacher = formData.get("teacher") as string;

    if (editingClass) {
      setClasses(prev => prev.map(c => c.id === editingClass.id ? {...c, name, teacher} : c));
    } else {
      const newClass: ClassConfig = {
        id: `class-${Date.now()}`,
        name,
        teacher,
        trackedItems: { presence: true, task: true, verse: true, behavior: true, material: true },
        students: []
      };
      setClasses(prev => [...prev, newClass]);
      setCurrentClassId(newClass.id);
    }

    setEditingClass(null);
    setIsClassDialogOpen(false);
  }

  const openNewClassDialog = () => {
    setEditingClass(null);
    setIsClassDialogOpen(true);
  }

  const openEditClassDialog = () => {
    setEditingClass(currentClass);
    setIsClassDialogOpen(true);
  }


  return (
    <div className="p-4 sm:p-6 text-white">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Personalização das Classes</h1>
        <p className="text-slate-400">
          Crie novas turmas, ajuste os critérios de avaliação e gerencie os alunos.
        </p>
      </header>
      
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full sm:w-72 justify-between bg-slate-800 border-slate-700 hover:bg-slate-700">
              <span className="truncate">{currentClass.name}</span>
              <ChevronDown className="h-4 w-4 shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-full sm:w-72 bg-slate-800 border-slate-700 text-white">
            {classes.map(c => (
              <DropdownMenuItem key={c.id} onSelect={() => setCurrentClassId(c.id)} className="cursor-pointer hover:bg-slate-700 focus:bg-slate-700">
                 <Check size={16} className={cn("mr-2", currentClassId === c.id ? 'opacity-100' : 'opacity-0')} />
                {c.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="flex gap-2 w-full sm:w-auto">
            <Button onClick={openNewClassDialog} className="w-full sm:w-auto bg-primary hover:bg-primary/90">
                <PlusCircle size={16} className="mr-2" />
                Criar Classe
            </Button>
            <Button variant="secondary" onClick={openEditClassDialog} className="w-full sm:w-auto">
                <Edit size={16} className="mr-2" />
                Editar Classe
            </Button>
        </div>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle>Critérios de Avaliação</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-400 mb-4">Selecione o que será pontuado para a classe <span className="font-bold text-slate-300">{currentClass.name}</span>.</p>
              <div className="space-y-4">
                {(Object.keys(itemLabels) as CheckType[]).map((item) => (
                  <div
                    key={item}
                    className="flex items-center justify-between"
                  >
                    <Label htmlFor={item} className="text-base">
                      {itemLabels[item]}
                    </Label>
                    <Switch
                      id={item}
                      checked={currentClass.trackedItems[item]}
                      onCheckedChange={() => handleTrackedItemToggle(item)}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Alunos da Classe "{currentClass.name}"</CardTitle>
               <Button size="sm" onClick={openNewStudentDialog} className="bg-primary hover:bg-primary/90">
                <PlusCircle size={16} className="mr-2" />
                Adicionar Aluno
              </Button>
            </CardHeader>
            <CardContent>
              <div className="border border-slate-700 rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700 hover:bg-slate-800">
                      <TableHead className="text-white">Nome</TableHead>
                      <TableHead className="text-white text-center w-24">
                        Idade
                      </TableHead>
                      <TableHead className="text-right text-white w-28">
                        Ações
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentClass.students.map((student) => (
                      <TableRow key={student.id} className="border-slate-700 hover:bg-slate-700/50">
                        <TableCell className="font-medium">
                          {student.name}
                        </TableCell>
                        <TableCell className="text-center text-slate-400">
                           {calculateAge(student.birthDate) !== null ? `${calculateAge(student.birthDate)} anos` : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white" onClick={() => handleEditStudent(student)}>
                                <Edit size={16}/>
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-400" onClick={() => handleDeleteStudent(student.id)}>
                                <Trash2 size={16}/>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
               {currentClass.students.length === 0 && (
                <div className="text-center py-10 text-slate-500">
                  <p>Nenhum aluno cadastrado nesta classe ainda.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
       <Dialog open={isStudentDialogOpen} onOpenChange={setIsStudentDialogOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle>{editingStudent ? "Editar Aluno" : "Adicionar Novo Aluno"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveStudent} className="space-y-4">
            <div>
              <Label htmlFor="name">Nome do Aluno</Label>
              <Input id="name" name="name" defaultValue={editingStudent?.name} className="bg-slate-700 border-slate-600" required />
            </div>
            <div>
              <Label htmlFor="birthDate">Data de Nascimento</Label>
              <Input id="birthDate" name="birthDate" type="date" defaultValue={editingStudent?.birthDate} className="bg-slate-700 border-slate-600" required />
            </div>
            <div className="flex justify-end gap-2 pt-4">
                 <Button type="button" variant="secondary" onClick={() => setIsStudentDialogOpen(false)}>Cancelar</Button>
                 <Button type="submit" className="bg-primary hover:bg-primary/90">{editingStudent ? "Salvar Alterações" : "Adicionar Aluno"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      
       <Dialog open={isClassDialogOpen} onOpenChange={setIsClassDialogOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle>{editingClass ? "Editar Classe" : "Criar Nova Classe"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveClass} className="space-y-4">
            <div>
              <Label htmlFor="name">Nome da Classe</Label>
              <Input id="name" name="name" defaultValue={editingClass?.name} className="bg-slate-700 border-slate-600" required placeholder="Ex: Primários" />
            </div>
            <div>
              <Label htmlFor="teacher">Professor(a)</Label>
              <Input id="teacher" name="teacher" defaultValue={editingClass?.teacher} className="bg-slate-700 border-slate-600" placeholder="Ex: Profª. Ana" />
            </div>
            <div className="flex justify-end gap-2 pt-4">
                 <Button type="button" variant="secondary" onClick={() => setIsClassDialogOpen(false)}>Cancelar</Button>
                 <Button type="submit" className="bg-primary hover:bg-primary/90">{editingClass ? "Salvar Alterações" : "Criar Classe"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
