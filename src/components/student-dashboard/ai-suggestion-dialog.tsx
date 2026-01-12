"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BrainCircuit } from "lucide-react";
import { getAiSuggestions } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface AiSuggestionDialogProps {
  studentName: string;
  attendance: boolean;
  homework: boolean;
}

export function AiSuggestionDialog({
  studentName,
  attendance,
  homework,
}: AiSuggestionDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const { toast } = useToast();

  const handleFetchSuggestions = async () => {
    setIsLoading(true);
    setSuggestions([]);
    const attendanceRate = attendance ? 1 : 0;
    const homeworkCompletionRate = homework ? 1 : 0;
    
    const result = await getAiSuggestions(studentName, attendanceRate, homeworkCompletionRate);
    
    if (result.success && result.suggestions) {
      setSuggestions(result.suggestions);
    } else {
      toast({
        variant: "destructive",
        title: "Erro de IA",
        description: result.error || "Não foi possível buscar as sugestões.",
      });
      setIsOpen(false);
    }
    setIsLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-primary" onClick={handleFetchSuggestions}>
          <BrainCircuit size={18} />
          <span className="sr-only">Sugestões de IA</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-slate-800 border-slate-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BrainCircuit className="text-primary" />
            Sugestões para {studentName}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-[90%]" />
              <Skeleton className="h-4 w-full" />
            </div>
          ) : (
            <ul className="list-disc pl-5 space-y-2 text-slate-300">
              {suggestions.map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
              ))}
            </ul>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
