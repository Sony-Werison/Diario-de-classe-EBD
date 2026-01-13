
"use client";

import { Church, Shield, Eye, ArrowRight, User, PlayCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useContext, useEffect, useMemo } from 'react';
import { Teacher, ClassConfig, SimulatedFullData, getInitialData } from '@/lib/data';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { DataContext } from '@/contexts/DataContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import Image from 'next/image';


const profiles = [
  {
    name: "Professor",
    icon: User,
    description: "Acesso para registrar aulas e gerenciar as turmas atribuídas.",
    role: "teacher"
  },
  {
    name: "Visualização",
    icon: Eye,
    description: "Acesso somente para visualizar os relatórios e o calendário.",
    role: "viewer"
  },
  {
    name: "Administrativo",
    icon: Shield,
    description: "Acesso total para configurar classes e visualizar todos os relatórios.",
    role: "admin"
  }
];

type TeacherWithClass = Teacher & { className: string };

export default function ProfileSelectionPage() {
  const router = useRouter();
  const [isTeacherSelectOpen, setIsTeacherSelectOpen] = useState(false);
  const dataContext = useContext(DataContext);
  const { fullData } = dataContext || {};
  const passwords = fullData?.passwords;

  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  useEffect(() => {
    // Limpa a sessão sempre que o usuário volta para a tela de login
    sessionStorage.removeItem('userRole');
    sessionStorage.removeItem('teacherId');
  }, []);

  const handleProfileSelect = async (role: string) => {
    setPassword('');
    setPasswordError('');
    setSelectedRole(role);
  };

  const handlePasswordSubmit = () => {
    if (!selectedRole || !passwords) return;

    // The 'viewer' role doesn't have a password, it's direct access
    if (selectedRole === 'viewer') {
        sessionStorage.setItem('userRole', 'viewer');
        sessionStorage.removeItem('teacherId');
        setSelectedRole(null);
        router.push('/calendar');
        return;
    }

    const correctPassword = passwords[selectedRole as keyof typeof passwords];
    if (password === correctPassword) {
      if (selectedRole === 'admin') {
        sessionStorage.setItem('userRole', 'admin');
        sessionStorage.removeItem('teacherId');
        setSelectedRole(null);
        router.push('/calendar');
      } else if (selectedRole === 'teacher') {
        setSelectedRole(null);
        setIsTeacherSelectOpen(true);
      }
    } else {
      setPasswordError('Senha incorreta. Tente novamente.');
    }
  };

  const teachersByClass = useMemo(() => {
    if (!fullData) return new Map<string, TeacherWithClass[]>();

    const map = new Map<string, TeacherWithClass[]>();
    fullData.classes.forEach(c => {
        const teachersWithClass = c.teachers.map(t => ({...t, className: c.name}));
        map.set(c.name, teachersWithClass);
    });
    return map;
  }, [fullData]);

  const handleTeacherSelect = (teacher: Teacher) => {
    sessionStorage.setItem('userRole', 'teacher');
    sessionStorage.setItem('teacherId', teacher.id);
    setIsTeacherSelectOpen(false);
    router.push('/calendar');
  };
  
  if (dataContext && dataContext.isLoading && !fullData) {
      return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
            <div className="text-slate-400">Carregando dados do aplicativo...</div>
        </div>
      )
  }

  return (
    <div className={cn("min-h-screen flex flex-col items-center justify-center p-4 transition-all duration-500", 
        "bg-gradient-to-br from-slate-900 via-background to-background"
    )}>
      <div className="text-center mb-8">
         <Image src="/logo.png" alt="Logo" width={64} height={64} className="mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-white">Diário de classe EBD</h1>
        <p className="text-slate-400 mt-1">Selecione seu perfil para continuar</p>
      </div>

      <div className="w-full max-w-sm space-y-3">
        {profiles.map((profile) => {
          const Icon = profile.icon;
          return (
            <button
              key={profile.name}
              onClick={() => handleProfileSelect(profile.role)}
              className="w-full bg-card border border-border rounded-lg p-4 text-left transition-colors hover:bg-secondary disabled:opacity-50"
              disabled={!passwords && profile.role !== 'viewer'}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-slate-800 border border-slate-700 rounded-md">
                    <Icon size={20} className={cn("text-primary")} />
                </div>
                 <ArrowRight size={18} className="text-slate-600" />
              </div>
              <h2 className="text-md font-semibold text-white">{profile.name}</h2>
              <p className="text-xs text-slate-400 mt-1">{profile.description}</p>
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
          <div className="max-h-[60vh] overflow-y-auto space-y-4 pr-2">
            {Array.from(teachersByClass.entries()).map(([className, teachers]) => (
                <div key={className}>
                    <h3 className="text-sm font-semibold text-primary mb-2">{className}</h3>
                    <div className="space-y-2">
                        {teachers.map(teacher => (
                            <Button 
                                key={teacher.id} 
                                variant="outline" 
                                className="w-full justify-start text-base hover:bg-transparent hover:text-white focus-visible:ring-0 focus-visible:ring-offset-0"
                                onClick={() => handleTeacherSelect(teacher)}
                            >
                                {teacher.name}
                            </Button>
                        ))}
                    </div>
                </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
      
      <Dialog open={!!selectedRole} onOpenChange={(isOpen) => !isOpen && setSelectedRole(null)}>
        <DialogContent className="bg-card border-border text-white">
          <DialogHeader>
            <DialogTitle>Acesso Restrito</DialogTitle>
            <DialogDescription>
              {selectedRole === 'viewer' ? "Acesso somente leitura. Nenhuma senha é necessária." : `Por favor, insira a senha para o perfil de ${profiles.find(p => p.role === selectedRole)?.name}.`}
            </DialogDescription>
          </DialogHeader>
          {selectedRole !== 'viewer' ? (
              <>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                      className="bg-input border-border"
                    />
                  </div>
                  {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setSelectedRole(null)}>Cancelar</Button>
                  <Button onClick={handlePasswordSubmit}>Continuar</Button>
                </div>
              </>
          ) : (
             <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setSelectedRole(null)}>Cancelar</Button>
                <Button onClick={handlePasswordSubmit}>Entrar</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
