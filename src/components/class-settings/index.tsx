
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
import { PlusCircle, Trash2, Edit, ChevronDown, Check, Palette } from "lucide-react";
import { initialClasses, CheckType, Student, ClassConfig, TaskMode, Teacher } from "@/lib/data";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";

const itemLabels: Record<CheckType | 'task', string> = {
  presence: "Presença",
  material: "Material",
  task: "Tarefa",
  verse: "Versículo",
  behavior: "Comportamento",
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

const colorPresets = [
  "hsl(150, 78%, 35%)", // Green (default)
  "hsl(210, 80%, 55%)", // Blue
  "hsl(45, 90%, 50%)",  // Yellow
  "hsl(300, 75%, 60%)", // Purple
  "hsl(0, 80%, 60%)",   // Red
  "hsl(25, 90%, 55%)",  // Orange
];


export function ClassSettings() {
  const [classes, setClasses] = useState<ClassConfig[]>(initialClasses);
  const [currentClassId, setCurrentClassId] = useState<string>(initialClasses[0].id);
  const [isStudentDialogOpen, setIsStudentDialogOpen] = useState(false);
  const [isClassDialogOpen, setIsClassDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editingClass, setEditingClass] = useState<ClassConfig | null>(null);

  const currentClass = classes.find(c => c.id === currentClassId) || classes[0];

  const handleTrackedItemToggle = (item: CheckType | 'task') => {
    setClasses(prevClasses => prevClasses.map(c => 
      c.id === currentClassId 
      ? { ...c, trackedItems: { ...c.trackedItems, [item]: !c.trackedItems[item] } }
      : c
    ));
  };
  
    const handleTaskModeChange = (mode: TaskMode) => {
        setClasses(prevClasses => prevClasses.map(c =>
            c.id === currentClassId ? { ...c, taskMode: mode } : c
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
          id: `student-${Date.now()}`,
          name,
          birthDate,
          totalXp: 0,
          checks: { presence: false, task: false, verse: false, behavior: false, material: false, dailyTasks: {} }
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

  const handleDeleteStudent = (studentId: string) => {
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
    if (!editingClass) return;

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const color = editingClass.color;
    const taskMode = formData.get("taskMode") as TaskMode;
    const teachers = editingClass.teachers
      .map(teacher => ({...teacher, name: (formData.get(`teacher-${teacher.id}`) as string)?.trim() }))
      .filter(teacher => teacher.name); // Remove teachers with empty names

    const finalClassData = {
        ...editingClass,
        name,
        color,
        taskMode,
        teachers: teachers.length > 0 ? teachers : [{id: `teacher-${Date.now()}`, name: ''}],
    };

    if (editingClass.id) { // Editing existing class
      setClasses(prev => prev.map(c => c.id === editingClass.id ? finalClassData : c));
    } else { // Creating new class
      const newClass: ClassConfig = {
        ...finalClassData,
        id: `class-${Date.now()}`,
      };
      setClasses(prev => [...prev, newClass]);
      setCurrentClassId(newClass.id);
    }

    setEditingClass(null);
    setIsClassDialogOpen(false);
  }

  const openNewClassDialog = () => {
    setEditingClass({
        id: '', // Empty ID signifies a new class
        name: '',
        color: colorPresets[0],
        teachers: [{id: `new-teacher-${Date.now()}`, name: ''}],
        trackedItems: { presence: true, task: true, verse: false, behavior: false, material: false },
        taskMode: 'unique',
        students: []
    });
    setIsClassDialogOpen(true);
  }

  const openEditClassDialog = () => {
    setEditingClass(currentClass);
    setIsClassDialogOpen(true);
  }
  
  const handleTeacherNameChange = (teacherId: string, newName: string) => {
    setEditingClass(prev => {
        if (!prev) return null;
        return {
            ...prev,
            teachers: prev.teachers.map(t => t.id === teacherId ? {...t, name: newName} : t)
        }
    })
  }

  const addTeacher = () => {
    setEditingClass(prev => {
        if (!prev) return null;
        return {
            ...prev,
            teachers: [...prev.teachers, { id: `new-teacher-${Date.now()}`, name: '' }]
        }
    });
  }

  const removeTeacher = (teacherId: string) => {
     setEditingClass(prev => {
        if (!prev) return null;
        return {
            ...prev,
            teachers: prev.teachers.filter(t => t.id !== teacherId)
        }
    });
  }


  return (
    <div className="p-4 sm:p-6 text-white" style={{'--class-color': currentClass.color} as React.CSSProperties}>
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Personalização das Classes</h1>
        <p className="text-slate-400">
          Crie novas turmas, ajuste os critérios de avaliação e gerencie os alunos.
        </p>
      </header>
      
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full sm:w-72 justify-between bg-card border-border hover:bg-secondary">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{backgroundColor: currentClass.color}} />
                <span className="truncate">{currentClass.name}</span>
              </div>
              <ChevronDown className="h-4 w-4 shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-full sm:w-72 bg-card border-border text-white">
            {classes.map(c => (
              <DropdownMenuItem key={c.id} onSelect={() => setCurrentClassId(c.id)} className="cursor-pointer hover:bg-secondary focus:bg-secondary">
                 <Check size={16} className={cn("mr-2", currentClassId === c.id ? 'opacity-100' : 'opacity-0')} />
                 <div className="w-3 h-3 rounded-full mr-2" style={{backgroundColor: c.color}} />
                {c.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="flex gap-2 w-full sm:w-auto">
            <Button onClick={openNewClassDialog} className="w-full sm:w-auto bg-[var(--class-color)] hover:opacity-90 text-white">
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
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Critérios de Avaliação</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-400 mb-4">Selecione o que será pontuado para a classe <span className="font-bold text-slate-300">{currentClass.name}</span>.</p>
              <div className="space-y-4">
                {(Object.keys(itemLabels) as (CheckType | 'task')[]).map((item) => (
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
                      className="data-[state=checked]:bg-[var(--class-color)]"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {currentClass.trackedItems.task && (
            <Card className="bg-card border-border">
                <CardHeader>
                    <CardTitle>Modo de Tarefa</CardTitle>
                </CardHeader>
                <CardContent>
                    <RadioGroup value={currentClass.taskMode} onValueChange={handleTaskModeChange}>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="unique" id="unique" />
                            <Label htmlFor="unique">Tarefa Única</Label>
                        </div>
                        <p className="text-xs text-slate-400 pl-6">Uma única marcação de tarefa por aula.</p>
                        
                        <div className="flex items-center space-x-2 mt-4">
                            <RadioGroupItem value="daily" id="daily" />
                            <Label htmlFor="daily">Tarefa Diária</Label>
                        </div>
                         <p className="text-xs text-slate-400 pl-6">Marcação diária (Seg-Sáb) com 1 dia de folga.</p>
                    </RadioGroup>
                </CardContent>
            </Card>
          )}

        </div>

        <div className="lg:col-span-2">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Alunos da Classe "{currentClass.name}"</CardTitle>
               <Button size="sm" onClick={openNewStudentDialog} className="bg-[var(--class-color)] hover:opacity-90 text-white">
                <PlusCircle size={16} className="mr-2" />
                Adicionar Aluno
              </Button>
            </CardHeader>
            <CardContent>
              <div className="border border-border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-card">
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
                      <TableRow key={student.id} className="border-border hover:bg-secondary/50">
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
        <DialogContent className="bg-card border-border text-white">
          <DialogHeader>
            <DialogTitle>{editingStudent ? "Editar Aluno" : "Adicionar Novo Aluno"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveStudent} className="space-y-4">
            <div>
              <Label htmlFor="name">Nome do Aluno</Label>
              <Input id="name" name="name" defaultValue={editingStudent?.name} className="bg-secondary border-border" required />
            </div>
            <div>
              <Label htmlFor="birthDate">Data de Nascimento</Label>
              <Input id="birthDate" name="birthDate" type="date" defaultValue={editingStudent?.birthDate} className="bg-secondary border-border" required />
            </div>
            <div className="flex justify-end gap-2 pt-4">
                 <Button type="button" variant="secondary" onClick={() => setIsStudentDialogOpen(false)}>Cancelar</Button>
                 <Button type="submit" className="bg-[var(--class-color)] hover:opacity-90">{editingStudent ? "Salvar Alterações" : "Adicionar Aluno"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      
       <Dialog open={isClassDialogOpen} onOpenChange={setIsClassDialogOpen}>
        <DialogContent className="bg-card border-border text-white">
          <DialogHeader>
            <DialogTitle>{!editingClass?.id ? "Criar Nova Classe" : "Editar Classe"}</DialogTitle>
          </DialogHeader>
          {editingClass && (
            <form onSubmit={handleSaveClass} className="space-y-4">
                <div>
                <Label htmlFor="name">Nome da Classe</Label>
                <Input id="name" name="name" defaultValue={editingClass.name} className="bg-secondary border-border" required placeholder="Ex: Primários" />
                </div>
                <div>
                    <Label>Professor(es)</Label>
                    <div className="space-y-2">
                        {editingClass.teachers.map((teacher, index) => (
                             <div key={teacher.id} className="flex items-center gap-2">
                                <Input 
                                    name={`teacher-${teacher.id}`} 
                                    defaultValue={teacher.name} 
                                    className="bg-secondary border-border" 
                                    placeholder={`Nome do Professor ${index + 1}`} 
                                />
                                <Button type="button" variant="ghost" size="icon" className="h-9 w-9 text-red-500 hover:text-red-400" onClick={() => removeTeacher(teacher.id)} disabled={editingClass.teachers.length <= 1}>
                                    <Trash2 size={16} />
                                </Button>
                            </div>
                        ))}
                    </div>
                    <Button type="button" size="sm" variant="outline" onClick={addTeacher} className="mt-2">
                        <PlusCircle size={16} className="mr-2" /> Adicionar Professor
                    </Button>
                </div>
                 <div>
                    <Label>Modo de Tarefa</Label>
                    <RadioGroup name="taskMode" defaultValue={editingClass.taskMode} className="mt-2 space-y-2">
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="unique" id="edit-unique" />
                            <Label htmlFor="edit-unique">Tarefa Única</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="daily" id="edit-daily" />
                            <Label htmlFor="edit-daily">Tarefa Diária</Label>
                        </div>
                    </RadioGroup>
                </div>
                <div>
                    <Label htmlFor="color">Cor da Classe</Label>
                    <div className="flex items-center gap-2 mt-2">
                        {colorPresets.map(color => (
                            <button
                                key={color}
                                type="button"
                                className={cn("w-7 h-7 rounded-full border-2", editingClass.color === color ? 'border-white' : 'border-transparent')}
                                style={{backgroundColor: color}}
                                onClick={() => setEditingClass(prev => prev ? {...prev, color} : null)}
                            />
                        ))}
                    </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="secondary" onClick={() => setIsClassDialogOpen(false)}>Cancelar</Button>
                    <Button type="submit" style={{backgroundColor: editingClass.color}} className="hover:opacity-90">{editingClass.id ? "Salvar Alterações" : "Criar Classe"}</Button>
                </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

    