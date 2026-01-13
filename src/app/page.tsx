
"use client";

import { Church, Shield, Eye, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

const profiles = [
  {
    name: "Professor",
    icon: Church,
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

  const handleProfileSelect = (role: string) => {
    // Store role in sessionStorage to persist across page loads but not sessions
    sessionStorage.setItem('userRole', role);
    // For teacher profile, let's assume teacher-3 for demonstration
    if (role === 'teacher') {
        sessionStorage.setItem('teacherId', 'teacher-3');
    } else {
        sessionStorage.removeItem('teacherId');
    }
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
    </div>
  );
}
