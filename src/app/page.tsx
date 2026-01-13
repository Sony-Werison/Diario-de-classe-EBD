
"use client";

import { Church, Shield, Eye, ArrowRight, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useMemo, useEffect } from 'react';
import { getSimulatedData, Teacher } from '@/lib/data';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const profiles = [
  {
    name: "Professor",
    icon: User, // Changed icon to User for clarity
    description: "Acesso para registrar aulas e gerenciar as turmas atribuídas.",
    role: "teacher"
  },
  {
    name: "Administrativo",
    icon: Shield,
    description: "Acesso total para configurar classes e visualizar todos os relatórios.",
    role: "admin"
  },
  {
    name: "Visualização",
    icon: Eye,
    description: "Acesso somente para visualizar os relatórios e o calendário.",
    role: "viewer"
  }
];

export default function ProfileSelectionPage() {
  const router = useRouter();
  const [isTeacherSelectOpen, setIsTeacherSelectOpen] = useState(false);
  const [allTeachers, setAllTeachers] = useState<Teacher[]>([]);

  useEffect(() => {
    // Load all teachers from all classes on component mount
    const data = getSimulatedData();
    const teachers = data.classes.flatMap(c => c.teachers);
    // Remove duplicates
    const uniqueTeachers = Array.from(new Map(teachers.map(t => [t.id, t])).values());
    setAllTeachers(uniqueTeachers.sort((a,b) => a.name.localeCompare(b.name)));
  }, []);

  const handleProfileSelect = (role: string) => {
    if (role === 'teacher') {
      setIsTeacherSelectOpen(true);
    } else {
      sessionStorage.setItem('userRole', role);
      sessionStorage.removeItem('teacherId');
      router.push('/calendar');
    }
  };

  const handleTeacherSelect = (teacher: Teacher) => {
    sessionStorage.setItem('userRole', 'teacher');
    sessionStorage.setItem('teacherId', teacher.id);
    setIsTeacherSelectOpen(false);
    router.push('/calendar');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="text-center mb-10">
         <div className="inline-block p-4 bg-primary rounded-2xl mb-4">
            <Church size={40} className="text-primary-foreground" />
        </div>
        <h1 className="text-3xl font-bold text-white">EBD Júnior Tracker</h1>
        <p className="text-slate-400 mt-2">Selecione seu perfil para continuar</p>
      </div>

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6">
        {profiles.map((profile) => {
          const Icon = profile.icon;
          return (
            <button
              key={profile.name}
              onClick={() => handleProfileSelect(profile.role)}
              className="group bg-card border border-border rounded-xl p-6 text-left hover:border-primary hover:bg-primary/10 transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-slate-800 border border-slate-700 rounded-lg">
                    <Icon size={24} className="text-primary" />
                </div>
                 <ArrowRight size={20} className="text-slate-600 group-hover:text-primary transition-transform group-hover:translate-x-1" />
              </div>
              <h2 className="text-lg font-semibold text-white">{profile.name}</h2>
              <p className="text-sm text-slate-400 mt-1">{profile.description}</p>
            </button>
          );
        })}
      </div>

      <Dialog open={isTeacherSelectOpen} onOpenChange={setIsTeacherSelectOpen}>
        <DialogContent className="bg-card border-border text-white">
          <DialogHeader>
            <DialogTitle>Quem está acessando?</DialogTitle>
            <DialogDescription>
              Selecione o seu nome na lista para continuar.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto space-y-2 pr-2">
            {allTeachers.map(teacher => (
              <Button 
                key={teacher.id} 
                variant="outline" 
                className="w-full justify-start text-base"
                onClick={() => handleTeacherSelect(teacher)}
              >
                {teacher.name}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
