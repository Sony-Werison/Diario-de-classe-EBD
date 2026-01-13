
"use client";

import { useState, useEffect, useRef, useContext } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DataContext } from "@/contexts/DataContext";
import { SimulatedFullData } from "@/lib/data";


export default function SettingsPage() {
  const dataContext = useContext(DataContext);
  const { fullData: data, updateAndSaveData, isLoading, isDemo } = dataContext || { fullData: null, updateAndSaveData: () => {}, isLoading: true, isDemo: false };

  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [userRole, setUserRole] = useState<string>('');
  const [isClient, setIsClient] = useState(false);
  
  const [adminPassword, setAdminPassword] = useState('');
  const [teacherPassword, setTeacherPassword] = useState('');
  
  const isAdmin = userRole === 'admin' && !isDemo;


  useEffect(() => {
    setIsClient(true);
    const role = isDemo ? 'viewer' : sessionStorage.getItem('userRole') || 'admin';
    setUserRole(role);
  }, [isDemo]);
  
  useEffect(() => {
    if (data?.passwords) {
      setAdminPassword(data.passwords.admin);
      setTeacherPassword(data.passwords.teacher);
    }
  }, [data?.passwords]);

  const handlePasswordSave = () => {
    if (!isAdmin || !updateAndSaveData) {
      toast({ title: "Acesso negado", description: "Apenas administradores podem alterar senhas.", variant: "destructive" });
      return;
    }
    updateAndSaveData(prev => ({
      ...prev!,
      passwords: {
        admin: adminPassword,
        teacher: teacherPassword
      }
    }));
    toast({ title: "Senhas atualizadas!", description: "As novas senhas foram salvas com sucesso." });
  };
  

  const handleExportData = async () => {
    if (!isAdmin) return;
    if (!data) return;
    const dataStr = JSON.stringify(data, null, 2);
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
    if(!isAdmin) return;
    fileInputRef.current?.click();
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !isAdmin || !updateAndSaveData) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const importedData = JSON.parse(text) as SimulatedFullData;
        
        if (importedData && importedData.classes && importedData.lessons && importedData.studentRecords) {
           updateAndSaveData(() => importedData);
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
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  if (!isClient || isLoading) {
    return <div className="p-4 sm:p-6 text-white flex-1 flex flex-col items-center justify-center"><div className="text-slate-500">Carregando...</div></div>;
  }

  return (
    <div className="p-4 sm:p-6 text-white max-w-4xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Configurações</h1>
        <p className="text-slate-400">Gerencie as configurações gerais do aplicativo.</p>
      </header>
      
      <div className="space-y-8">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Gerenciamento de Senhas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-400">
              {isAdmin ? "Ajuste as senhas para os diferentes perfis de acesso." : "Visualização das senhas. Apenas administradores podem editar."}
            </p>
            <div className="space-y-4">
              <div>
                <Label htmlFor="admin-password">Senha do Administrador</Label>
                <Input id="admin-password" type="password" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} disabled={!isAdmin} className="bg-input border-border mt-1" />
              </div>
              <div>
                <Label htmlFor="teacher-password">Senha do Professor</Label>
                <Input id="teacher-password" type="password" value={teacherPassword} onChange={e => setTeacherPassword(e.target.value)} disabled={!isAdmin} className="bg-input border-border mt-1" />
              </div>
            </div>
            {isAdmin && <Button onClick={handlePasswordSave} className="mt-4">Salvar Senhas</Button>}
            {!isAdmin && <p className="text-xs text-yellow-400 mt-4">Você está no modo de {userRole === 'viewer' ? 'visualização' : 'professor'}. Não é possível alterar as senhas.</p>}
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Backup e Restauração</CardTitle>
          </CardHeader>
          <CardContent>
             <p className="text-sm text-slate-400 mb-4">Exporte ou importe todos os dados do aplicativo, incluindo turmas, alunos e registros.</p>
             <div className="flex flex-col sm:flex-row gap-2">
                <Button onClick={handleExportData} variant="outline" className="w-full" disabled={!isAdmin}>
                  <Download size={16} className="mr-2"/>
                  Exportar Backup
                </Button>
                <Button onClick={handleImportClick} variant="outline" className="w-full" disabled={!isAdmin}>
                  <Upload size={16} className="mr-2"/>
                  Importar Backup
                </Button>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  className="hidden"
                  accept=".json"
                  onChange={handleImportData}
                  disabled={!isAdmin}
                />
             </div>
             {!isAdmin && <p className="text-xs text-yellow-400 mt-4">Você está no modo de {userRole === 'viewer' ? 'visualização' : 'professor'}. Apenas administradores podem realizar backups.</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
