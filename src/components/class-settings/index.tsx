
"use client";

import { useState, useEffect, useRef } from "react";
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
import { PlusCircle, Trash2, Edit, ChevronDown, Check, Upload, Download, User } from "lucide-react";
import { getSimulatedData, saveSimulatedData, CheckType, Student, ClassConfig, TaskMode, Teacher, SimulatedFullData } from "@/lib/data";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { useToast } from "@/hooks/use-toast";

const itemLabels: Record<CheckType | 'task', string> = {
  presence: "Presença",
  material: "Material",
  task: "Tarefa de Casa",
  inClassTask: "Tarefa em Sala",
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
  const [data, setData] = useState<SimulatedFullData | null>(null);
  const [currentClassId, setCurrentClassId] = useState<string>('');
  const [isStudentDialogOpen, setIsStudentDialogOpen] = useState(false);
  const [isClassDialogOpen, setIsClassDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editingClass, setEditingClass] = useState<ClassConfig | null>(null);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [userRole, setUserRole] = useState<string>('admin');
  const isViewer = userRole === 'viewer';


  useEffect(() => {
    // This effect runs once on the client to load data from localStorage
    // and prevent hydration mismatch.
    const role = sessionStorage.getItem('userRole') || 'admin';
    setUserRole(role);
    const savedData = getSimulatedData();
    setData(savedData);
    
    let availableClasses = savedData.classes;
    if (role === 'teacher') {
      const teacherId = sessionStorage.getItem('teacherId');
      availableClasses = savedData.classes.filter(c => c.teachers.some(t => t.id === teacherId));
    }

    if(availableClasses.length > 0 && (!currentClassId || !availableClasses.find(c => c.id === currentClassId))) {
      setCurrentClassId(availableClasses[0].id);
    }
    
    const handleStorageChange = () => {
      setData(getSimulatedData());
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [currentClassId]);
  
  const availableClasses = useMemo(() => {
    if (!data) return [];
    if (userRole === 'admin' || userRole === 'viewer') return data.classes;
    if (userRole === 'teacher') {
      const teacherId = sessionStorage.getItem('teacherId');
      return data.classes.filter(c => c.teachers.some(t => t.id === teacherId));
    }
    return [];
  }, [data, userRole]);


  const updateAndSaveData = (updater: (prev: typeof data) => typeof data) => {
    const newData = updater(data!);
    setData(newData);
    saveSimulatedData(newData as SimulatedFullData);
    return newData;
  };

  const handleTrackedItemToggle = (item: CheckType | 'task') => {
    if (!currentClass || isViewer) return;
    updateAndSaveData(prev => ({
        ...prev!,
        classes: prev!.classes.map(c =>
            c.id === currentClassId
                ? { ...c, trackedItems: { ...c.trackedItems, [item]: !c.trackedItems[item] } }
                : c
        )
    }));
  };
  
    const handleTaskModeChange = (mode: TaskMode) => {
        if(isViewer) return;
        updateAndSaveData(prev => ({
            ...prev!,
            classes: prev!.classes.map(c =>
                c.id === currentClassId ? { ...c, taskMode: mode } : c
            )
        }));
    };

  const handleSaveStudent = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if(isViewer) return;
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const birthDate = formData.get("birthDate") as string;

    updateAndSaveData(prev => {
        const newClasses = prev!.classes.map(c => {
            if (c.id !== currentClassId) return c;

            let newStudents;
            if (editingStudent) {
                newStudents = c.students.map(s => s.id === editingStudent.id ? { ...s, name, birthDate } : s);
            } else {
                const newStudent: Student = {
                    id: `student-${Date.now()}`,
                    name,
                    birthDate,
                    totalXp: 0,
                    checks: { presence: false, task: false, inClassTask: false, verse: false, behavior: false, material: false, dailyTasks: {} }
                };
                newStudents = [...c.students, newStudent];
            }
            return { ...c, students: newStudents };
        });
        return { ...prev!, classes: newClasses };
    });
    
    setEditingStudent(null);
    setIsStudentDialogOpen(false);
  };
  
  const handleEditStudent = (student: Student) => {
    if(isViewer) return;
    setEditingStudent(student);
    setIsStudentDialogOpen(true);
  }

  const handleDeleteStudent = (studentId: string) => {
    if(isViewer) return;
    updateAndSaveData(prev => ({
        ...prev!,
        classes: prev!.classes.map(c =>
            c.id === currentClassId
                ? { ...c, students: c.students.filter(s => s.id !== studentId) }
                : c
        )
    }));
  }
  
  const openNewStudentDialog = () => {
    if(isViewer) return;
    setEditingStudent(null);
    setIsStudentDialogOpen(true);
  }

  const handleSaveClass = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingClass || isViewer) return;

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const color = editingClass.color;
    const taskMode = formData.get("taskMode") as TaskMode;
    const teachers = editingClass.teachers
      .map(teacher => ({...teacher, name: (formData.get(`teacher-${teacher.id}`) as string)?.trim() }))
      .filter(teacher => teacher.name); // Remove teachers with empty names

    const finalClassData: ClassConfig = {
        ...editingClass,
        name,
        color,
        taskMode,
        teachers: teachers.length > 0 ? teachers : [{id: `teacher-${Date.now()}`, name: ''}],
    };

    if (editingClass.id) { // Editing existing class
      updateAndSaveData(prev => ({
          ...prev!,
          classes: prev!.classes.map(c => c.id === editingClass.id ? finalClassData : c)
      }));
    } else { // Creating new class
      const newClass: ClassConfig = {
        ...finalClassData,
        id: `class-${Date.now()}`,
      };
      const newData = updateAndSaveData(prev => ({ ...prev!, classes: [...prev!.classes, newClass] }));
      setCurrentClassId(newClass.id);
    }

    setEditingClass(null);
    setIsClassDialogOpen(false);
  }

  const openNewClassDialog = () => {
    if(isViewer) return;
    setEditingClass({
        id: '', // Empty ID signifies a new class
        name: '',
        color: colorPresets[0],
        teachers: [{id: `new-teacher-${Date.now()}`, name: ''}],
        trackedItems: { presence: true, task: true, verse: false, behavior: false, material: false, inClassTask: true },
        taskMode: 'unique',
        students: []
    });
    setIsClassDialogOpen(true);
  }

  const openEditClassDialog = () => {
    if(!currentClass || isViewer) return;
    setEditingClass(currentClass);
    setIsClassDialogOpen(true);
  }
  
  const addTeacher = () => {
    if(isViewer) return;
    setEditingClass(prev => {
        if (!prev) return null;
        return {
            ...prev,
            teachers: [...prev.teachers, { id: `new-teacher-${Date.now()}`, name: '' }]
        }
    });
  }

  const removeTeacher = (teacherId: string) => {
     if(isViewer) return;
     setEditingClass(prev => {
        if (!prev) return null;
        const newTeachers = prev.teachers.filter(t => t.id !== teacherId);
         // Prevent removing the last input field
        if (newTeachers.length === 0) {
            newTeachers.push({ id: `new-teacher-${Date.now()}`, name: '' });
        }
        return { ...prev, teachers: newTeachers };
    });
  }

  const handleExportData = () => {
    const dataToExport = getSimulatedData();
    const dataStr = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const date = new Date().toISOString().split('T')[0];
    link.download = `ebd_tracker_backup_${date}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({ title: "Backup exportado com sucesso!" });
  };

  const handleImportClick = () => {
    if(isViewer) return;
    fileInputRef.current?.click();
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || isViewer) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const importedData = JSON.parse(text);
        
        // Basic validation
        if (importedData && importedData.classes && importedData.lessons && importedData.studentRecords) {
          saveSimulatedData(importedData);
          setData(importedData); // Refresh UI
          setCurrentClassId(importedData.classes[0]?.id || '');
          toast({ title: "Backup importado com sucesso!", description: "Os dados foram restaurados." });
        } else {
          throw new Error("Formato de arquivo inválido.");
        }
      } catch (error) {
        console.error("Erro ao importar backup:", error);
        toast({ title: "Erro na importação", description: "O arquivo de backup é inválido ou está corrompido.", variant: "destructive" });
      }
    };
    reader.readAsText(file);
    // Reset file input
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  if (!data) {
    return null; // Render nothing on the server until client is ready
  }

  const currentClass = availableClasses.find(c => c.id === currentClassId);

  if (!currentClass) {
     return (
        <div className="p-4 sm:p-6 text-white flex flex-col items-center justify-center h-full">
            <div className="text-center">
                <User size={48} className="text-slate-500 mb-4" />
                <h1 className="text-2xl font-bold mb-4">Nenhuma classe encontrada</h1>
                <p className="text-slate-400 mb-6 max-w-sm">
                    {userRole === 'teacher' ? 'Parece que você ainda não está atribuído a nenhuma classe.' : 'Parece que você ainda não tem nenhuma classe. Crie uma para começar.'}
                </p>
                {userRole === 'admin' && (
                    <Button onClick={openNewClassDialog} className="bg-primary hover:bg-primary/90 text-white">
                        <PlusCircle size={16} className="mr-2" />
                        Criar Primeira Classe
                    </Button>
                )}
            </div>
            <Dialog open={isClassDialogOpen} onOpenChange={setIsClassDialogOpen}>
            <DialogContent className="bg-card border-border text-white">
            <DialogHeader>
                <DialogTitle>{!editingClass?.id ? "Criar Nova Classe" : "Editar Classe"}</DialogTitle>
            </DialogHeader>
            {editingClass && (
                <form onSubmit={handleSaveClass} className="space-y-4">
                    <fieldset disabled={isViewer}>
                        <div>
                        <Label htmlFor="class-name">Nome da Classe</Label>
                        <Input id="class-name" name="name" defaultValue={editingClass.name} className="bg-input border-border" required placeholder="Ex: Primários" />
                        </div>
                        <div>
                            <Label>Professor(es)</Label>
                            <div className="space-y-2">
                                {editingClass.teachers.map((teacher, index) => (
                                    <div key={teacher.id} className="flex items-center gap-2">
                                        <Input 
                                            name={`teacher-${teacher.id}`} 
                                            defaultValue={teacher.name} 
                                            className="bg-input border-border" 
                                            placeholder={`Nome do Professor ${index + 1}`} 
                                        />
                                        <Button type="button" variant="ghost" size="icon" className="h-9 w-9 text-red-500 hover:text-red-400 shrink-0" onClick={() => removeTeacher(teacher.id)}>
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
                            <Label>Modo de Tarefa de Casa</Label>
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
                            <Label>Cor da Classe</Label>
                            <div className="flex items-center gap-2 mt-2">
                                {colorPresets.map(color => (
                                    <button
                                        key={color}
                                        type="button"
                                        className={cn("w-7 h-7 rounded-full border-2 transition-all", editingClass.color === color ? 'border-white ring-2 ring-white/50' : 'border-transparent hover:border-white/50')}
                                        style={{backgroundColor: color}}
                                        onClick={() => setEditingClass(prev => prev ? {...prev, color} : null)}
                                    />
                                ))}
                            </div>
                        </div>
                        {!isViewer && <div className="flex justify-end gap-2 pt-4">
                            <Button type="button" variant="secondary" onClick={() => setIsClassDialogOpen(false)}>Cancelar</Button>
                            <Button type="submit" className="bg-primary hover:bg-primary/90">{editingClass.id ? "Salvar Alterações" : "Criar Classe"}</Button>
                        </div>}
                    </fieldset>
                </form>
            )}
            </DialogContent>
        </Dialog>
     </div>
     );
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
            <Button variant="outline" className="w-full sm:w-72 justify-between bg-card border-border">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{backgroundColor: currentClass.color}} />
                <span className="truncate">{currentClass.name}</span>
              </div>
              <ChevronDown className="h-4 w-4 shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-full sm:w-72 bg-card border-border text-white">
            {availableClasses.map(c => (
              <DropdownMenuItem key={c.id} onSelect={() => setCurrentClassId(c.id)} className="cursor-pointer focus:bg-secondary">
                 <Check size={16} className={cn("mr-2", currentClassId === c.id ? 'opacity-100' : 'opacity-0')} />
                 <div className="w-3 h-3 rounded-full mr-2" style={{backgroundColor: c.color}} />
                {c.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        {userRole === 'admin' && <div className="flex gap-2 w-full sm:w-auto">
            <Button onClick={openNewClassDialog} className="bg-primary hover:bg-primary/90 text-white" disabled={isViewer}>
                <PlusCircle size={16} className="mr-2" />
                Criar Classe
            </Button>
            <Button variant="secondary" onClick={openEditClassDialog} className="w-full sm:w-auto" disabled={isViewer}>
                <Edit size={16} className="mr-2" />
                Editar Classe
            </Button>
        </div>}
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Alunos da Classe "{currentClass.name}"</CardTitle>
              {!isViewer && <Button size="sm" onClick={openNewStudentDialog} className="bg-primary hover:bg-primary/90 text-white">
                <PlusCircle size={16} className="mr-2" />
                Adicionar Aluno
              </Button>}
            </CardHeader>
            <CardContent>
              <div className="border border-border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
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
                      <TableRow key={student.id} className="border-border hover:bg-transparent">
                        <TableCell className="font-medium">
                          {student.name}
                        </TableCell>
                        <TableCell className="text-center text-slate-400">
                           {calculateAge(student.birthDate) !== null ? `${calculateAge(student.birthDate)} anos` : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white" onClick={() => handleEditStudent(student)} disabled={isViewer}>
                                <Edit size={16}/>
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-400" onClick={() => handleDeleteStudent(student.id)} disabled={isViewer}>
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
                      className="data-[state=checked]:bg-primary"
                      disabled={isViewer}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {currentClass.trackedItems.task && (
            <Card className="bg-card border-border">
                <CardHeader>
                    <CardTitle>Modo de Tarefa de Casa</CardTitle>
                </CardHeader>
                <CardContent>
                    <RadioGroup value={currentClass.taskMode} onValueChange={handleTaskModeChange} disabled={isViewer}>
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

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Backup e Restauração</CardTitle>
            </CardHeader>
            <CardContent>
               <p className="text-sm text-slate-400 mb-4">Exporte ou importe todos os dados do aplicativo, incluindo classes, alunos e registros.</p>
               <div className="flex flex-col sm:flex-row gap-2">
                  <Button onClick={handleExportData} variant="outline" className="w-full">
                    <Download size={16} className="mr-2"/>
                    Exportar Backup
                  </Button>
                  <Button onClick={handleImportClick} variant="outline" className="w-full" disabled={isViewer}>
                    <Upload size={16} className="mr-2"/>
                    Importar Backup
                  </Button>
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    className="hidden"
                    accept=".json"
                    onChange={handleImportData}
                    disabled={isViewer}
                  />
               </div>
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
             <fieldset disabled={isViewer}>
                <div>
                  <Label htmlFor="name">Nome do Aluno</Label>
                  <Input id="name" name="name" defaultValue={editingStudent?.name} className="bg-input border-border" required />
                </div>
                <div>
                  <Label htmlFor="birthDate">Data de Nascimento</Label>
                  <Input id="birthDate" name="birthDate" type="date" defaultValue={editingStudent?.birthDate} className="bg-input border-border" required />
                </div>
                {!isViewer && <div className="flex justify-end gap-2 pt-4">
                     <Button type="button" variant="secondary" onClick={() => setIsStudentDialogOpen(false)}>Cancelar</Button>
                     <Button type="submit" className="bg-primary hover:bg-primary/90">{editingStudent ? "Salvar Alterações" : "Adicionar Aluno"}</Button>
                </div>}
            </fieldset>
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
                <fieldset disabled={isViewer}>
                    <div>
                    <Label htmlFor="class-name">Nome da Classe</Label>
                    <Input id="class-name" name="name" defaultValue={editingClass.name} className="bg-input border-border" required placeholder="Ex: Primários" />
                    </div>
                    <div>
                        <Label>Professor(es)</Label>
                        <div className="space-y-2">
                            {editingClass.teachers.map((teacher, index) => (
                                 <div key={teacher.id} className="flex items-center gap-2">
                                    <Input 
                                        name={`teacher-${teacher.id}`} 
                                        defaultValue={teacher.name} 
                                        className="bg-input border-border" 
                                        placeholder={`Nome do Professor ${index + 1}`} 
                                    />
                                    <Button type="button" variant="ghost" size="icon" className="h-9 w-9 text-red-500 hover:text-red-400 shrink-0" onClick={() => removeTeacher(teacher.id)}>
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
                        <Label>Modo de Tarefa de Casa</Label>
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
                        <Label>Cor da Classe</Label>
                        <div className="flex items-center gap-2 mt-2">
                            {colorPresets.map(color => (
                                <button
                                    key={color}
                                    type="button"
                                    className={cn("w-7 h-7 rounded-full border-2 transition-all", editingClass.color === color ? 'border-white ring-2 ring-white/50' : 'border-transparent hover:border-white/50')}
                                    style={{backgroundColor: color}}
                                    onClick={() => setEditingClass(prev => prev ? {...prev, color} : null)}
                                />
                            ))}
                        </div>
                    </div>
                    {!isViewer && <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="secondary" onClick={() => setIsClassDialogOpen(false)}>Cancelar</Button>
                        <Button type="submit" className="bg-primary hover:bg-primary/90">{editingClass.id ? "Salvar Alterações" : "Criar Classe"}</Button>
                    </div>}
                </fieldset>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
