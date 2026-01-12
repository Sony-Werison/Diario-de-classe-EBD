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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { PlusCircle, Trash2, Edit } from "lucide-react";
import { initialStudents, CheckType, Student } from "@/lib/data";

type ClassConfig = {
  id: string;
  name: string;
  teacher: string;
  trackedItems: Record<CheckType, boolean>;
  students: Student[];
};

const initialClassConfig: ClassConfig = {
  id: "juniors-2",
  name: "Júniors",
  teacher: "Prof. Carlos",
  trackedItems: {
    presence: true,
    task: true,
    verse: true,
    behavior: true,
    material: true,
  },
  students: initialStudents,
};

const itemLabels: Record<CheckType, string> = {
  presence: "Presença",
  task: "Tarefa",
  verse: "Versículo",
  behavior: "Comportamento",
  material: "Material",
};

export function ClassSettings() {
  const [config, setConfig] = useState<ClassConfig>(initialClassConfig);
  const [isStudentDialogOpen, setIsStudentDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const handleTrackedItemToggle = (item: CheckType) => {
    setConfig((prevConfig) => ({
      ...prevConfig,
      trackedItems: {
        ...prevConfig.trackedItems,
        [item]: !prevConfig.trackedItems[item],
      },
    }));
  };

  const handleSaveStudent = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const photo = (formData.get("initials") as string) || name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase();

    if (editingStudent) {
      // Edit
      setConfig(prev => ({
        ...prev,
        students: prev.students.map(s => s.id === editingStudent.id ? {...s, name, photo} : s)
      }));
    } else {
      // Add
      const newStudent: Student = {
        id: Date.now(),
        name,
        photo,
        totalXp: 0,
        checks: { presence: false, task: false, verse: false, behavior: false, material: false }
      };
      setConfig(prev => ({...prev, students: [...prev.students, newStudent]}));
    }
    
    setEditingStudent(null);
    setIsStudentDialogOpen(false);
  };
  
  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    setIsStudentDialogOpen(true);
  }

  const handleDeleteStudent = (studentId: number) => {
    setConfig(prev => ({
      ...prev,
      students: prev.students.filter(s => s.id !== studentId)
    }));
  }
  
  const openNewStudentDialog = () => {
    setEditingStudent(null);
    setIsStudentDialogOpen(true);
  }


  return (
    <div className="p-4 sm:p-6 text-white">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Personalização da Classe</h1>
        <p className="text-slate-400">
          Ajuste os critérios de avaliação e gerencie os alunos da sua classe.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle>Critérios de Avaliação</CardTitle>
            </CardHeader>
            <CardContent>
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
                      checked={config.trackedItems[item]}
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
              <CardTitle>Alunos</CardTitle>
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
                        Iniciais
                      </TableHead>
                      <TableHead className="text-right text-white w-28">
                        Ações
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {config.students.map((student) => (
                      <TableRow key={student.id} className="border-slate-700 hover:bg-slate-700/50">
                        <TableCell className="font-medium">
                          {student.name}
                        </TableCell>
                        <TableCell className="text-center text-slate-400">
                          {student.photo}
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
              <Label htmlFor="initials">Iniciais (Avatar)</Label>
              <Input id="initials" name="initials" defaultValue={editingStudent?.photo} className="bg-slate-700 border-slate-600" maxLength={2} placeholder="Ex: JP" />
            </div>
            <div className="flex justify-end gap-2">
                 <Button type="button" variant="secondary" onClick={() => setIsStudentDialogOpen(false)}>Cancelar</Button>
                 <Button type="submit" className="bg-primary hover:bg-primary/90">{editingStudent ? "Salvar Alterações" : "Adicionar Aluno"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
